import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function ProductCard({ product, index }) {
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 3) * 0.1 }}
      className="group"
    >
      <Link to={createPageUrl(`ProductView?id=${product.id}`)}>
        <div className="relative overflow-hidden rounded-xl border border-slate-200/60">
          <div className="aspect-square bg-slate-100">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <span className="text-sm">Sem imagem</span>
              </div>
            )}
          </div>
          
          {hasDiscount && (
            <Badge className="absolute top-3 left-3 bg-red-600 text-white">
              -{discountPercentage}%
            </Badge>
          )}

           {product.promotion_tag && !hasDiscount && (
            <Badge className="absolute top-3 left-3 bg-amber-500 text-white">
              {product.promotion_tag}
            </Badge>
          )}

        </div>
        <div className="mt-4">
          <h3 className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl font-bold text-slate-900">
              R$ {product.price?.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-slate-500 line-through">
                R$ {product.original_price?.toFixed(2)}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">{product.category}</p>
        </div>
      </Link>
    </motion.div>
  );
}
