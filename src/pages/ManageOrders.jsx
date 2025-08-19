import React, { useState, useEffect } from 'react';
import { Order, StoreConfig } from '@/api/entities';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Bike, ShoppingBag } from 'lucide-react';

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [storeConfig, setStoreConfig] = useState(null);
  const [filter, setFilter] = useState('Pendente');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadData();
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const loadData = async () => {
    try {
      const [orderData, configData] = await Promise.all([
        Order.list('-created_date'),
        StoreConfig.list()
      ]);
      setOrders(orderData);
      setStoreConfig(configData[0]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await Order.update(orderId, { status: newStatus });
      loadData();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };
  
  const notifyCustomer = (order) => {
    let message = '';
    if(order.status === 'Pronto para retirada') {
        message = `Olá ${order.customer_name}, seu pedido #${order.id} está pronto para retirada!`;
    } else if (order.status === 'Saiu para entrega') {
        message = `Olá ${order.customer_name}, seu pedido #${order.id} saiu para entrega!`;
    }
    const whatsappUrl = `https://wa.me/${order.customer_phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const notifyDelivery = (order) => {
      if(!storeConfig?.delivery_whatsapp_number) {
          alert('Número do entregador não configurado.');
          return;
      }
      const message = `Novo pedido para entrega: #${order.id}. Cliente: ${order.customer_name}. Endereço: ${order.address_street}, ${order.address_number}, ${order.address_neighborhood}.`;
      const whatsappUrl = `https://wa.me/${storeConfig.delivery_whatsapp_number}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
  };

  const filteredOrders = orders.filter(order => filter === 'Todos' || order.status === filter);

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Pedidos</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            <SelectItem value="Pendente">Pendente</SelectItem>
            <SelectItem value="Em preparação">Em preparação</SelectItem>
            <SelectItem value="Pronto para retirada">Pronto para retirada</SelectItem>
            <SelectItem value="Saiu para entrega">Saiu para entrega</SelectItem>
            <SelectItem value="Finalizado">Finalizado</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-600">Nenhum pedido encontrado</h3>
            <p className="text-slate-500">Os pedidos aparecerão aqui conforme chegarem.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Pedido de {order.customer_name}</span>
                  <Badge variant={order.status === 'Finalizado' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <div>
                    <p><strong>Total:</strong> R$ {order.total.toFixed(2)}</p>
                    <p><strong>Telefone:</strong> {order.customer_phone}</p>
                    {order.delivery_method === 'Entrega' && (
                      <p><strong>Endereço:</strong> {order.address_street}, {order.address_number} - {order.address_neighborhood}</p>
                    )}
                    <ul className="mt-2">
                      {order.products.map(p => (
                        <li key={p.id}>{p.quantity}x {p.name}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                      <Select value={order.status} onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}>
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Pendente">Pendente</SelectItem>
                              <SelectItem value="Em preparação">Em preparação</SelectItem>
                              <SelectItem value="Pronto para retirada">Pronto para retirada</SelectItem>
                              <SelectItem value="Saiu para entrega">Saiu para entrega</SelectItem>
                              <SelectItem value="Finalizado">Finalizado</SelectItem>
                              <SelectItem value="Cancelado">Cancelado</SelectItem>
                          </SelectContent>
                      </Select>
                      <div className="flex gap-2 mt-2">
                          {(order.status === 'Pronto para retirada' || order.status === 'Saiu para entrega') && (
                              <Button variant="outline" size="sm" onClick={() => notifyCustomer(order)}>
                                  <MessageSquare className="w-4 h-4 mr-2" /> Notificar Cliente
                              </Button>
                          )}
                          {order.status === 'Saiu para entrega' && (
                               <Button variant="outline" size="sm" onClick={() => notifyDelivery(order)}>
                                  <Bike className="w-4 h-4 mr-2" /> Acionar Entregador
                              </Button>
                          )}
                      </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}