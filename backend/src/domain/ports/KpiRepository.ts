import { KpiResult, RevenueTrendPoint, TopProduct, FilterParams } from '../entities/Kpi';

export interface KpiRepository {
  getKpis(filters: FilterParams): Promise<KpiResult>;
  getRevenueTrend(filters: FilterParams, grain: 'day' | 'week'): Promise<RevenueTrendPoint[]>;
  getTopProducts(filters: FilterParams, metric: 'gmv' | 'revenue', limit: number): Promise<TopProduct[]>;
}