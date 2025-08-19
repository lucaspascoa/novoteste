import React, { useState, useEffect } from "react";
import { Category } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AnimatePresence, motion } from "framer-motion";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";

function CategoryForm({ category, onSave, onCancel }) {
    const [name, setName] = useState(category?.name || "");
    const [order, setOrder] = useState(category?.order || 0);
    const [status, setStatus] = useState(category?.status || "active");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ name, order, status });
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
            className="bg-white rounded-2xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">{category ? "Editar Categoria" : "Nova Categoria"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Categoria</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="order">Ordem de Exibição</Label>
                <Input id="order" type="number" value={order} onChange={(e) => setOrder(parseInt(e.target.value) || 0)} />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="status" 
                  checked={status === 'active'} 
                  onCheckedChange={(checked) => setStatus(checked ? 'active' : 'inactive')}
                />
                <Label htmlFor="status">Categoria Ativa</Label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
    );
}

export default function ManageCategories() {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deleteCategory, setDeleteCategory] = useState(null);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setIsLoading(true);
        const data = await Category.list("order");
        setCategories(data);
        setIsLoading(false);
    };

    const handleSave = async (categoryData) => {
        if (editingCategory) {
            await Category.update(editingCategory.id, categoryData);
        } else {
            await Category.create(categoryData);
        }
        setShowForm(false);
        setEditingCategory(null);
        loadCategories();
    };

    const handleDelete = async () => {
        if (!deleteCategory) return;
        await Category.delete(deleteCategory.id);
        setDeleteCategory(null);
        loadCategories();
    };

    return (
        <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Gerenciar Categorias</h1>
                        <p className="text-slate-600 mt-1">Crie e organize as categorias dos seus produtos.</p>
                    </div>
                    <Button onClick={() => { setEditingCategory(null); setShowForm(true); }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Categoria
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {isLoading ? (
                                <p>Carregando categorias...</p>
                            ) : categories.length === 0 ? (
                                <p className="text-center text-slate-500 py-8">Nenhuma categoria cadastrada.</p>
                            ) : (
                                categories.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between p-4 rounded-lg bg-white border">
                                        <div>
                                            <span className="font-semibold">{cat.name}</span>
                                            <span className={`ml-3 text-xs font-medium px-2 py-0.5 rounded-full ${cat.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                                                {cat.status === 'active' ? 'Ativa' : 'Inativa'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => { setEditingCategory(cat); setShowForm(true); }}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setDeleteCategory(cat)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <AnimatePresence>
                {showForm && (
                    <CategoryForm 
                        category={editingCategory} 
                        onSave={handleSave} 
                        onCancel={() => setShowForm(false)} 
                    />
                )}
            </AnimatePresence>
            
            <DeleteConfirmDialog 
                isOpen={!!deleteCategory}
                productName={deleteCategory?.name}
                onConfirm={handleDelete}
                onCancel={() => setDeleteCategory(null)}
            />
        </div>
    );
}