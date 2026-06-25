'use client';
import { Filters } from '../types/kpi';

const STATES = ['SP','RJ','MG','RS','PR','SC','BA','GO','ES','PE','CE','MT','MS','MA','RO','PB','AM','PI','AL','SE','RN','TO','AC','AP','RR','DF','PA'];

const CATEGORIES = [
  'cama_mesa_banho','beleza_saude','esporte_lazer','informatica_acessorios',
  'moveis_decoracao','utilidades_domesticas','relogios_presentes','telefonia',
  'ferramentas_jardim','automotivo','brinquedos','cool_stuff','perfumaria',
  'bebes','eletronicos','livros_tecnicos','eletrodomesticos','fashion_bolsas_e_acessorios',
  'papelaria','pet_shop','construcao_ferramentas_seguranca','musica','unknown'
];

export default function FiltersPanel({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap gap-4 items-end">
      <div className="flex flex-col gap-1.5">
        <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">Desde</label>
        <input
          type="date"
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
          value={filters.from}
          onChange={(e) => onChange({ ...filters, from: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">Hasta</label>
        <input
          type="date"
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
          value={filters.to}
          onChange={(e) => onChange({ ...filters, to: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">Estado de orden</label>
        <select
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
          value={filters.orderStatus || ''}
          onChange={(e) => onChange({ ...filters, orderStatus: e.target.value || undefined })}
        >
          <option value="">Todos</option>
          <option value="delivered">Delivered</option>
          <option value="shipped">Shipped</option>
          <option value="canceled">Canceled</option>
          <option value="processing">Processing</option>
          <option value="invoiced">Invoiced</option>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">Estado del cliente</label>
        <select
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
          value={filters.customerState || ''}
          onChange={(e) => onChange({ ...filters, customerState: e.target.value || undefined })}
        >
          <option value="">Todos</option>
          {STATES.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">Categoría</label>
        <select
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
          value={filters.categoryName || ''}
          onChange={(e) => onChange({ ...filters, categoryName: e.target.value || undefined })}
        >
          <option value="">Todas</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>
    </div>
  );
}