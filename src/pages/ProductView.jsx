import React, { useState, useEffect } from 'react';
import { Product } from '@/api/entities';
import { useLocation } from 'react-router-dom';
import { X, ShoppingCart, Play, Star, Minus, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

// Hook para gerenciar o carrinho via localStorage
const useCart = () => {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        try {
            const localCart = localStorage.getItem('cart');
            if (localCart) {
                setCart(JSON.parse(localCart));
            }
        } catch (error) {
            console.error("Failed to parse cart from localStorage", error);
            localStorage.removeItem('cart');
        }
    }, []);

    const updateCart = (newCart) => {
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('storage')); // Notifica outros componentes sobre a mudança
    };

    const addToCart = (product, variations, quantity) => {
        const cartItem = {
            id: `${product.id}-${variations.color?.hex || 'none'}-${variations.size || 'none'}`,
            product,
            variations,
            quantity
        };
        const existingItemIndex = cart.findIndex(item => item.id === cartItem.id);

        let newCart = [...cart];
        if (existingItemIndex > -1) {
            newCart[existingItemIndex].quantity += quantity;
        } else {
            newCart.push(cartItem);
        }
        updateCart(newCart);
    };

    return { addToCart };
};


export default function ProductView() {
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const { addToCart } = useCart();

    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState("");
    const [showVideo, setShowVideo] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const productId = params.get('id');
        if (productId) {
            fetchProduct(productId);
        } else {
            setIsLoading(false);
        }
    }, [location.search]);

    const fetchProduct = async (id) => {
        setIsLoading(true);
        try {
            const products = await Product.list();
            const foundProduct = products.find(p => p.id === id);
            setProduct(foundProduct);
            if(foundProduct) {
              setSelectedColor(foundProduct.colors?.[0] || null);
              setSelectedSize(foundProduct.sizes?.[0] || null);
            }
        } catch (error) {
            console.error("Erro ao buscar produto:", error);
        }
        setIsLoading(false);
    };

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product, {
          color: selectedColor,
          size: selectedSize,
          notes
        }, quantity);
        alert(`${product.name} adicionado ao carrinho!`);
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center text-center">
            <div>
                <h1 className="text-2xl font-bold">Produto não encontrado</h1>
                <p className="text-slate-600">O produto que você está procurando não existe ou foi removido.</p>
            </div>
        </div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
             <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                {/* Imagens */}
                <div className="space-y-4">
                  <div className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden">
                    {showVideo && product.video_url ? (
                      <iframe src={product.video_url} className="w-full h-full" allowFullScreen />
                    ) : (
                      <img src={product.images?.[selectedImage] || "https://via.placeholder.com/600"} alt={product.name} className="w-full h-full object-cover" />
                    )}
                    {product.video_url && !showVideo && (
                      <Button onClick={() => setShowVideo(true)} className="absolute inset-0 bg-black/20 hover:bg-black/30 text-white"><Play className="w-12 h-12" /></Button>
                    )}
                  </div>
                  <div className="flex gap-2 overflow-x-auto">
                    {product.video_url && (
                      <button onClick={() => setShowVideo(true)} className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden ${showVideo ? "border-blue-500" : "border-slate-200"}`}>
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center"><Play className="w-6 h-6 text-slate-600" /></div>
                      </button>
                    )}
                    {product.images?.map((image, index) => (
                      <button key={index} onClick={() => { setSelectedImage(index); setShowVideo(false); }} className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden ${selectedImage === index && !showVideo ? "border-blue-500" : "border-slate-200"}`}>
                        <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Informações do Produto */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
                      {product.promotion_tag && <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">{product.promotion_tag}</Badge>}
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-4xl font-bold text-blue-600">R$ {product.price?.toFixed(2)}</span>
                      {product.original_price && <span className="text-xl text-slate-500 line-through">R$ {product.original_price?.toFixed(2)}</span>}
                    </div>
                    <p className="text-slate-600 leading-relaxed">{product.description}</p>
                  </div>

                  {/* Variações, Quantidade, etc. */}
                  {/* Cores */}
                  {product.colors && product.colors.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Cores</h3>
                      <div className="flex gap-3">
                        {product.colors.map((color, index) => (
                          <button key={index} onClick={() => setSelectedColor(color)} className={`w-10 h-10 rounded-full border-4 transition-all duration-200 ${selectedColor?.hex === color.hex ? "border-blue-500 scale-110 shadow-lg" : "border-white shadow-md hover:scale-105"}`} style={{ backgroundColor: color.hex }} title={color.name} />
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Tamanhos */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Tamanhos</h3>
                      <div className="flex gap-2">
                        {product.sizes.map((size, index) => (
                          <button key={index} onClick={() => setSelectedSize(size)} className={`px-4 py-2 rounded-lg border-2 font-medium transition-all duration-200 ${selectedSize === size ? "border-blue-500 bg-blue-50 text-blue-600" : "border-slate-200 hover:border-slate-300 text-slate-700"}`}>
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Quantidade */}
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Quantidade</h3>
                    <div className="flex items-center border border-slate-200 rounded-lg w-fit">
                      <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="w-4 h-4" /></Button>
                      <span className="px-4 py-2 font-medium">{quantity}</span>
                      <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)}><Plus className="w-4 h-4" /></Button>
                    </div>
                  </div>
                   {/* Botão de Adicionar ao Carrinho */}
                  <Button onClick={handleAddToCart} size="lg" className="w-full bg-blue-600 hover:bg-blue-700"><ShoppingCart className="w-5 h-5 mr-2" />Adicionar ao Carrinho</Button>

                  {product.detailed_description && (
                    <div className="pt-6 border-t border-slate-200">
                      <h3 className="font-semibold text-slate-900 mb-3">Descrição Detalhada</h3>
                      <div className="prose prose-sm max-w-none text-slate-600" dangerouslySetInnerHTML={{ __html: product.detailed_description.replace(/\n/g, '<br />') }} />
                    </div>
                  )}
                </div>
            </div>
        </div>
    );
}