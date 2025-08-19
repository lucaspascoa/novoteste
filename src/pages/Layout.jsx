

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ShoppingBag, LayoutDashboard, Package, Settings, Home, Users, ClipboardList, LogIn, LogOut, Calculator, Shield, AreaChart } from "lucide-react";
import { Staff, StoreConfig, Role } from "@/api/entities";
import LoginForm from "@/components/auth/LoginForm";
import StoreHeader from "@/components/store/StoreHeader";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import ErrorBoundary from "@/components/utils/ErrorBoundary"; // Importando a nossa rede de segurança

// Definir quais páginas requerem quais permissões
const pagePermissions = {
  "AdminDashboard": "dashboard.read",
  "ManageProducts": "products.read",
  "ManageOrders": "orders.read",
  "ManageStaff": "staff.read",
  "ManageRoles": "roles.read",
  "StoreSettings": "settings.read",
  "DailyClosure": "orders.read",
  "ManageCategories": "settings.read",
  "Reports": "dashboard.read" 
};

// Menu dinâmico baseado em permissões
const getNavigationItems = (userPermissions) => {
  const allNavItems = [
    { title: "Dashboard", url: "AdminDashboard", icon: LayoutDashboard, permission: "dashboard.read" },
    { title: "Relatórios", url: "Reports", icon: AreaChart, permission: "dashboard.read" },
    { title: "Gerenciar Pedidos", url: "ManageOrders", icon: ClipboardList, permission: "orders.read" },
    { title: "Gerenciar Produtos", url: "ManageProducts", icon: Package, permission: "products.read" },
    { title: "Gerenciar Categorias", url: "ManageCategories", icon: ShoppingBag, permission: "settings.read" },
    { title: "Gerenciar Equipe", url: "ManageStaff", icon: Users, permission: "staff.read" },
    { title: "Perfis e Permissões", url: "ManageRoles", icon: Shield, permission: "roles.read" },
    { title: "Fechamento de Caixa", url: "DailyClosure", icon: Calculator, permission: "orders.read" },
    { title: "Configurações", url: "StoreSettings", icon: Settings, permission: "settings.read" },
    { title: "Ver Loja", url: "Store", icon: Home, permission: null }, // Todos podem ver a loja
  ];

  return allNavItems.filter(item => 
    !item.permission || userPermissions.includes(item.permission)
  );
};

const publicPages = ["Store", "TrackOrder", "AdminLogin", "ProductView", "Promotions"];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [storeConfig, setStoreConfig] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkCurrentUser();
    loadStoreConfig();
  }, []);

  const loadStoreConfig = async () => {
      const configData = await StoreConfig.list();
      if(configData.length > 0) {
        setStoreConfig(configData[0]);
      }
  }

  const checkCurrentUser = async () => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if(parsedUser && parsedUser.username) {
            setUser(parsedUser);
            
            // Se for admin, dar todas as permissões automaticamente
            if (parsedUser.role === 'Admin' || parsedUser.role === 'admin') {
              setUserPermissions([
                "dashboard.read", "products.read", "products.create", "products.update", "products.delete", 
                "orders.read", "orders.update", "staff.read", "staff.manage", "settings.read", "settings.update",
                "roles.read", "roles.manage"
              ]);
            } else {
              // Para outros perfis, buscar permissões do banco
              const roles = await Role.filter({ name: parsedUser.role });
              if (roles.length > 0) {
                setUserPermissions(roles[0].permissions || []);
              } else {
                setUserPermissions([]);
              }
            }
        }
      }
    } catch (error) {
      console.error('Erro ao recuperar usuário:', error);
      localStorage.removeItem('currentUser');
      setUserPermissions([]);
    }
    setIsLoading(false);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    checkCurrentUser(); // Recarregar permissões após login
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    setUserPermissions([]);
    window.location.href = createPageUrl("Store");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isPublicPage = publicPages.includes(currentPageName);
  const requiredPermission = pagePermissions[currentPageName];
  const hasPageAccess = !requiredPermission || userPermissions.includes(requiredPermission);

  // Se o usuário está tentando acessar uma página administrativa sem permissão
  // Nota: A página de Relatórios ("Reports") é uma página administrativa e, portanto,
  // deve exigir login e permissões como as outras páginas administrativas.
  // A condição `!isPublicPage && currentPageName !== 'AdminLogin'` já trata isso
  // corretamente, pois 'Reports' não é uma página pública nem a página de login.
  // A verificação de permissão específica para "Reports" ocorre via `hasPageAccess`.
  if (!isPublicPage && currentPageName !== 'AdminLogin') {
    if (!user) {
      window.location.href = createPageUrl("AdminLogin");
      return null;
    }
    if (!hasPageAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Acesso Negado</h1>
            <p className="text-slate-600 mb-6">Você não tem permissão para acessar esta página.</p>
            <Button onClick={() => window.location.href = createPageUrl("Store")}>
              Voltar à Loja
            </Button>
          </div>
        </div>
      );
    }
  }
  
  const navigationItems = getNavigationItems(userPermissions);

  // Estilos dinâmicos para um tema de luxo minimalista
  const themeStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
    
    :root {
      --font-serif: 'Cormorant Garamond', serif;
      --font-sans: 'Inter', sans-serif;
      
      --background: #FFFFFF;
      --foreground: #111111;
      --muted: #f7f7f7;
      --muted-foreground: #666666;
      --border: #E5E5E5;
      --primary: #111111;
      --primary-foreground: #FFFFFF;
      --secondary: #f1f5f9;
      --secondary-foreground: #0f172a;
      --input: #e2e8f0;
      --ring: var(--primary);
    }
    
    body {
        background-color: var(--background);
        color: var(--foreground);
        font-family: var(--font-sans);
    }
    
    h1, h2, h3, h4, h5, h6 {
        font-family: var(--font-serif);
        font-weight: 600;
    }

    .bg-primary { background-color: var(--primary); }
    .text-primary { color: var(--primary); }
    .text-primary-foreground { color: var(--primary-foreground); }
    .bg-accent { background-color: var(--primary); }
    .text-accent { color: var(--primary); }
  `;

  // Páginas públicas (Store, TrackOrder)
  if (isPublicPage) {
    return (
      <div>
        <style>{themeStyles}</style>
        <StoreHeader 
          user={user} 
          storeConfig={storeConfig} 
          onLogout={handleLogout} 
        />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </div>
    );
  }

  // Página de login administrativa
  if (currentPageName === 'AdminLogin') {
    return (
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <style>{themeStyles}</style>
        <Sidebar className="border-r border-slate-200 bg-white">
          <SidebarHeader className="border-b border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Painel</h2>
                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4 flex flex-col justify-between h-[calc(100%-80px)]">
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild active={currentPageName === item.url}>
                    <Link to={createPageUrl(item.url)} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            <div>
              {user && (
                <div className="px-3 py-2 mb-2 bg-slate-100 rounded-lg">
                  <p className="font-medium text-slate-900 text-sm truncate">{user.full_name}</p>
                  <p className="text-xs text-slate-500 truncate">@{user.username}</p>
                </div>
              )}
              <Button variant="outline" className="w-full" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-slate-200 px-6 py-3 md:hidden">
            <div className="flex items-center justify-between">
              <SidebarTrigger />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Sair
                <LogOut className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-4 md:p-8">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

