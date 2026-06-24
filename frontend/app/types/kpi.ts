export interface KpiResult {
  gmv: number;
  revenue: number;
  orders: number;
  aov: number;
  itemsPerOrder: number;
  cancellationRate: number;
  onTimeDelivery: number;
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  productId: string;
  categoryName: string;
  gmv: number;
  revenue: number;
}

export interface Filters {
  from: string;
  to: string;
  orderStatus?: string;
  categoryName?: string;
  customerState?: string;
}