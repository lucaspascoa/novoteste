import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Package } from "lucide-react";
import { format } from "date-fns";

export default function RecentActivity({ products }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-slate-200/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          Produtos Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {products.length > 0 ? (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="w-12 h-12 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl flex items-center justify-center overflow-hidden">
                  {product.images?.[0] ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-6 h-6 text-slate-500" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{product.name}</h3>
                  <p className="text-sm text-slate-500">
                    {format(new Date(product.created_date), "dd/MM/yyyy 'às' HH:mm")}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                    {product.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                  {product.featured && (
                    <Badge className="bg-amber-100 text-amber-800">Destaque</Badge>
                  )}
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-slate-900">R$ {product.price?.toFixed(2)}</p>
                  <p className="text-sm text-slate-500">{product.category}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Nenhum produto cadastrado ainda</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
