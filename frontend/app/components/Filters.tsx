'use client';
import { Filters } from '../types/kpi';

export default function FiltersPanel({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex flex-wrap gap-4 items-end">
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-500">Desde</label>
        <input
          type="date"
          className="border rounded px-3 py-1 text-sm text-gray-700"
          value={filters.from}
          onChange={(e) => onChange({ ...filters, from: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-500">Hasta</label>
        <input
          type="date"
          className="border rounded px-3 py-1 text-sm text-gray-700"
          value={filters.to}
          onChange={(e) => onChange({ ...filters, to: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-500">Estado de orden</label>
        <select
          className="border rounded px-3 py-1 text-sm text-gray-700"
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
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-500">Estado del cliente</label>
        <select
          className="border rounded px-3 py-1 text-sm text-gray-700"
          value={filters.customerState || ''}
          onChange={(e) => onChange({ ...filters, customerState: e.target.value || undefined })}
        >
          <option value="">Todos</option>
          {['SP','RJ','MG','RS','PR','SC','BA','GO','ES','PE','CE','MT','MS','MA','RO','PB','AM','PI','AL','SE','RN','TO','AC','AP','RR','DF','PA'].map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>
    </div>
  );
}