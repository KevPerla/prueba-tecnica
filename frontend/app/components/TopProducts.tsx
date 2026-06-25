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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-white font-semibold text-lg">Top Products</h2>
          <p className="text-slate-400 text-sm mt-1">Ranking por métrica seleccionada</p>
        </div>
        <div className="flex bg-slate-800 rounded-lg p-1">
          <button
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${metric === 'revenue' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            onClick={() => onMetricChange('revenue')}
          >
            Revenue
          </button>
          <button
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${metric === 'gmv' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            onClick={() => onMetricChange('gmv')}
          >
            GMV
          </button>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 border-b border-slate-800">
            <th className="pb-3 font-medium">#</th>
            <th className="pb-3 font-medium">Product ID</th>
            <th className="pb-3 font-medium">Categoría</th>
            <th className="pb-3 font-medium text-right">GMV</th>
            <th className="pb-3 font-medium text-right">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p, i) => (
            <tr key={p.productId} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
              <td className="py-3 text-slate-500 font-mono">{String(i + 1).padStart(2, '0')}</td>
              <td className="py-3 font-mono text-xs text-indigo-400">{p.productId.slice(0, 12)}...</td>
              <td className="py-3">
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs">
                  {(p.categoryName || 'unknown').replace(/_/g, ' ')}
                </span>
              </td>
              <td className="py-3 text-right text-slate-300">
                ${p.gmv.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </td>
              <td className="py-3 text-right text-emerald-400 font-medium">
                ${p.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}