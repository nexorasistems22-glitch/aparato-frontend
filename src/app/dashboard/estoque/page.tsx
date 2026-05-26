'use client';
import { Package, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';

export default function EstoquePage() {
  const { data, isLoading } = useQuery({ queryKey: ['products'], queryFn: productsApi.list });
  const { data: lowStock } = useQuery({ queryKey: ['low-stock'], queryFn: productsApi.lowStock });

  const products = data?.data || [];
  const lowItems = lowStock?.data || [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-light text-white">Estoque</h1>
        <p className="text-xs text-gray-500 mt-0.5">Controle de produtos e insumos</p>
      </div>

      {lowItems.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl"
          style={{ background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)' }}>
          <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-red-400">Estoque baixo!</div>
            <div className="text-xs text-gray-400 mt-0.5">
              {lowItems.length} produto(s) abaixo do estoque mínimo: {lowItems.map((p: any) => p.name).join(', ')}
            </div>
          </div>
        </div>
      )}

      <div className="card-dark overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['Produto', 'SKU', 'Estoque', 'Mínimo', 'Preço Custo', 'Preço Venda', 'Status'].map(h => (
                <th key={h} className="text-left text-[10px] uppercase tracking-wider text-gray-500 px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && [1,2,3].map(i => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                {[1,2,3,4,5,6,7].map(j => <td key={j} className="px-4 py-3"><div className="h-3 bg-graphite rounded animate-pulse" /></td>)}
              </tr>
            ))}
            {products.map((p: any) => {
              const isLow = p.stock <= p.minStock;
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td className="px-4 py-3 text-[12.5px] text-white">{p.name}</td>
                  <td className="px-4 py-3 text-[11px] text-gray-500">{p.sku || '—'}</td>
                  <td className="px-4 py-3 text-[12px]" style={{ color: isLow ? '#E24B4A' : 'white' }}>{p.stock} {p.unit}</td>
                  <td className="px-4 py-3 text-[11px] text-gray-500">{p.minStock}</td>
                  <td className="px-4 py-3 text-[12px] text-gray-300">R$ {p.costPrice?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-[12px] text-gold-400">R$ {p.salePrice?.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isLow ? 'badge-cancelled' : 'badge-completed'}`}>
                      {isLow ? 'Baixo' : 'OK'}
                    </span>
                  </td>
                </tr>
              );
            })}
            {!isLoading && products.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                <Package size={28} className="mx-auto mb-2 opacity-30" />
                Nenhum produto cadastrado
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
