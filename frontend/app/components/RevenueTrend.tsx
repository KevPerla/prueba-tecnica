'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RevenueTrendPoint } from '../types/kpi';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f1117] border border-slate-700 rounded-xl p-3 text-sm shadow-2xl">
        <p className="text-slate-400 mb-2 text-xs">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }} className="font-semibold">
            {entry.name === 'Revenue'
              ? `Revenue: $${entry.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
              : `Orders: ${entry.value.toLocaleString('en-US')}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function RevenueTrend({
  data,
  grain,
  onGrainChange,
}: {
  data: RevenueTrendPoint[];
  grain: 'day' | 'week';
  onGrainChange: (g: 'day' | 'week') => void;
}) {
  return (
    <div className="bg-[#0f1117] border border-slate-800 rounded-2xl p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-white font-semibold">Revenue & orders trend</h2>
          <p className="text-slate-500 text-xs mt-0.5">Evolución temporal de ingresos y órdenes</p>
        </div>
        <div className="flex bg-[#080a0f] border border-slate-800 rounded-lg p-1">
          <button
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${grain === 'week' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            onClick={() => onGrainChange('week')}
          >
            Semana
          </button>
          <button
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${grain === 'day' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            onClick={() => onGrainChange('day')}
          >
            Día
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#0f1829" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#64748b', paddingTop: '12px' }} />
          <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#818cf8" strokeWidth={2} name="Revenue" dot={false} activeDot={{ r: 3, fill: '#818cf8' }} />
          <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#34d399" strokeWidth={2} name="Orders" dot={false} activeDot={{ r: 3, fill: '#34d399' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}