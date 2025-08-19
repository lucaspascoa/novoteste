import React, { useState, useEffect } from 'react';
import { Order, Product } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import StatsCard from '../components/admin/StatsCard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Reports() {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [orderData, productData] = await Promise.all([
                Order.filter({ status: 'Finalizado' }),
                Product.list()
            ]);
            setOrders(orderData);
            setProducts(productData);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        }
        setIsLoading(false);
    };

    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.created_date);
        return orderDate >= startOfDay(new Date(startDate)) && orderDate <= endOfDay(new Date(endDate));
    });

    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const salesOverTime = filteredOrders.reduce((acc, order) => {
        const date = format(new Date(order.created_date), 'dd/MM');
        acc[date] = (acc[date] || 0) + order.total;
        return acc;
    }, {});
    const salesOverTimeData = Object.keys(salesOverTime).map(date => ({ date, "Vendas": salesOverTime[date] }));
    
    const topProducts = filteredOrders.flatMap(order => order.products).reduce((acc, product) => {
        acc[product.name] = (acc[product.name] || 0) + product.quantity;
        return acc;
    }, {});
    const topProductsData = Object.keys(topProducts).map(name => ({ name, "Quantidade": topProducts[name] })).sort((a,b) => b.Quantidade - a.Quantidade).slice(0, 5);

    return (
        <div className="p-4 md:p-8 space-y-6">
            <h1 className="text-3xl font-bold">Relatórios</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                     <div className="space-y-1">
                        <Label htmlFor="start-date">Data Inicial</Label>
                        <Input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="end-date">Data Final</Label>
                        <Input id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard title="Receita Total" value={`R$ ${totalRevenue.toFixed(2)}`} icon={DollarSign} color="green" />
                <StatsCard title="Total de Pedidos" value={totalOrders} icon={ShoppingCart} color="blue" />
                <StatsCard title="Ticket Médio" value={`R$ ${averageTicket.toFixed(2)}`} icon={TrendingUp} color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Vendas ao Longo do Tempo</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={salesOverTimeData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="Vendas" stroke="#8884d8" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Produtos Mais Vendidos</CardTitle></CardHeader>
                    <CardContent>
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topProductsData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="name" width={150} />
                                <Tooltip />
                                <Bar dataKey="Quantidade" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}