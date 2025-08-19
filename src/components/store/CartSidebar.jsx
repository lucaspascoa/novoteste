import React, { useState, useEffect } from "react";
import { X, Minus, Plus, ShoppingCart, Send, User, Phone, MapPin, Bike, ShoppingBag, CreditCard, DollarSign, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Order, DeliveryZone } from "@/api/entities";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CartSidebar({ onClose, onOrderPlaced, storeConfig }) {
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("Retirada");
  const [paymentMethod, setPaymentMethod] = useState("Dinheiro");
  const [changeFor, setChangeFor] = useState("");
  
  const [addressStreet, setAddressStreet] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [addressZip, setAddressZip] = useState("");
  const [addressNeighborhood, setAddressNeighborhood] = useState("");

  const [deliveryZones, setDeliveryZones] = useState([]);
  const [deliveryFee, setDeliveryFee] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const saveCartToLocalStorage = (newCart) => {
    try {
      localStorage.setItem('cart', JSON.stringify(newCart));
    } catch (e) {
      console.error("Error saving cart to localStorage", e);
    }
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }
    const updatedCart = cart.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    saveCartToLocalStorage(updatedCart);
  };

  const handleRemoveItem = (itemId) => {
    const updatedCart = cart.filter(item => item.id !== itemId);
    setCart(updatedCart);
    saveCartToLocalStorage(updatedCart);
  };

  useEffect(() => {
    const loadCart = () => {
        try {
            const localCart = localStorage.getItem('cart');
            setCart(localCart ? JSON.parse(localCart) : []);
        } catch (e) {
            console.error("Error loading cart from localStorage", e);
            setCart([]);
        }
    };
    
    loadCart();

    window.addEventListener('storage', loadCart);

    return () => {
        window.removeEventListener('storage', loadCart);
    };
  }, []);

  useEffect(() => {
    loadDeliveryZones();
  }, []);

  useEffect(() => {
    const zone = deliveryZones.find(z => z.neighborhood === addressNeighborhood);
    setDeliveryFee(zone ? zone.fee : 0);
  }, [addressNeighborhood, deliveryZones]);

  const loadDeliveryZones = async () => {
    const zones = await DeliveryZone.list();
    setDeliveryZones(zones);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const total = subtotal + (deliveryMethod === 'Entrega' ? deliveryFee : 0);

  const handlePlaceOrder = async () => {
    if (!customerName || !customerPhone || (deliveryMethod === "Entrega" && (!addressStreet || !addressNeighborhood))) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }
    setIsSubmitting(true);
    try {
        const orderData = {
            customer_name: customerName,
            customer_phone: customerPhone,
            products: cart.map(item => ({ 
                id: item.product.id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                variations: item.variations
            })),
            total: total,
            status: "Pendente",
            order_type: "Online",
            delivery_method: deliveryMethod,
            payment_method: paymentMethod,
            address_street: deliveryMethod === "Entrega" ? addressStreet : "",
            address_number: deliveryMethod === "Entrega" ? addressNumber : "",
            address_neighborhood: deliveryMethod === "Entrega" ? addressNeighborhood : "",
            address_zipcode: deliveryMethod === "Entrega" ? addressZip : "",
            delivery_fee: deliveryMethod === "Entrega" ? deliveryFee : 0,
            change_for: paymentMethod === "Dinheiro" ? parseFloat(changeFor) || 0 : 0,
        };

        await Order.create(orderData);
        setOrderPlaced(true);
        setCart([]);
        saveCartToLocalStorage([]);
        onOrderPlaced();
    } catch (error) {
        console.error("Erro ao criar pedido:", error);
        alert("Houve um erro ao processar seu pedido. Tente novamente.");
    }
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setOrderPlaced(false);
    onClose();
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-slate-200 -mx-6 -mt-6 mb-4 bg-white sticky top-0 z-10">
        <h2 className="text-lg font-bold text-slate-900">{orderPlaced ? "Pedido Enviado!" : "Seu Carrinho"}</h2>
        <Button variant="ghost" size="icon" onClick={handleClose}><X className="w-5 h-5" /></Button>
      </div>

      {orderPlaced ? (
             <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full">
                <div className="w-16 h-16 text-green-500 mx-auto mb-4">
                    <Send className="w-16 h-16"/>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Obrigado pelo seu pedido!</h3>
                <p className="text-slate-600 mb-6">Seu pedido foi recebido e está sendo processado. Você pode acompanhar o status na página "Rastrear Pedido".</p>
                <Button onClick={handleClose} className="w-full">Continuar Comprando</Button>
                <Link to={createPageUrl("TrackOrder")} className="mt-2">
                  <Button variant="link">Rastrear meu pedido</Button>
                </Link>
             </div>
        ) : cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center h-full">
                <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">Seu carrinho está vazio</h3>
                <p className="text-slate-500">Adicione produtos para continuar.</p>
            </div>
        ) : (
            <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-6 pl-1">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 bg-slate-50 p-3 rounded-lg">
                  <img src={item.product.images?.[0]} alt={item.product.name} className="w-16 h-16 object-cover rounded-md" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="font-semibold text-sm text-slate-800 line-clamp-1">{item.product.name}</h3>
                        <p className="text-xs text-slate-500">
                            {item.variations.color?.name && `Cor: ${item.variations.color.name}`}
                            {item.variations.size && ` Tam: ${item.variations.size}`}
                        </p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-slate-900">R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                      <div className="flex items-center border border-slate-200 rounded-md">
                        <Button variant="ghost" size="icon" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} className="h-7 w-7"><Minus className="w-3 h-3" /></Button>
                        <span className="px-2 text-sm font-medium">{item.quantity}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} className="h-7 w-7"><Plus className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  </div>
                   <Button variant="ghost" size="icon" className="self-start text-slate-400 hover:text-red-500" onClick={() => handleRemoveItem(item.id)}><X className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 pt-4 mt-4 space-y-4 bg-slate-50 -mx-6 px-6 pb-4">
                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
                  {deliveryMethod === 'Entrega' && (
                    <div className="flex justify-between"><span>Taxa de Entrega</span><span>R$ {deliveryFee.toFixed(2)}</span></div>
                  )}
                  <div className="flex justify-between items-baseline font-bold text-base">
                    <span className="text-base font-semibold text-slate-900">Total:</span>
                    <span className="text-2xl font-bold text-slate-900">R$ {total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                    <h3 className="font-semibold text-center">Informações para o Pedido</h3>
                    <div className="space-y-2">
                         <Label htmlFor="customerName"><User className="inline w-4 h-4 mr-1"/> Nome</Label>
                         <Input id="customerName" placeholder="Seu nome completo" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor="customerPhone"><Phone className="inline w-4 h-4 mr-1"/> Telefone</Label>
                         <Input id="customerPhone" placeholder="Seu número de WhatsApp" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required />
                    </div>
                    <RadioGroup defaultValue="Retirada" onValueChange={setDeliveryMethod} className="flex gap-4 pt-2">
                        <Label htmlFor="retirada" className="flex-1 flex items-center gap-2 p-3 border rounded-lg cursor-pointer data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-50">
                            <RadioGroupItem value="Retirada" id="retirada" /> <ShoppingBag className="w-5 h-5 mr-1"/> Retirar na loja
                        </Label>
                        <Label htmlFor="entrega" className="flex-1 flex items-center gap-2 p-3 border rounded-lg cursor-pointer data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-50">
                           <RadioGroupItem value="Entrega" id="entrega" /> <Bike className="w-5 h-5 mr-1"/> Entrega
                        </Label>
                    </RadioGroup>

                    {/* Payment Method */}
                    <div>
                        <Label className="mb-2 block"><CreditCard className="inline w-4 h-4 mr-1"/> Forma de Pagamento</Label>
                        <RadioGroup defaultValue="Dinheiro" onValueChange={setPaymentMethod} className="grid grid-cols-3 gap-2">
                            <Label htmlFor="dinheiro" className="flex items-center justify-center gap-2 p-2 text-sm border rounded-lg cursor-pointer data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-50">
                                <RadioGroupItem value="Dinheiro" id="dinheiro" /> <DollarSign className="w-4 h-4"/> Dinheiro
                            </Label>
                            <Label htmlFor="cartao" className="flex items-center justify-center gap-2 p-2 text-sm border rounded-lg cursor-pointer data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-50">
                                <RadioGroupItem value="Cartão" id="cartao" /> <CreditCard className="w-4 h-4"/> Cartão
                            </Label>
                            <Label htmlFor="pix" className="flex items-center justify-center gap-2 p-2 text-sm border rounded-lg cursor-pointer data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-50">
                                <RadioGroupItem value="Pix" id="pix" /> <Smartphone className="w-4 h-4"/> Pix
                            </Label>
                        </RadioGroup>
                    </div>

                    {/* Campo de Troco Condicional */}
                    {paymentMethod === 'Dinheiro' && (
                        <div className="space-y-2">
                             <Label htmlFor="changeFor"><DollarSign className="inline w-4 h-4 mr-1"/> Precisa de troco para quanto?</Label>
                             <Input id="changeFor" type="number" placeholder="Ex: 50,00" value={changeFor} onChange={e => setChangeFor(e.target.value)} />
                        </div>
                    )}
                    
                    {deliveryMethod === 'Entrega' && (
                        <div className="space-y-2">
                            <Label><MapPin className="inline w-4 h-4 mr-1"/> Endereço de Entrega</Label>
                            <Input 
                                placeholder="Rua, Avenida..." 
                                value={addressStreet} 
                                onChange={e => setAddressStreet(e.target.value)} 
                            />
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="Número" 
                                    value={addressNumber} 
                                    onChange={e => setAddressNumber(e.target.value)} 
                                />
                                <Input 
                                    placeholder="CEP" 
                                    value={addressZip} 
                                    onChange={e => setAddressZip(e.target.value)} 
                                />
                            </div>
                            
                            <div>
                                <select
                                    value={addressNeighborhood}
                                    onChange={(e) => setAddressNeighborhood(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Selecione o Bairro</option>
                                    {deliveryZones.map(zone => (
                                        <option key={zone.id} value={zone.neighborhood}>
                                            {zone.neighborhood} (+ R$ {Number(zone.fee || 0).toFixed(2)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
                <Button onClick={handlePlaceOrder} disabled={isSubmitting} className="w-full bg-slate-900 hover:bg-slate-800 text-white" size="lg">
                    {isSubmitting ? 'Enviando...' : 'Finalizar Pedido'}
                </Button>
            </div>
            </div>
        )}
    </>
  );
}
