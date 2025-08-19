import React, { useState } from "react";
import { X, ShoppingCart, Play, Star, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export default function ProductDetail({ product, onClose, onAddToCart }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [showVideo, setShowVideo] = useState(false);

  const handleAddToCart = () => {
    let currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItem = {
      id: `${product.id}-${selectedColor?.hex || 'none'}-${selectedSize || 'none'}`,
      product,
      variations: {
        color: selectedColor,
        size: selectedSize,
        notes
      },
      quantity
    };

    const existingItemIndex = currentCart.findIndex(item => item.id === cartItem.id);
    let newCart = [...currentCart];
    if (existingItemIndex > -1) {
        newCart[existingItemIndex].quantity += quantity;
    } else {
        newCart.push(cartItem);
    }
    
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('storage'));
    
    onClose();
  };

  return (
    <>
      <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center z-10 -mx-6 -mt-6 mb-6">
        <h2 className="text-xl font-bold text-slate-900">Detalhes do Produto</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden">
            {showVideo && product.video_url ? (
              <iframe
                src={product.video_url}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <img
                src={product.images?.[selectedImage] || "https://via.placeholder.com/600"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}
            
            {product.video_url && !showVideo && (
              <Button
                onClick={() => setShowVideo(true)}
                className="absolute inset-0 bg-black/20 hover:bg-black/30 text-white"
              >
                <Play className="w-12 h-12" />
              </Button>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 overflow-x-auto">
            {product.video_url && (
              <button
                onClick={() => setShowVideo(true)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden ${
                  showVideo ? "border-blue-500" : "border-slate-200"
                }`}
              >
                <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                  <Play className="w-6 h-6 text-slate-600" />
                </div>
              </button>
            )}
            {product.images?.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedImage(index);
                  setShowVideo(false);
                }}
                className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden ${
                  selectedImage === index && !showVideo ? "border-blue-500" : "border-slate-200"
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
              {product.promotion_tag && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  {product.promotion_tag}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-bold text-blue-600">
                R$ {product.price?.toFixed(2)}
              </span>
              {product.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-amber-500 fill-current" />
                  <span className="font-medium text-slate-600">
                    {product.rating}
                  </span>
                </div>
              )}
            </div>

            <p className="text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Cores</h3>
              <div className="flex gap-3">
                {product.colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-4 transition-all duration-200 ${
                      selectedColor?.hex === color.hex
                        ? "border-blue-500 scale-110 shadow-lg"
                        : "border-white shadow-md hover:scale-105"
                    } ${color.hex.toLowerCase() === '#ffffff' ? 'border-slate-300' : ''}`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
              {selectedColor && (
                <p className="text-sm text-slate-600 mt-2">Cor selecionada: {selectedColor.name}</p>
              )}
            </div>
          )}

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Tamanhos</h3>
              <div className="flex gap-2">
                {product.sizes.map((size, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-all duration-200 ${
                      selectedSize === size
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Quantidade</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-r-none"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="rounded-l-none"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {product.stock && (
                <span className="text-sm text-slate-500">
                  {product.stock} disponíveis
                </span>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Observações (opcional)</h3>
            <Textarea
              placeholder="Adicione observações sobre o produto..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Add to Cart */}
          <div className="pt-4 border-t border-slate-200">
            <Button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl shadow-lg"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Adicionar ao Carrinho
            </Button>
          </div>

          {/* Detailed Description */}
          {product.detailed_description && (
            <div className="pt-6 border-t border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3">Descrição Detalhada</h3>
              <div className="prose prose-sm text-slate-600">
                {product.detailed_description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-2">{paragraph}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
