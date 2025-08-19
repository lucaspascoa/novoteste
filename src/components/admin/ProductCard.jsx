
import React from "react";
import { Edit, Trash2, Star, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function ProductCard({ 
  product, 
  index, 
  onEdit, 
  onDelete, 
  onToggleFeatured, 
  onToggleStatus,
  userPermissions = { canEdit: true, canDelete: true }
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden hover:shadow-2xl transition-all duration-300"
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-slate-100">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <Eye className="w-12 h-12" />
          </div>
        )}
        
        {/* Status indicators */}
        <div className="absolute top-3 left-3 flex gap-2">
          {product.status === 'inactive' && (
            <Badge className="bg-red-100 text-red-800">Inativo</Badge>
          )}
          {product.featured && (
            <Badge className="bg-amber-100 text-amber-800">
              <Star className="w-3 h-3 mr-1" />
              Destaque
            </Badge>
          )}
          {product.promotion_tag && (
            <Badge className="bg-green-100 text-green-800">
              {product.promotion_tag}
            </Badge>
          )}
        </div>

        {/* Action buttons - only show if user has permissions */}
        {(userPermissions.canEdit || userPermissions.canDelete) && (
          <div className="absolute top-3 right-3 flex gap-1">
            {userPermissions.canEdit && (
              <>
                <Button
                  size="icon"
                  variant="secondary"
                  className="w-8 h-8 bg-white/90 hover:bg-white"
                  onClick={() => onToggleStatus(product)}
                >
                  {product.status === 'active' ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="w-8 h-8 bg-white/90 hover:bg-white"
                  onClick={() => onToggleFeatured(product)}
                >
                  <Star className={`w-4 h-4 ${product.featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-slate-900 line-clamp-2 mb-1">
            {product.name}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-blue-600">
              R$ {product.price?.toFixed(2)}
            </span>
            <span className="text-sm text-slate-500">{product.category}</span>
          </div>
          
          {product.stock !== undefined && (
            <div className="text-right">
              <span className="text-sm text-slate-500">Estoque:</span>
              <div className="font-semibold">{product.stock}</div>
            </div>
          )}
        </div>

        {/* Colors and Sizes */}
        <div className="space-y-2 mb-4">
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Cores:</span>
              <div className="flex gap-1">
                {product.colors.slice(0, 4).map((color, idx) => (
                  <div
                    key={idx}
                    className="w-4 h-4 rounded-full border border-slate-300"
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
                {product.colors.length > 4 && (
                  <span className="text-xs text-slate-500">+{product.colors.length - 4}</span>
                )}
              </div>
            </div>
          )}
          
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Tamanhos:</span>
              <span className="text-xs text-slate-700">
                {product.sizes.slice(0, 3).join(", ")}
                {product.sizes.length > 3 && ` +${product.sizes.length - 3}`}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {(userPermissions.canEdit || userPermissions.canDelete) && (
          <div className="flex gap-2">
            {userPermissions.canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(product)}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
            )}
            {userPermissions.canDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(product)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
