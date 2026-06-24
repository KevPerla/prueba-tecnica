import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://kev-user12:L9m@ka12-@@localhost:5433/ecommerce'
});

async function buildClean() {
  console.log('Construyendo capa clean...');

  await client.query(`
    CREATE SCHEMA IF NOT EXISTS clean;

    DROP TABLE IF EXISTS clean.orders;
    CREATE TABLE clean.orders AS
    SELECT
      order_id,
      customer_id,
      order_status,
      NULLIF(order_purchase_timestamp, '')::timestamp  AS order_purchase_timestamp,
      NULLIF(order_approved_at, '')::timestamp          AS order_approved_at,
      NULLIF(order_delivered_carrier_date, '')::timestamp AS order_delivered_carrier_date,
      NULLIF(order_delivered_customer_date, '')::timestamp AS order_delivered_customer_date,
      NULLIF(order_estimated_delivery_date, '')::timestamp AS order_estimated_delivery_date
    FROM raw.raw_orders
    WHERE order_id IS NOT NULL
      AND customer_id IS NOT NULL
      AND order_purchase_timestamp IS NOT NULL
      AND order_purchase_timestamp != '';

    DROP TABLE IF EXISTS clean.order_items;
    CREATE TABLE clean.order_items AS
    SELECT
      order_id,
      order_item_id,
      product_id,
      seller_id,
      price,
      freight_value
    FROM raw.raw_order_items
    WHERE order_id IS NOT NULL
      AND product_id IS NOT NULL
      AND price IS NOT NULL
      AND price > 0;

    DROP TABLE IF EXISTS clean.payments;
    CREATE TABLE clean.payments AS
    SELECT
      order_id,
      payment_sequential,
      payment_type,
      payment_installments,
      payment_value
    FROM raw.raw_order_payments
    WHERE order_id IS NOT NULL
      AND payment_value IS NOT NULL
      AND payment_value > 0;

    DROP TABLE IF EXISTS clean.products;
    CREATE TABLE clean.products AS
    SELECT
      product_id,
      COALESCE(product_category_name, 'unknown') AS category_name
    FROM raw.raw_products
    WHERE product_id IS NOT NULL;

    DROP TABLE IF EXISTS clean.customers;
    CREATE TABLE clean.customers AS
    SELECT
      customer_id,
      customer_unique_id,
      customer_state,
      customer_city
    FROM raw.raw_customers
    WHERE customer_id IS NOT NULL;
  `);

  console.log('Capa clean lista');
}

async function buildGoldDims() {
  console.log('Construyendo dimensiones gold...');

  await client.query(`
    DELETE FROM gold.dim_customer;
    INSERT INTO gold.dim_customer (customer_id, state, city)
    SELECT customer_id, customer_state, customer_city
    FROM clean.customers
    ON CONFLICT DO NOTHING;

    DELETE FROM gold.dim_product;
    INSERT INTO gold.dim_product (product_id, category_name)
    SELECT product_id, category_name
    FROM clean.products
    ON CONFLICT DO NOTHING;

    DELETE FROM gold.dim_order;
    INSERT INTO gold.dim_order (order_id, status, purchase_date, delivered_date, estimated_date)
    SELECT
      order_id,
      order_status,
      order_purchase_timestamp,
      order_delivered_customer_date,
      order_estimated_delivery_date
    FROM clean.orders
    ON CONFLICT DO NOTHING;

    DELETE FROM gold.dim_date;
    INSERT INTO gold.dim_date (full_date, year, month, day, week, quarter)
    SELECT DISTINCT
      order_purchase_timestamp::date AS full_date,
      EXTRACT(YEAR FROM order_purchase_timestamp)::int,
      EXTRACT(MONTH FROM order_purchase_timestamp)::int,
      EXTRACT(DAY FROM order_purchase_timestamp)::int,
      EXTRACT(WEEK FROM order_purchase_timestamp)::int,
      EXTRACT(QUARTER FROM order_purchase_timestamp)::int
    FROM clean.orders
    ON CONFLICT DO NOTHING;
  `);

  console.log('Dimensiones gold listas');
}

async function buildGoldFact() {
  console.log('Construyendo fact_sales...');

  await client.query(`
    DELETE FROM gold.fact_sales;

    INSERT INTO gold.fact_sales (
      order_id,
      order_item_id,
      item_price,
      freight_value,
      payment_value_allocated,
      is_delivered,
      is_canceled,
      is_on_time,
      date_id,
      customer_id,
      product_id
    )
    SELECT
      oi.order_id,
      oi.order_item_id,
      oi.price AS item_price,
      oi.freight_value,
      ROUND(
        COALESCE(p.total_payment, 0) *
        (oi.price / NULLIF(order_totals.total_price, 0))
      , 2) AS payment_value_allocated,
      -- Flags
      CASE WHEN o.order_status = 'delivered' THEN true ELSE false END AS is_delivered,
      CASE WHEN o.order_status = 'canceled' THEN true ELSE false END AS is_canceled,
      CASE
        WHEN o.order_delivered_customer_date IS NOT NULL
          AND o.order_estimated_delivery_date IS NOT NULL
          AND o.order_delivered_customer_date <= o.order_estimated_delivery_date
        THEN true ELSE false
      END AS is_on_time,
      dd.date_id,
      o.customer_id,
      oi.product_id
    FROM clean.order_items oi
    JOIN clean.orders o ON oi.order_id = o.order_id
    JOIN gold.dim_date dd ON dd.full_date = o.order_purchase_timestamp::date
    JOIN gold.dim_customer dc ON dc.customer_id = o.customer_id
    JOIN gold.dim_product dp ON dp.product_id = oi.product_id
    LEFT JOIN (
      SELECT order_id, SUM(payment_value) AS total_payment
      FROM clean.payments
      GROUP BY order_id
    ) p ON p.order_id = oi.order_id
    LEFT JOIN (
      SELECT order_id, SUM(price) AS total_price
      FROM clean.order_items
      GROUP BY order_id
    ) order_totals ON order_totals.order_id = oi.order_id
    ON CONFLICT DO NOTHING;
  `);

  console.log('fact_sales lista');
}

async function main() {
  await client.connect();
  console.log('Conectado a PostgreSQL');

  await buildClean();
  await buildGoldDims();
  await buildGoldFact();

  await client.end();
  console.log('ETL completo');
}

main().catch(console.error);