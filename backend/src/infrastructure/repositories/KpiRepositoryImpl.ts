import { PrismaClient } from '@prisma/client';
import { KpiRepository } from '../../domain/ports/KpiRepository';
import { KpiResult, RevenueTrendPoint, TopProduct, FilterParams } from '../../domain/entities/Kpi';

export class KpiRepositoryImpl implements KpiRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private buildWhereClause(filters: FilterParams): string {
    const conditions: string[] = [
      `dd.full_date >= '${filters.from}'::date`,
      `dd.full_date <= '${filters.to}'::date`
    ];
    if (filters.orderStatus) conditions.push(`do2.status = '${filters.orderStatus}'`);
    if (filters.categoryName) conditions.push(`dp.category_name = '${filters.categoryName}'`);
    if (filters.customerState) conditions.push(`dc.state = '${filters.customerState}'`);
    return conditions.join(' AND ');
  }

  async getKpis(filters: FilterParams): Promise<KpiResult> {
    const where = this.buildWhereClause(filters);

    const result = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT
        COALESCE(SUM(fs.item_price), 0)::float AS gmv,
        COALESCE(SUM(fs.payment_value_allocated), 0)::float AS revenue,
        COUNT(DISTINCT fs.order_id)::int AS orders,
        COALESCE(SUM(fs.freight_value), 0)::float AS shipping,
        COUNT(fs.order_item_id)::int AS total_items,
        COUNT(DISTINCT CASE WHEN fs.is_canceled THEN fs.order_id END)::int AS canceled_orders,
        COUNT(DISTINCT CASE WHEN fs.is_delivered AND fs.is_on_time THEN fs.order_id END)::int AS on_time_orders,
        COUNT(DISTINCT CASE WHEN fs.is_delivered THEN fs.order_id END)::int AS delivered_orders
      FROM gold.fact_sales fs
      JOIN gold.dim_date dd ON dd.date_id = fs.date_id
      JOIN gold.dim_order do2 ON do2.order_id = fs.order_id
      JOIN gold.dim_product dp ON dp.product_id = fs.product_id
      JOIN gold.dim_customer dc ON dc.customer_id = fs.customer_id
      WHERE ${where}
    `);

    const row = result[0];
    const orders = row.orders || 0;
    const deliveredOrders = row.delivered_orders || 0;

    return {
      gmv: row.gmv,
      revenue: row.revenue,
      orders,
      aov: orders > 0 ? row.revenue / orders : 0,
      itemsPerOrder: orders > 0 ? row.total_items / orders : 0,
      cancellationRate: orders > 0 ? row.canceled_orders / orders : 0,
      onTimeDelivery: deliveredOrders > 0 ? row.on_time_orders / deliveredOrders : 0
    };
  }

  async getRevenueTrend(filters: FilterParams, grain: 'day' | 'week'): Promise<RevenueTrendPoint[]> {
    const where = this.buildWhereClause(filters);
    const dateTrunc = grain === 'week' ? 'week' : 'day';

    const result = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT
        DATE_TRUNC('${dateTrunc}', dd.full_date)::date::text AS date,
        COALESCE(SUM(fs.payment_value_allocated), 0)::float AS revenue,
        COUNT(DISTINCT fs.order_id)::int AS orders
      FROM gold.fact_sales fs
      JOIN gold.dim_date dd ON dd.date_id = fs.date_id
      JOIN gold.dim_order do2 ON do2.order_id = fs.order_id
      JOIN gold.dim_product dp ON dp.product_id = fs.product_id
      JOIN gold.dim_customer dc ON dc.customer_id = fs.customer_id
      WHERE ${where}
      GROUP BY DATE_TRUNC('${dateTrunc}', dd.full_date)
      ORDER BY date ASC
    `);

    return result.map(row => ({
      date: row.date,
      revenue: row.revenue,
      orders: row.orders
    }));
  }

  async getTopProducts(filters: FilterParams, metric: 'gmv' | 'revenue', limit: number): Promise<TopProduct[]> {
    const where = this.buildWhereClause(filters);
    const orderBy = metric === 'gmv' ? 'gmv' : 'revenue';

    const result = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT
        fs.product_id,
        dp.category_name,
        COALESCE(SUM(fs.item_price), 0)::float AS gmv,
        COALESCE(SUM(fs.payment_value_allocated), 0)::float AS revenue
      FROM gold.fact_sales fs
      JOIN gold.dim_date dd ON dd.date_id = fs.date_id
      JOIN gold.dim_order do2 ON do2.order_id = fs.order_id
      JOIN gold.dim_product dp ON dp.product_id = fs.product_id
      JOIN gold.dim_customer dc ON dc.customer_id = fs.customer_id
      WHERE ${where}
      GROUP BY fs.product_id, dp.category_name
      ORDER BY ${orderBy} DESC
      LIMIT ${limit}
    `);

    return result.map(row => ({
      productId: row.product_id,
      categoryName: row.category_name,
      gmv: row.gmv,
      revenue: row.revenue
    }));
  }
}