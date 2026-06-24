import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://kev-user12:L9m@ka12-@@localhost:5433/ecommerce'
});

async function loadCSV(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const records: any[] = [];
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, skip_empty_lines: true, trim: true }))
      .on('data', (row) => records.push(row))
      .on('end', () => resolve(records))
      .on('error', reject);
  });
}

async function seedOrders() {
  console.log('Cargando orders...');
  const rows = await loadCSV(path.join(__dirname, '../../../data/olist_orders_dataset.csv'));
  for (const row of rows) {
    await client.query(
      `INSERT INTO raw.raw_orders VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING`,
      [
        row.order_id,
        row.customer_id,
        row.order_status,
        row.order_purchase_timestamp || null,
        row.order_approved_at || null,
        row.order_delivered_carrier_date || null,
        row.order_delivered_customer_date || null,
        row.order_estimated_delivery_date || null
      ]
    );
  }
  console.log(`Orders: ${rows.length} filas`);
}

async function seedOrderItems() {
  console.log('Cargando order_items...');
  const rows = await loadCSV(path.join(__dirname, '../../../data/olist_order_items_dataset.csv'));
  for (const row of rows) {
    await client.query(
      `INSERT INTO raw.raw_order_items VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
      [
        row.order_id,
        parseInt(row.order_item_id),
        row.product_id,
        row.seller_id,
        row.shipping_limit_date || null,
        parseFloat(row.price) || null,
        parseFloat(row.freight_value) || null
      ]
    );
  }
  console.log(`Order items: ${rows.length} filas`);
}

async function seedPayments() {
  console.log('Cargando payments...');
  const rows = await loadCSV(path.join(__dirname, '../../../data/olist_order_payments_dataset.csv'));
  for (const row of rows) {
    await client.query(
      `INSERT INTO raw.raw_order_payments VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
      [
        row.order_id,
        parseInt(row.payment_sequential),
        row.payment_type || null,
        parseInt(row.payment_installments) || null,
        parseFloat(row.payment_value) || null
      ]
    );
  }
  console.log(`Payments: ${rows.length} filas`);
}

async function seedProducts() {
  console.log('Cargando products...');
  const rows = await loadCSV(path.join(__dirname, '../../../data/olist_products_dataset.csv'));
  for (const row of rows) {
    await client.query(
      `INSERT INTO raw.raw_products VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT DO NOTHING`,
      [
        row.product_id,
        row.product_category_name || null,
        parseInt(row.product_name_lenght) || null,
        parseInt(row.product_description_lenght) || null,
        parseInt(row.product_photos_qty) || null,
        parseInt(row.product_weight_g) || null,
        parseInt(row.product_length_cm) || null,
        parseInt(row.product_height_cm) || null,
        parseInt(row.product_width_cm) || null
      ]
    );
  }
  console.log(`Products: ${rows.length} filas`);
}

async function seedCustomers() {
  console.log('Cargando customers...');
  const rows = await loadCSV(path.join(__dirname, '../../../data/olist_customers_dataset.csv'));
  for (const row of rows) {
    await client.query(
      `INSERT INTO raw.raw_customers VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
      [
        row.customer_id,
        row.customer_unique_id || null,
        row.customer_zip_code_prefix || null,
        row.customer_city || null,
        row.customer_state || null
      ]
    );
  }
  console.log(`Customers: ${rows.length} filas`);
}

async function main() {
  await client.connect();
  console.log('Conectado a PostgreSQL');

  await seedOrders();
  await seedOrderItems();
  await seedPayments();
  await seedProducts();
  await seedCustomers();

  await client.end();
  console.log('Carga completa de datos raw');
}

main().catch(console.error);