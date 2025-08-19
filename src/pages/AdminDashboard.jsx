import React, { useState, useEffect } from "react";
import { Product, Category, StoreConfig, Order, DailyClosure } from "@/api/entities";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Package, ShoppingCart, Eye, TrendingUp, Plus, DollarSign, Calculator, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { format } from "date-fns";

import StatsCard from "../components/admin/StatsCard";
import RecentActivity from "../components/admin/RecentActivity";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [closures, setClosures] = useState([]);
  const [storeConfig, setStoreConfig] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [productsData, categoriesData, ordersData, closuresData, configData] = await Promise.all([
        Product.list("-created_date"),
        Category.list("order"),
        Order.list("-created_date", 100),
        DailyClosure.list("-date", 30),
        StoreConfig.list()
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
      setOrders(ordersData);
      setClosures(closuresData);
      setStoreConfig(configData[0] || {});
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setIsLoading(false);
  };

  const productsByCategory = categories.map(category => ({
    name: category.name,
    value: products.filter(p => p.category === category.name).length,
    color: `hsl(${Math.random() * 360}, 70%, 60%)`
  }));

  const recentProducts = products.slice(0, 5);
  const activeCount = products.filter(p => p.status === 'active').length;

  const getSalesData = () => {
    const now = new Date();
    let filteredOrders = [];
    
    if (selectedPeriod === 'today') {
      const today = format(now, 'yyyy-MM-dd');
      filteredOrders = orders.filter(order => {
        const orderDate = format(new Date(order.created_date), 'yyyy-MM-dd');
        return orderDate === today && order.status === 'Finalizado';
      });
    } else if (selectedPeriod === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.created_date);
        return orderDate >= weekAgo && order.status === 'Finalizado';
      });
    } else if (selectedPeriod === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.created_date);
        return orderDate >= monthAgo && order.status === 'Finalizado';
      });
    }

    const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    
    // Vendas por funcionário
    const staffSales = filteredOrders.reduce((acc, order) => {
      const staffName = order.staff_name || 'Online';
      acc[staffName] = (acc[staffName] || 0) + order.total;
      return acc;
    }, {});

    // Vendas por dia (últimos 7 dias)
    const dailySales = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayOrders = orders.filter(order => {
        const orderDate = format(new Date(order.created_date), 'yyyy-MM-dd');
        return orderDate === dateStr && order.status === 'Finalizado';
      });
      
      dailySales.push({
        name: format(date, 'dd/MM'),
        value: dayOrders.reduce((sum, order) => sum + order.total, 0)
      });
    }

    return { totalSales, totalOrders, staffSales, dailySales, filteredOrders };
  };

  const salesData = getSalesData();

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard Administrativo</h1>
            <p className="text-slate-600 mt-1">Gerencie sua loja e monitore o desempenho</p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Última Semana</SelectItem>
                <SelectItem value="month">Último Mês</SelectItem>
              </SelectContent>
            </Select>
            <Link to={createPageUrl("ManageProducts")}>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </Link>
            <Link to={createPageUrl("Store")}>
              <Button variant="outline" className="shadow-lg">
                <Eye className="w-4 h-4 mr-2" />
                Ver Loja
              </Button>
            </Link>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatsCard
            title="Total de Produtos"
            value={products.length}
            icon={Package}
            color="blue"
            trend={`${activeCount} ativos`}
          />
          <StatsCard
            title="Vendas do Período"
            value={`R$ ${salesData.totalSales.toFixed(2)}`}
            icon={DollarSign}
            color="green"
            trend={`${salesData.totalOrders} pedidos`}
          />
          <StatsCard
            title="Categorias"
            value={categories.length}
            icon={ShoppingCart}
            color="amber"
            trend="Organizadas"
          />
          <StatsCard
            title="Em Destaque"
            value={products.filter(p => p.featured).length}
            icon={TrendingUp}
            color="purple"
            trend="Produtos promocionais"
          />
          <StatsCard
            title="Ticket Médio"
            value={`R$ ${salesData.totalOrders > 0 ? (salesData.totalSales / salesData.totalOrders).toFixed(2) : '0.00'}`}
            icon={Calculator}
            color="indigo"
            trend="Por pedido"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Sales Chart */}
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm shadow-xl border-slate-200/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-blue-600" />
                Vendas dos Últimos 7 Dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData.dailySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Vendas']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6 -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Staff Sales */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-slate-200/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Vendas por Funcionário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(salesData.staffSales)
                  .sort(([,a], [,b]) => b - a)
                  .map(([staff, total]) => (
                  <div key={staff} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-sm">{staff}</span>
                    <span className="font-bold text-slate-900">R$ {total.toFixed(2)}</span>
                  </div>
                ))}
                
                {Object.keys(salesData.staffSales).length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    Nenhuma venda no período selecionado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products by Category Chart */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm shadow-xl border-slate-200/60">
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-blue-600" />
                    Produtos por Categoria
                </CardTitle>
                </CardHeader>
                <CardContent>
                {productsByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={productsByCategory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip 
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-64 flex items-center justify-center text-slate-500">
                    Nenhum produto cadastrado ainda
                    </div>
                )}
                </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-slate-200/60">
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-green-600" />
                    Distribuição
                </CardTitle>
                </CardHeader>
                <CardContent>
                {productsByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                        data={productsByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                        >
                        {productsByCategory.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                        ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-64 flex items-center justify-center text-slate-500">
                    Adicione produtos para ver estatísticas
                    </div>
                )}
                </CardContent>
            </Card>
        </div>

        {/* Recent Activity */}
        <RecentActivity products={recentProducts} />
      </div>
    </div>
  );
}
