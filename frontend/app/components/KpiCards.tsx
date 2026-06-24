'use client';
import { KpiResult } from '../types/kpi';

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-1">
      <span className="text-sm text-gray-500">{title}</span>
      <span className="text-2xl font-bold text-gray-800">{value}</span>
    </div>
  );
}

export default function KpiCards({ kpis }: { kpis: KpiResult }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card title="GMV" value={`$${kpis.gmv.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
      <Card title="Revenue" value={`$${kpis.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
      <Card title="Orders" value={kpis.orders.toLocaleString('en-US')} />
      <Card title="AOV" value={`$${kpis.aov.toFixed(2)}`} />
      <Card title="Items per Order" value={kpis.itemsPerOrder.toFixed(2)} />
      <Card title="Cancellation Rate" value={`${(kpis.cancellationRate * 100).toFixed(2)}%`} />
      <Card title="On-Time Delivery" value={`${(kpis.onTimeDelivery * 100).toFixed(1)}%`} />
    </div>
  );
}