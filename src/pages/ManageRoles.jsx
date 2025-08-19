import React, { useState, useEffect } from "react";
import { Role } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Shield, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";

const allPermissions = {
    "Dashboard": [{ id: "dashboard.read", label: "Ver Dashboard" }],
    "Produtos": [
        { id: "products.read", label: "Ver Produtos" },
        { id: "products.create", label: "Criar Produtos" },
        { id: "products.update", label: "Editar Produtos" },
        { id: "products.delete", label: "Apagar Produtos" },
    ],
    "Pedidos": [
        { id: "orders.read", label: "Ver Pedidos" },
        { id: "orders.update", label: "Atualizar Status de Pedidos" },
    ],
    "Equipe": [
        { id: "staff.read", label: "Ver Equipe" },
        { id: "staff.manage", label: "Gerenciar Equipe (Adicionar/Editar)" },
    ],
    "Perfis e Permissões": [
        { id: "roles.read", label: "Ver Perfis" },
        { id: "roles.manage", label: "Gerenciar Perfis e Permissões" },
    ],
    "Configurações da Loja": [
        { id: "settings.read", label: "Ver Configurações" },
        { id: "settings.update", label: "Atualizar Configurações" },
    ],
};

function RoleForm({ role, onSave, onCancel }) {
    const [name, setName] = useState(role?.name || "");
    const [description, setDescription] = useState(role?.description || "");
    const [permissions, setPermissions] = useState(role?.permissions || []);

    const handlePermissionChange = (permissionId, checked) => {
        if (checked) {
            setPermissions(prev => [...prev, permissionId]);
        } else {
            setPermissions(prev => prev.filter(p => p !== permissionId));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...role, name, description, permissions });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={onCancel}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b">
                    <h3 className="text-xl font-bold">{role?.id ? "Editar Perfil" : "Novo Perfil"}</h3>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="role-name">Nome do Perfil</Label>
                        <Input id="role-name" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role-desc">Descrição</Label>
                        <Input id="role-desc" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    
                    <div>
                        <h4 className="font-semibold mb-4">Permissões</h4>
                        <div className="space-y-4">
                            {Object.entries(allPermissions).map(([group, perms]) => (
                                <div key={group}>
                                    <h5 className="font-medium text-slate-800 mb-2">{group}</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 pl-2">
                                        {perms.map(perm => (
                                            <div key={perm.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={perm.id}
                                                    checked={permissions.includes(perm.id)}
                                                    onCheckedChange={(checked) => handlePermissionChange(perm.id, checked)}
                                                />
                                                <Label htmlFor={perm.id} className="font-normal text-sm">{perm.label}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>
                <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit" onClick={handleSubmit}>Salvar</Button>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default function ManageRoles() {
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingRole, setEditingRole] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setIsLoading(true);
        const data = await Role.list();
        setRoles(data);
        setIsLoading(false);
    };

    const handleSave = async (roleData) => {
        if (roleData.id) {
            await Role.update(roleData.id, roleData);
        } else {
            await Role.create(roleData);
        }
        setShowForm(false);
        setEditingRole(null);
        loadRoles();
    };

    const handleDelete = async (roleId) => {
        if (window.confirm("Tem certeza que deseja apagar este perfil?")) {
            await Role.delete(roleId);
            loadRoles();
        }
    };

    if(isLoading) {
        return <div className="p-8">Carregando perfis...</div>
    }

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Perfis e Permissões</h1>
                    <p className="text-slate-600">Gerencie o que cada tipo de usuário pode fazer no sistema.</p>
                </div>
                <Button onClick={() => { setEditingRole(null); setShowForm(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Perfil
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map(role => (
                    <Card key={role.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-600"/>
                                {role.name}
                            </CardTitle>
                            <CardDescription>{role.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-medium mb-2 text-slate-700">Permissões ativas: {role.permissions?.length || 0}</p>
                            <div className="flex gap-2 mt-4">
                                <Button variant="outline" size="sm" onClick={() => { setEditingRole(role); setShowForm(true); }}>
                                    <Edit className="w-3 h-3 mr-1" /> Editar
                                </Button>
                                {role.name !== 'Admin' && (
                                    <Button variant="destructive-outline" size="sm" onClick={() => handleDelete(role.id)}>
                                        <Trash2 className="w-3 h-3 mr-1" /> Apagar
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <AnimatePresence>
                {showForm && (
                    <RoleForm
                        role={editingRole}
                        onSave={handleSave}
                        onCancel={() => setShowForm(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}