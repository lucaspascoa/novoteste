
import React, { useState } from "react";
import { X, Upload, Plus, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { UploadFile } from "@/api/integrations";

export default function ProductForm({ product, categories, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    detailed_description: product?.detailed_description || "",
    price: product?.price || 0,
    original_price: product?.original_price ?? null, // Use null for no original price
    discount_percentage: product?.discount_percentage ?? null, // Use null for no discount
    category: product?.category || "",
    images: product?.images || [],
    video_url: product?.video_url || "",
    colors: product?.colors || [],
    sizes: product?.sizes || [],
    stock: product?.stock || 0,
    minimum_stock: product?.minimum_stock || 0, // Added new field
    allow_zero_stock: product?.allow_zero_stock || false, // Added new field
    featured: product?.featured || false,
    promotion_tag: product?.promotion_tag || "",
    rating: product?.rating || 5,
    status: product?.status || "active"
  });

  const [newColor, setNewColor] = useState({ name: "", hex: "#000000" });
  const [newSize, setNewSize] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => UploadFile({ file }));
      const results = await Promise.all(uploadPromises);
      const imageUrls = results.map(result => result.file_url);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
    } catch (error) {
      console.error("Erro ao fazer upload das imagens:", error);
    }
    setUploading(false);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addColor = () => {
    if (!newColor.name.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { ...newColor }]
    }));
    setNewColor({ name: "", hex: "#000000" });
  };

  const removeColor = (index) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  const addSize = () => {
    if (!newSize.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, newSize.trim()]
    }));
    setNewSize("");
  };

  const removeSize = (index) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Calcular stock_status baseado nos valores
      let stockStatus = "in_stock";
      if (formData.stock === 0) {
        stockStatus = "out_of_stock";
      } else if (formData.stock <= formData.minimum_stock) {
        stockStatus = "low_stock";
      }
      
      const dataToSave = {
        ...formData,
        stock_status: stockStatus
      };
      
      await onSave(dataToSave);
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
    }
    
    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-slate-900">
            {product ? "Editar Produto" : "Novo Produto"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Digite o nome do produto"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price, Stock and Inventory Management */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price">Preço Atual *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Estoque Atual *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange("stock", parseInt(e.target.value) || 0)}
                placeholder="Quantidade disponível"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum_stock">Estoque Mínimo</Label>
              <Input
                id="minimum_stock"
                type="number"
                min="0"
                value={formData.minimum_stock}
                onChange={(e) => handleInputChange("minimum_stock", parseInt(e.target.value) || 0)}
                placeholder="Alerta quando atingir"
              />
            </div>
          </div>
          
          {/* Original Price and Discount Percentage */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="original_price">Preço Original</Label>
              <Input
                id="original_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.original_price ?? ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : parseFloat(e.target.value);
                  handleInputChange("original_price", value);

                  // If original price is set, and discount is active, recalculate price
                  if (value !== null && formData.discount_percentage !== null && formData.discount_percentage > 0) {
                      const discountedPrice = value * (1 - formData.discount_percentage / 100);
                      handleInputChange("price", parseFloat(discountedPrice.toFixed(2)));
                  } else if (value !== null && (formData.discount_percentage === null || formData.discount_percentage === 0)) {
                      // If original price is set and no discount, set price to original price
                      handleInputChange("price", parseFloat(value.toFixed(2)));
                  }
                }}
                placeholder="Preço antes do desconto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_percentage">Desconto (%)</Label>
              <Input
                id="discount_percentage"
                type="number"
                min="0"
                max="100"
                step="1"
                value={formData.discount_percentage ?? ''}
                onChange={(e) => {
                  const discountValue = e.target.value; // Keep raw string to check for empty
                  const discount = parseFloat(discountValue); // Parsed value
                  
                  handleInputChange("discount_percentage", discountValue === '' ? null : discount);

                  if (formData.original_price !== null && formData.original_price !== undefined) {
                    if (discountValue === '' || discount === 0) {
                      // If discount is cleared or set to 0, revert price to original_price
                      handleInputChange("price", parseFloat(formData.original_price.toFixed(2)));
                    } else if (discount > 0 && discount <= 100) { // Ensure discount is valid
                      const discountedPrice = formData.original_price * (1 - discount / 100);
                      handleInputChange("price", parseFloat(discountedPrice.toFixed(2)));
                    }
                  }
                }}
                placeholder="% de desconto"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição Resumida</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descrição curta que aparece na lista de produtos"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="detailed_description">Descrição Detalhada</Label>
            <Textarea
              id="detailed_description"
              value={formData.detailed_description}
              onChange={(e) => handleInputChange("detailed_description", e.target.value)}
              placeholder="Descrição completa que aparece na página do produto"
              rows={5}
            />
          </div>

          {/* Images */}
          <div className="space-y-4">
            <Label>Imagens do Produto</Label>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Produto ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-lg border border-slate-200"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              
              <div className="aspect-square border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer text-center">
                  {uploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  ) : (
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  )}
                  <span className="text-xs text-slate-500">Adicionar</span>
                </label>
              </div>
            </div>
          </div>

          {/* Video */}
          <div className="space-y-2">
            <Label htmlFor="video_url">URL do Vídeo (YouTube, Vimeo, etc.)</Label>
            <Input
              id="video_url"
              value={formData.video_url}
              onChange={(e) => handleInputChange("video_url", e.target.value)}
              placeholder="https://www.youtube.com/embed/..."
            />
            {formData.video_url && (
              <div className="mt-2 p-2 bg-slate-50 rounded-lg flex items-center gap-2">
                <Play className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">Vídeo adicionado</span>
              </div>
            )}
          </div>

          {/* Colors */}
          <div className="space-y-4">
            <Label>Cores Disponíveis</Label>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.colors.map((color, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-2 pr-1">
                  <div
                    className="w-4 h-4 rounded-full border border-slate-300"
                    style={{ backgroundColor: color.hex }}
                  />
                  {color.name}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="w-4 h-4 p-0 hover:bg-red-100"
                    onClick={() => removeColor(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Nome da cor"
                value={newColor.name}
                onChange={(e) => setNewColor(prev => ({ ...prev, name: e.target.value }))}
                className="flex-1"
              />
              <input
                type="color"
                value={newColor.hex}
                onChange={(e) => setNewColor(prev => ({ ...prev, hex: e.target.value }))}
                className="w-12 h-10 rounded border border-slate-200"
              />
              <Button type="button" onClick={addColor} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-4">
            <Label>Tamanhos Disponíveis</Label>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.sizes.map((size, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-2 pr-1">
                  {size}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="w-4 h-4 p-0 hover:bg-red-100"
                    onClick={() => removeSize(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Tamanho (P, M, G, 38, 40, etc.)"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                className="flex-1"
              />
              <Button type="button" onClick={addSize} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Additional Options */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="promotion_tag">Tag de Promoção</Label>
              <Input
                id="promotion_tag"
                value={formData.promotion_tag}
                onChange={(e) => handleInputChange("promotion_tag", e.target.value)}
                placeholder="Novo, -10%, Oferta, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Avaliação (1-5)</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => handleInputChange("rating", parseFloat(e.target.value) || 5)}
              />
            </div>
          </div>

          {/* Checkboxes / Inventory Settings */}
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-3">Configurações de Estoque</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allow_zero_stock"
                    checked={formData.allow_zero_stock}
                    onCheckedChange={(checked) => handleInputChange("allow_zero_stock", checked)}
                  />
                  <Label htmlFor="allow_zero_stock" className="text-sm">
                    Permitir vendas mesmo sem estoque disponível
                  </Label>
                </div>
                <p className="text-xs text-yellow-700">
                  Se marcado, o produto continuará ativo para venda mesmo quando o estoque for zero.
                  Caso contrário, o produto será automaticamente desativado quando não houver estoque.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange("featured", checked)}
                />
                <Label htmlFor="featured">Produto em destaque</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={formData.status === "active"}
                  onCheckedChange={(checked) => handleInputChange("status", checked ? "active" : "inactive")}
                />
                <Label htmlFor="active">Produto ativo</Label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                product ? "Atualizar Produto" : "Criar Produto"
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
