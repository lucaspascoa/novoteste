import React, { useState, useEffect } from 'react';
import { Order } from '@/api/entities';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Package, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TrackOrder() {
    const [phone, setPhone] = useState('');
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!phone) return;

        setIsLoading(true);
        setSearched(true);
        try {
            const foundOrders = await Order.filter({ customer_phone: phone }, '-created_date');
            setOrders(foundOrders);
        } catch (error) {
            console.error("Erro ao buscar pedidos:", error);
            setOrders([]);
        }
        setIsLoading(false);
    };

    const handleCancelOrder = async (orderToCancel) => {
        if (window.confirm("Tem certeza que deseja cancelar este pedido?")) {
            try {
                await Order.update(orderToCancel.id, { status: "Cancelado" });
                alert("Pedido cancelado com sucesso!");
                // Recarrega os pedidos para refletir a mudança
                handleSearch();
            } catch (error) {
                console.error("Erro ao cancelar pedido:", error);
                alert("Não foi possível cancelar o pedido. Tente novamente.");
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="text-center mb-8">
                <Package className="w-16 h-16 mx-auto mb-4 text-slate-400"/>
                <h1 className="text-4xl font-bold">Rastrear Pedido</h1>
                <p className="text-slate-600 mt-2">Digite o número de telefone usado na compra para ver o status.</p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-lg mx-auto">
                <Input
                    type="tel"
                    placeholder="Seu número de telefone com DDD"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                />
                <Button type="submit" disabled={isLoading}>
                    <Search className="w-4 h-4 mr-2" />
                    {isLoading ? 'Buscando...' : 'Buscar'}
                </Button>
            </form>
            
            {searched && !isLoading && (
                <div>
                    {orders.length > 0 ? (
                        <div className="space-y-4">
                            {orders.map(order => (
                                <Card key={order.id}>
                                    <CardHeader>
                                        <CardTitle className="flex justify-between items-center">
                                            <span>Pedido de {format(new Date(order.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                                            <Badge>{order.status}</Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="list-disc list-inside text-slate-700 mb-4">
                                        {order.products.map(p => (
                                            <li key={p.id}>{p.quantity}x {p.name}</li>
                                        ))}
                                        </ul>
                                        <div className="flex justify-between items-end">
                                             <p className="font-bold text-lg">Total: R$ {order.total.toFixed(2)}</p>
                                             {order.status === 'Pendente' && (
                                                <Button variant="destructive" size="sm" onClick={() => handleCancelOrder(order)}>
                                                    Cancelar Pedido
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-slate-500">Nenhum pedido encontrado para este número de telefone.</p>
                    )}
                </div>
            )}
             <div className="mt-8 text-center">
                <Link to={createPageUrl("Store")}>
                    <Button variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar para a Loja
                    </Button>
                </Link>
            </div>
        </div>
    );
}