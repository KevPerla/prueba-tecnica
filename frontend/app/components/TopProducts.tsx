'use client';
import { TopProduct } from '../types/kpi';

export default function TopProducts({
  data,
  metric,
  onMetricChange,
}: {
  data: TopProduct[];
  metric: 'gmv' | 'revenue';
  onMetricChange: (metric: 'gmv' | 'revenue') => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Top Products</h2>
        <select
          className="border rounded px-3 py-1 text-sm text-gray-600"
          value={metric}
          onChange={(e) => onMetricChange(e.target.value as 'gmv' | 'revenue')}
        >
          <option value="revenue">Revenue</option>
          <option value="gmv">GMV</option>
        </select>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="pb-2">#</th>
            <th className="pb-2">Product ID</th>
            <th className="pb-2">Category</th>
            <th className="pb-2">GMV</th>
            <th className="pb-2">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p, i) => (
            <tr key={p.productId} className="border-b hover:bg-gray-50">
              <td className="py-2 text-gray-400">{i + 1}</td>
              <td className="py-2 font-mono text-xs text-gray-600">{p.productId.slice(0, 8)}...</td>
              <td className="py-2 text-gray-700">{p.categoryName || 'unknown'}</td>
              <td className="py-2 text-gray-700">${p.gmv.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
              <td className="py-2 text-gray-700">${p.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}