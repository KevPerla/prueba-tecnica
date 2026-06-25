'use client';
import { useState, useEffect } from 'react';
import { Filters, KpiResult, RevenueTrendPoint, TopProduct } from './types/kpi';
import { fetchKpis, fetchRevenueTrend, fetchTopProducts } from './lib/api';
import KpiCards from './components/KpiCards';
import RevenueTrend from './components/RevenueTrend';
import TopProducts from './components/TopProducts';
import FiltersPanel from './components/Filters';

function getPreviousPeriod(filters: Filters): Filters {
  const from = new Date(filters.from);
  const to = new Date(filters.to);
  const diff = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - diff);
  return {
    ...filters,
    from: prevFrom.toISOString().split('T')[0],
    to: prevTo.toISOString().split('T')[0],
  };
}

export default function Home() {
  const [filters, setFilters] = useState<Filters>({ from: '2017-01-01', to: '2018-12-31' });
  const [grain, setGrain] = useState<'day' | 'week'>('week');
  const [metric, setMetric] = useState<'gmv' | 'revenue'>('revenue');
  const [kpis, setKpis] = useState<KpiResult | null>(null);
  const [previousKpis, setPreviousKpis] = useState<KpiResult | null>(null);
  const [trend, setTrend] = useState<RevenueTrendPoint[]>([]);
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
  setLoading(true);
  setError(null);
  try {
    const prevFilters = getPreviousPeriod(filters);
    const [kpiData, prevKpiData, trendData, productsData] = await Promise.all([
      fetchKpis(filters),
      fetchKpis(prevFilters),
      fetchRevenueTrend(filters, grain),
      fetchTopProducts(filters, metric),
    ]);
    setKpis(kpiData);
    setPreviousKpis(prevKpiData);
    setTrend(trendData);
    setProducts(productsData);
  } catch (err: any) {
    setError('Error al cargar los datos. Verifica que el backend esté corriendo.');
  } finally {
    setLoading(false);
  }
}

  useEffect(() => { loadData(); }, [filters, grain, metric]);

  return (
    <main className="min-h-screen bg-[#080a0f] p-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-5">

        {}
        <div className="flex justify-between items-center py-2">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Sales Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">E-Commerce </p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              Actualizando...
            </div>
          )}
        </div>

        {}
        <FiltersPanel filters={filters} onChange={setFilters} />

        {}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {}
        {kpis && <KpiCards kpis={kpis} previousKpis={previousKpis} trend={trend} />}

        {}
        <RevenueTrend data={trend} grain={grain} onGrainChange={setGrain} />

        {}
        <TopProducts data={products} metric={metric} onMetricChange={setMetric} />

      </div>
    </main>
  );
}