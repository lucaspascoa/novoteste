import React from "react";
import { User, LayoutDashboard, LogOut, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function StoreHeader({ storeConfig, user, onLogout }) {
  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-[var(--border)] sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          
          <div className="flex-1 flex justify-start">
             <Link to={createPageUrl("TrackOrder")}>
                <Button variant="ghost" className="text-sm font-normal">
                    <PackageSearch className="w-4 h-4 mr-2"/>
                    Rastrear Pedido
                </Button>
             </Link>
          </div>
          
          {/* Logo/Nome da Loja no Centro */}
          <div className="flex justify-center">
            <Link to={createPageUrl("Store")} className="flex items-center gap-4">
                {storeConfig?.logo_url ? (
                  <img 
                    src={storeConfig.logo_url} 
                    alt={storeConfig?.store_name || "Logo da Loja"}
                    className="h-12 md:h-16 max-w-48 object-contain hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <h1 className="text-2xl md:text-3xl font-medium tracking-widest uppercase">
                    {storeConfig?.store_name || "..."}
                  </h1>
                )}
            </Link>
          </div>

          {/* Actions */}
          <div className="flex-1 flex items-center justify-end gap-4">
            {user ? (
              <>
                <Link to={createPageUrl("AdminDashboard")}>
                    <Button variant="ghost" className="text-sm font-normal">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Painel
                    </Button>
                </Link>
                <Button variant="ghost" onClick={onLogout} className="text-sm font-normal">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                </Button>
              </>
            ) : (
              <Link to={createPageUrl("AdminLogin")}>
                <Button variant="ghost" className="text-sm font-normal">
                  <User className="w-4 h-4 mr-2" />
                  Entrar
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
