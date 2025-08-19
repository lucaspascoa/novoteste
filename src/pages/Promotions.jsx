import React, { useState, useEffect } from 'react';
import { Product } from '@/api/entities';
import ProductGrid from '@/components/store/ProductGrid';
import { Loader2, Percent } from 'lucide-react';

export default function Promotions() {
    const [promoProducts, setPromoProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPromoProducts();
    }, []);

    const fetchPromoProducts = async () => {
        setIsLoading(true);
        try {
            const allProducts = await Product.filter({ status: 'active' });
            const filtered = allProducts.filter(p => p.original_price && p.original_price > p.price);
            setPromoProducts(filtered);
        } catch (error) {
            console.error("Erro ao buscar produtos em promoção:", error);
        }
        setIsLoading(false);
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="text-center mb-12">
                <Percent className="w-16 h-16 mx-auto mb-4 text-red-500" />
                <h1 className="text-4xl font-bold text-slate-900">Promoções</h1>
                <p className="text-lg text-slate-600 mt-2">Aproveite nossos produtos com descontos especiais!</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <ProductGrid products={promoProducts} />
            )}
        </div>
    );
}