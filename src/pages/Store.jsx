import React, { useState, useEffect } from "react";
import { Product, Category, StoreConfig } from "@/api/entities";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet";

import BannerCarousel from "../components/store/BannerCarousel";
import ProductGrid from "../components/store/ProductGrid";
import ProductDetail from "../components/store/ProductDetail";
import CartSidebar from "../components/store/CartSidebar";
import CartFab from "../components/store/CartFab";
import Footer from "../components/store/Footer";
import FilterSidebar from "../components/store/FilterSidebar";

export default function Store() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [storeConfig, setStoreConfig] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: [0, 1],
    showOnSale: false,
    showFeatured: false
  });
  const [sortOption, setSortOption] = useState('-created_date');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    setIsLoading(true);
    try {
      const [productsData, categoriesData, configData] = await Promise.all([
        Product.filter({ status: "active" }, "-created_date"),
        Category.filter({ status: "active" }, "order"),
        StoreConfig.list()
      ]);
      
      const maxPrice = Math.max(...productsData.map(p => p.price || 0), 0);

      setProducts(productsData);
      setCategories(categoriesData);
      setStoreConfig(configData[0] || {});
      setFilters(prev => ({...prev, priceRange: [0, maxPrice || 1]}));
    } catch (error) {
      console.error("Erro ao carregar dados da loja:", error);
    }
    setIsLoading(false);
  };
  
  const addToCart = (product, variations, quantity) => {
    let currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItem = {
      id: `${product.id}-${variations.color?.hex || 'none'}-${variations.size || 'none'}`,
      product,
      variations,
      quantity
    };
    const existingItemIndex = currentCart.findIndex(item => item.id === cartItem.id);

    if (existingItemIndex > -1) {
        currentCart[existingItemIndex].quantity += quantity;
    } else {
        currentCart.push(cartItem);
    }
    localStorage.setItem('cart', JSON.stringify(currentCart));
    window.dispatchEvent(new Event('storage'));
  };

  const clearCart = () => {
      localStorage.setItem('cart', '[]');
      window.dispatchEvent(new Event('storage'));
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filters.categories.length === 0 || filters.categories.includes(product.category);
    const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
    const matchesOnSale = !filters.showOnSale || (product.original_price && product.original_price > product.price);
    const matchesFeatured = !filters.showFeatured || product.featured;

    return matchesSearch && matchesCategory && matchesPrice && matchesOnSale && matchesFeatured;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
      switch (sortOption) {
          case 'price_asc':
              return a.price - b.price;
          case 'price_desc':
              return b.price - a.price;
          case '-created_date':
          default:
              return new Date(b.created_date) - new Date(a.created_date);
      }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }
  
  const maxPriceValue = Math.max(...products.map(p => p.price || 0), 0);

  return (
    <div className="bg-[var(--background)]">
       <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Category Navigation Bar */}
        <div className="border-b border-[var(--border)] py-4 hidden md:block">
            <nav className="flex items-center justify-center gap-x-8 text-base tracking-wider">
                {categories.slice(0, 10).map(cat => (
                    <button 
                        key={cat.id} 
                        onClick={() => setFilters({...filters, categories: [cat.name]})}
                        className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors duration-300"
                    >
                        {cat.name}
                    </button>
                ))}
            </nav>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-12">
          {/* Filters Sidebar (Desktop) */}
          <aside className="hidden lg:block py-10 pr-8">
            <FilterSidebar
                filters={filters}
                onFilterChange={setFilters}
                categories={categories}
                maxPrice={maxPriceValue}
                sortOption={sortOption}
                onSortChange={setSortOption}
             />
          </aside>
          
          {/* Products Grid */}
          <main className="lg:col-span-3 py-10 border-l border-[var(--border)] pl-12">
            <div className="flex flex-col md:flex-row items-center justify-end mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <span className="text-sm text-[var(--muted-foreground)] hidden md:block">{sortedProducts.length} produtos</span>

                    {/* Mobile Filter Trigger */}
                     <Sheet>
                        <SheetTrigger asChild>
                             <Button variant="outline" className="lg:hidden">
                                <Filter className="w-4 h-4 mr-2" />
                                Filtrar e Ordenar
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="overflow-y-auto p-6">
                            <SheetHeader>
                                <SheetTitle>Filtros</SheetTitle>
                            </SheetHeader>
                            <div className="py-4">
                                <FilterSidebar
                                    filters={filters}
                                    onFilterChange={setFilters}
                                    categories={categories}
                                    maxPrice={maxPriceValue}
                                    sortOption={sortOption}
                                    onSortChange={setSortOption}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
            <ProductGrid 
              products={sortedProducts}
              onProductClick={setSelectedProduct}
            />
          </main>
        </div>
      </div>
      
      <Dialog open={!!selectedProduct} onOpenChange={(isOpen) => { if (!isOpen) setSelectedProduct(null); }}>
        <DialogContent className="max-w-4xl w-full p-6">
            {selectedProduct && (
                <ProductDetail
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onAddToCart={addToCart}
                />
            )}
        </DialogContent>
      </Dialog>
      
      <Sheet open={showCart} onOpenChange={setShowCart}>
          <SheetContent className="p-6 flex flex-col">
              <CartSidebar
                  onClose={() => setShowCart(false)}
                  onOrderPlaced={() => {
                      clearCart();
                      setShowCart(false);
                  }}
                  storeConfig={storeConfig}
              />
          </SheetContent>
      </Sheet>

      <CartFab 
        onClick={() => setShowCart(true)}
      />
      <Footer storeConfig={storeConfig} />
    </div>
  );
}