'use client';
import { useState, useEffect } from 'react';
import { Filters, KpiResult, RevenueTrendPoint, TopProduct } from './types/kpi';
import { fetchKpis, fetchRevenueTrend, fetchTopProducts } from './lib/api';
import KpiCards from './components/KpiCards';
import RevenueTrend from './components/RevenueTrend';
import TopProducts from './components/TopProducts';
import FiltersPanel from './components/Filters';

export default function Home() {
  const [filters, setFilters] = useState<Filters>({
    from: '2017-01-01',
    to: '2018-12-31',
  });
  const [grain, setGrain] = useState<'day' | 'week'>('week');
  const [metric, setMetric] = useState<'gmv' | 'revenue'>('revenue');
  const [kpis, setKpis] = useState<KpiResult | null>(null);
  const [trend, setTrend] = useState<RevenueTrendPoint[]>([]);
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [kpiData, trendData, productsData] = await Promise.all([
        fetchKpis(filters),
        fetchRevenueTrend(filters, grain),
        fetchTopProducts(filters, metric),
      ]);
      setKpis(kpiData);
      setTrend(trendData);
      setProducts(productsData);
    } catch (err: any) {
      setError('Error al cargar los datos. Verifica que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [filters, grain, metric]);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Sales Dashboard</h1>
          <select
            className="border rounded px-3 py-1 text-sm text-gray-700 bg-white shadow"
            value={grain}
            onChange={(e) => setGrain(e.target.value as 'day' | 'week')}
          >
            <option value="week">Por semana</option>
            <option value="day">Por día</option>
          </select>
        </div>

        <FiltersPanel filters={filters} onChange={setFilters} />

        {error && (
          <div className="bg-red-100 text-red-700 rounded-xl p-4">{error}</div>
        )}

        {loading ? (
          <div className="text-center text-gray-500 py-20">Cargando datos...</div>
        ) : (
          <>
            {kpis && <KpiCards kpis={kpis} />}
            <RevenueTrend data={trend} />
            <TopProducts data={products} metric={metric} onMetricChange={setMetric} />
          </>
        )}

      </div>
    </main>
  );
}