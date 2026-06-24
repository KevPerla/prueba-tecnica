'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RevenueTrendPoint } from '../types/kpi';

export default function RevenueTrend({ data }: { data: RevenueTrendPoint[] }) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Revenue & Orders Trend</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#6366f1" name="Revenue" dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#f59e0b" name="Orders" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}