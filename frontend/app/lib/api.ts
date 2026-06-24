import axios from 'axios';
import { KpiResult, RevenueTrendPoint, TopProduct, Filters } from '../types/kpi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function buildParams(filters: Filters, extra?: Record<string, string>) {
  const params: Record<string, string> = {
    from: filters.from,
    to: filters.to,
  };
  if (filters.orderStatus) params.orderStatus = filters.orderStatus;
  if (filters.categoryName) params.categoryName = filters.categoryName;
  if (filters.customerState) params.customerState = filters.customerState;
  return { ...params, ...extra };
}

export async function fetchKpis(filters: Filters): Promise<KpiResult> {
  const { data } = await axios.get(`${API_URL}/kpis`, { params: buildParams(filters) });
  return data;
}

export async function fetchRevenueTrend(filters: Filters, grain: 'day' | 'week'): Promise<RevenueTrendPoint[]> {
  const { data } = await axios.get(`${API_URL}/trend/revenue`, {
    params: buildParams(filters, { grain }),
  });
  return data;
}

export async function fetchTopProducts(filters: Filters, metric: 'gmv' | 'revenue', limit = 10): Promise<TopProduct[]> {
  const { data } = await axios.get(`${API_URL}/rankings/products`, {
    params: buildParams(filters, { metric, limit: String(limit) }),
  });
  return data;
}