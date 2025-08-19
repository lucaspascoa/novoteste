import React from 'react';
import ProductCard from './ProductCard'; // Importando o novo componente
import { Package } from 'lucide-react';

export default function ProductGrid({ products }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-600">Nenhum produto encontrado</h3>
        <p className="text-slate-500 mt-2">Tente ajustar seus filtros ou volte mais tarde.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}
