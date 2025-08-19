import React, { useState, useEffect } from "react";
import { Product, Category, AuditLog } from "@/api/entities";
import { Plus, Search, Filter, Edit, Trash2, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

import ProductForm from "../components/admin/ProductForm";
import ProductCard from "../components/admin/ProductCard";
import DeleteConfirmDialog from "../components/admin/DeleteConfirmDialog";
import PermissionGuard, { usePermissions } from "@/components/auth/PermissionCheck";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const { hasPermission } = usePermissions();

  useEffect(() => {
    loadData();
    const user = localStorage.getItem('currentUser');
    if (user) {
        setCurrentUser(JSON.parse(user));
    }
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        Product.list("-created_date"),
        Category.list("order")
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setIsLoading(false);
  };

  const handleSaveProduct = async (productData) => {
    const requiredPermission = editingProduct ? 'products.update' : 'products.create';
    if (!hasPermission(requiredPermission)) {
      alert('Você não tem permissão para realizar esta ação.');
      return;
    }

    try {
      let savedProduct;
      if (editingProduct) {
        const originalProductData = { ...editingProduct }; 
        savedProduct = await Product.update(editingProduct.id, productData);
        await AuditLog.create({
            entity_name: "Product",
            entity_id: editingProduct.id,
            action: "UPDATE",
            changes: {
                before: originalProductData,
                after: productData
            },
            performed_by_id: currentUser?.id,
            performed_by_name: currentUser?.full_name
        });
      } else {
        savedProduct = await Product.create(productData);
        await AuditLog.create({
            entity_name: "Product",
            entity_id: savedProduct.id,
            action: "CREATE",
            changes: {
                before: {},
                after: productData
            },
            performed_by_id: currentUser?.id,
            performed_by_name: currentUser?.full_name
        });
      }
      setShowForm(false);
      setEditingProduct(null);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
    }
  };

  const handleDeleteProduct = async () => {
    if (!hasPermission('products.delete')) {
      alert('Você não tem permissão para apagar produtos.');
      return;
    }
    if (!deleteProduct) return;
    
    try {
      await Product.delete(deleteProduct.id);
      await AuditLog.create({
            entity_name: "Product",
            entity_id: deleteProduct.id,
            action: "DELETE",
            changes: {
                before: deleteProduct,
                after: {}
            },
            performed_by_id: currentUser?.id,
            performed_by_name: currentUser?.full_name
      });
      setDeleteProduct(null);
      loadData();
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
    }
  };

  const handleToggleFeatured = async (product) => {
    if (!hasPermission('products.update')) {
      alert('Você não tem permissão para editar produtos.');
      return;
    }

    try {
      const originalProductData = { ...product };
      const updatedProduct = { ...product, featured: !product.featured };
      await Product.update(product.id, updatedProduct);
      
      await AuditLog.create({
        entity_name: "Product",
        entity_id: product.id,
        action: "UPDATE",
        changes: {
          before: originalProductData,
          after: updatedProduct
        },
        performed_by_id: currentUser?.id,
        performed_by_name: currentUser?.full_name
      });

      loadData();
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
    }
  };

  const handleToggleStatus = async (product) => {
    if (!hasPermission('products.update')) {
      alert('Você não tem permissão para editar produtos.');
      return;
    }

    try {
      const originalProductData = { ...product };
      const newStatus = product.status === 'active' ? 'inactive' : 'active';
      const updatedProduct = { ...product, status: newStatus };
      await Product.update(product.id, updatedProduct);

      await AuditLog.create({
        entity_name: "Product",
        entity_id: product.id,
        action: "UPDATE",
        changes: {
          before: originalProductData,
          after: updatedProduct
        },
        performed_by_id: currentUser?.id,
        performed_by_name: currentUser?.full_name
      });
      
      loadData();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || product.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gerenciar Produtos</h1>
            <p className="text-slate-600 mt-1">Adicione, edite e organize seus produtos</p>
          </div>
          
          <PermissionGuard permission="products.create">
            <Button
              onClick={() => {
                setEditingProduct(null);
                setShowForm(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </PermissionGuard>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200 focus:border-blue-500"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
            
            {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                }}
              >
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-2xl p-6 shadow-lg">
                <div className="aspect-square bg-slate-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  onEdit={(product) => {
                    if (hasPermission('products.update')) {
                      setEditingProduct(product);
                      setShowForm(true);
                    } else {
                      alert('Você não tem permissão para editar produtos.');
                    }
                  }}
                  onDelete={(product) => {
                    if (hasPermission('products.delete')) {
                      setDeleteProduct(product);
                    } else {
                      alert('Você não tem permissão para apagar produtos.');
                    }
                  }}
                  onToggleFeatured={handleToggleFeatured}
                  onToggleStatus={handleToggleStatus}
                  userPermissions={{ 
                    canEdit: hasPermission('products.update'),
                    canDelete: hasPermission('products.delete')
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? "Nenhum produto encontrado" 
                : "Nenhum produto cadastrado"}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? "Tente filtros diferentes ou limpe os filtros atuais."
                : "Comece adicionando seu primeiro produto à loja."}
            </p>
            {!searchTerm && selectedCategory === 'all' && selectedStatus === 'all' && (
              <PermissionGuard permission="products.create">
                <Button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowForm(true);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Produto
                </Button>
              </PermissionGuard>
            )}
          </div>
        )}

        {/* Product Form Modal */}
        <AnimatePresence>
          {showForm && (
            <ProductForm
              product={editingProduct}
              categories={categories}
              onSave={handleSaveProduct}
              onCancel={() => {
                setShowForm(false);
                setEditingProduct(null);
              }}
            />
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <DeleteConfirmDialog
          isOpen={!!deleteProduct}
          productName={deleteProduct?.name}
          onConfirm={handleDeleteProduct}
          onCancel={() => setDeleteProduct(null)}
        />
      </div>
    </div>
  );
}