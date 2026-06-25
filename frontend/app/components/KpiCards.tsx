'use client';
import { KpiResult, RevenueTrendPoint } from '../types/kpi';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

function Sparkline({ data, color }: { data: { value: number }[]; color: string }) {
  if (!data || data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={36}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
        />
        <Tooltip content={() => null} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function Delta({ current, previous }: { current: number; previous: number }) {
  if (!previous) return null;
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  const positive = pct >= 0;
  return (
    <span className={`text-xs font-medium flex items-center gap-1 ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
      {positive ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}% periodo anterior
    </span>
  );
}

interface CardProps {
  title: string;
  value: string;
  subtitle: string;
  current: number;
  previous: number | null;
  sparkline: { value: number }[];
  color: string;
  sparkColor: string;
  borderColor: string;
}

function Card({ title, value, subtitle, current, previous, sparkline, color, sparkColor, borderColor }: CardProps) {
  return (
    <div className={`bg-[#0d0f14] border ${borderColor} rounded-xl p-4 flex flex-col gap-1.5 hover:border-opacity-70 transition-all`}>
      <span className="text-slate-500 text-xs font-semibold uppercase tracking-widest">{title}</span>
      <span className={`text-2xl font-bold tracking-tight ${color}`}>{value}</span>
      {previous !== null && <Delta current={current} previous={previous} />}
      <span className="text-slate-600 text-xs">{subtitle}</span>
      <div className="mt-1 opacity-50">
        <Sparkline data={sparkline} color={sparkColor} />
      </div>
    </div>
  );
}

export default function KpiCards({
  kpis,
  previousKpis,
  trend,
}: {
  kpis: KpiResult;
  previousKpis: KpiResult | null;
  trend: RevenueTrendPoint[];
}) {
  const revenueSparkline = trend.map((t) => ({ value: t.revenue }));
  const ordersSparkline = trend.map((t) => ({ value: t.orders }));

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card
        title="GMV"
        value={`$${(kpis.gmv / 1_000_000).toFixed(2)}M`}
        subtitle="Gross Merchandise Value"
        current={kpis.gmv}
        previous={previousKpis?.gmv ?? null}
        sparkline={revenueSparkline}
        color="text-indigo-400"
        sparkColor="#818cf8"
        borderColor="border-indigo-900/50"
      />
      <Card
        title="Revenue"
        value={`$${(kpis.revenue / 1_000_000).toFixed(2)}M`}
        subtitle="Pagos reales recibidos"
        current={kpis.revenue}
        previous={previousKpis?.revenue ?? null}
        sparkline={revenueSparkline}
        color="text-emerald-400"
        sparkColor="#34d399"
        borderColor="border-emerald-900/50"
      />
      <Card
        title="Orders"
        value={kpis.orders.toLocaleString('en-US')}
        subtitle="Órdenes únicas"
        current={kpis.orders}
        previous={previousKpis?.orders ?? null}
        sparkline={ordersSparkline}
        color="text-sky-400"
        sparkColor="#38bdf8"
        borderColor="border-sky-900/50"
      />
      <Card
        title="AOV"
        value={`$${kpis.aov.toFixed(2)}`}
        subtitle="Valor promedio por orden"
        current={kpis.aov}
        previous={previousKpis?.aov ?? null}
        sparkline={revenueSparkline}
        color="text-violet-400"
        sparkColor="#a78bfa"
        borderColor="border-violet-900/50"
      />
      <Card
        title="Items / Order"
        value={kpis.itemsPerOrder.toFixed(2)}
        subtitle="Promedio de ítems"
        current={kpis.itemsPerOrder}
        previous={previousKpis?.itemsPerOrder ?? null}
        sparkline={ordersSparkline}
        color="text-amber-400"
        sparkColor="#fbbf24"
        borderColor="border-amber-900/50"
      />
      <Card
        title="Cancellation Rate"
        value={`${(kpis.cancellationRate * 100).toFixed(2)}%`}
        subtitle="Órdenes canceladas / total"
        current={kpis.cancellationRate}
        previous={previousKpis?.cancellationRate ?? null}
        sparkline={ordersSparkline}
        color="text-rose-400"
        sparkColor="#fb7185"
        borderColor="border-rose-900/50"
      />
      <Card
        title="On-Time Delivery"
        value={`${(kpis.onTimeDelivery * 100).toFixed(1)}%`}
        subtitle="Entregas antes de fecha estimada"
        current={kpis.onTimeDelivery}
        previous={previousKpis?.onTimeDelivery ?? null}
        sparkline={revenueSparkline}
        color="text-teal-400"
        sparkColor="#2dd4bf"
        borderColor="border-teal-900/50"
      />
    </div>
  );
}