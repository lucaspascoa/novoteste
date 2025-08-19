import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CartFab({ onClick }) {
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const updateCartCount = () => {
            try {
                const localCart = localStorage.getItem('cart');
                const cart = localCart ? JSON.parse(localCart) : [];
                const count = cart.reduce((acc, item) => acc + item.quantity, 0);
                setCartCount(count);
            } catch(e) {
                setCartCount(0);
            }
        };

        updateCartCount();
        window.addEventListener('storage', updateCartCount);

        return () => {
            window.removeEventListener('storage', updateCartCount);
        };
    }, []);

    return (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <Button
            onClick={onClick}
            className="relative h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl hover:scale-105 transition-transform"
          >
            <ShoppingCart className="w-7 h-7" />
            {cartCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-7 w-7 flex items-center justify-center rounded-full text-sm font-bold border-2 border-white"
              >
                {cartCount}
              </Badge>
            )}
          </Button>
        </motion.div>
    );
}
