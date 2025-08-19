import React, { useState, useEffect } from 'react';
import { Order, DailyClosure } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format, startOfDay, endOfDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calculator, DollarSign, Users, CreditCard, Smartphone } from 'lucide-react';

export default function DailyClosure() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [orders, setOrders] = useState([]);
  const [closureData, setClosureData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
        setCurrentUser(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    fetchOrdersForDate(selectedDate);
  }, [selectedDate]);

  const fetchOrdersForDate = async (date) => {
    setIsLoading(true);
    try {
      const allOrders = await Order.filter({ status: 'Finalizado' });
      const filteredOrders = allOrders.filter(order => {
        const orderDate = format(new Date(order.created_date), 'yyyy-MM-dd');
        return orderDate === date;
      });
      
      setOrders(filteredOrders);
      calculateClosureData(filteredOrders);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
    }
    setIsLoading(false);
  };
  
  const calculateClosureData = (orders) => {
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;

    const paymentMethods = orders.reduce((acc, order) => {
      const method = order.payment_method || 'N/A';
      acc[method] = (acc[method] || 0) + order.total;
      return acc;
    }, {});

    const staffSales = orders.reduce((acc, order) => {
      const staff = order.staff_name || 'Online';
      acc[staff] = (acc[staff] || 0) + order.total;
      return acc;
    }, {});

    setClosureData({ totalSales, totalOrders, paymentMethods, staffSales });
  };
  
  const handleCloseRegister = async () => {
    if (!currentUser) {
      alert("Usuário não identificado. Faça login novamente.");
      return;
    }
    
    setIsLoading(true);
    try {
        await DailyClosure.create({
          date: selectedDate,
          total_sales: closureData.totalSales,
          total_orders: closureData.totalOrders,
          payment_methods: closureData.paymentMethods,
          staff_sales: closureData.staffSales,
          closed_by: currentUser.full_name,
          notes: notes
        });
        alert('Caixa fechado com sucesso!');
    } catch(error) {
        console.error("Erro ao fechar caixa:", error);
        alert('Houve um erro. Tente novamente.');
    }
    setIsLoading(false);
  };
  
  const paymentIcons = {
    'Dinheiro': <DollarSign className="w-5 h-5 text-green-500" />,
    'Cartão': <CreditCard className="w-5 h-5 text-blue-500" />,
    'Pix': <Smartphone className="w-5 h-5 text-cyan-500" />
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Calculator /> Fechamento de Caixa
          </CardTitle>
          <CardDescription>
            Selecione uma data para ver o resumo das vendas e fechar o caixa do dia.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="closure-date">Data do Fechamento</Label>
            <Input
              id="closure-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="max-w-xs"
            />
          </div>

          {isLoading ? (
            <p>Carregando dados...</p>
          ) : closureData ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Resumo Geral</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between"><span>Total de Vendas:</span> <strong>R$ {closureData.totalSales.toFixed(2)}</strong></div>
                        <div className="flex justify-between"><span>Total de Pedidos:</span> <strong>{closureData.totalOrders}</strong></div>
                    </CardContent>
                </Card>
                <Card>
                     <CardHeader>
                        <CardTitle className="text-lg">Vendas por Pagamento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {Object.entries(closureData.paymentMethods).map(([method, total]) => (
                            <div key={method} className="flex justify-between items-center">
                                <span className="flex items-center gap-2">{paymentIcons[method]} {method}</span> 
                                <strong>R$ {total.toFixed(2)}</strong>
                            </div>
                        ))}
                    </CardContent>
                </Card>
              </div>

               <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2"><Users /> Vendas por Funcionário</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                         {Object.entries(closureData.staffSales).map(([staff, total]) => (
                            <div key={staff} className="flex justify-between"><span>{staff}</span> <strong>R$ {total.toFixed(2)}</strong></div>
                        ))}
                    </CardContent>
                </Card>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Alguma observação sobre o fechamento de hoje?"
                />
              </div>
              <Button onClick={handleCloseRegister} disabled={isLoading} className="w-full">
                Fechar Caixa de {format(parseISO(selectedDate), 'dd/MM/yyyy')}
              </Button>
            </div>
          ) : (
            <p>Nenhuma venda finalizada para esta data.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}