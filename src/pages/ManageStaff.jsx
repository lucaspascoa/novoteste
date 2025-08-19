
import React, { useState, useEffect } from 'react';
import { Staff, Role } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Users, Trash2, Edit, Eye, EyeOff, X, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import PermissionGuard, { usePermissions } from "@/components/auth/PermissionCheck";

/**
 * StaffForm Component
 * Renders a form for creating or editing staff members.
 * It's an overlay that appears when adding/editing staff.
 */
function StaffForm({ staff, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    username: staff?.username || "",
    password: staff?.password || "",
    full_name: staff?.full_name || "",
    role: staff?.role || "", // This should be the role name, e.g., "vendedor"
    status: staff?.status || "active"
  });

  const [roles, setRoles] = useState([]); // State to load available roles
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // For password visibility toggle

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const rolesData = await Role.list();
      setRoles(rolesData);
      // If creating new staff and no role is pre-selected, set the first role as default
      if (!staff && !formData.role && rolesData.length > 0) {
        setFormData(prev => ({ ...prev, role: rolesData[0].name }));
      }
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
      // Handle error, e.g., show a toast message
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
      // onSave will handle closing the form and resetting states in ManageStaff
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onCancel} // Close form when clicking outside the modal content
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the form
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold">{staff ? "Editar Funcionário" : "Novo Funcionário"}</h3>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange("full_name", e.target.value)}
              placeholder="Digite o nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Nome de Usuário *</Label>
            <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="Digite o usuário para login"
                required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha {staff ? '' : '*'}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required={!staff} // Senha obrigatória apenas para novos usuários
                placeholder={staff ? "Deixe em branco para manter a senha atual" : "Digite a senha"}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Perfil *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange("role", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o perfil" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name} {role.description ? `- ${role.description}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Salvando..." : (staff ? "Atualizar" : "Criar")}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/**
 * ManageStaff Component
 * Manages staff members, including listing, adding, editing, and deleting.
 * Integrates with a permission system.
 */
export default function ManageStaff() {
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]); // State to load available roles for filtering
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null); // Stores staff member being edited
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteStaff, setDeleteStaff] = useState(null); // State for potential delete confirmation modal

  const { hasPermission } = usePermissions(); // Hook to check user permissions

  useEffect(() => {
    loadStaff();
    loadRoles(); // Load roles for the filter
  }, []);

  const loadStaff = async () => {
    setIsLoading(true);
    try {
      const users = await Staff.list('-created_date');
      setStaff(users);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      setError('Erro ao carregar funcionários.');
    }
    setIsLoading(false);
  };

  const loadRoles = async () => {
    try {
      const rolesData = await Role.list();
      setRoles(rolesData);
    } catch (error) {
      console.error('Erro ao carregar perfis para filtro:', error);
    }
  };

  const handleSave = async (staffData) => { // staffData is passed from StaffForm
    setError('');
    setSuccess('');

    // Permission check for saving staff
    if (!hasPermission('staff.manage')) {
      setError('Você não tem permissão para realizar esta ação.');
      return;
    }

    try {
      if (!editingStaff) {
        // Check if username already exists only for new users
        const existingUsers = await Staff.filter({ username: staffData.username });
        if (existingUsers.length > 0) {
          setError('Este nome de usuário já existe');
          return;
        }
      }

      if (editingStaff) {
        await Staff.update(editingStaff.id, staffData);
        setSuccess('Funcionário atualizado com sucesso!');
      } else {
        await Staff.create(staffData);
        setSuccess('Funcionário criado com sucesso!');
      }

      setShowForm(false); // Close the form
      setEditingStaff(null); // Clear editing state
      loadStaff(); // Reload the staff list
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
      setError('Erro ao salvar funcionário.');
    }
  };

  const handleDelete = async (staffId) => {
    // Permission check for deleting staff
    if (!hasPermission('staff.manage')) {
      setError('Você não tem permissão para realizar esta ação.');
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
      setError('');
      setSuccess('');
      try {
        await Staff.delete(staffId);
        setSuccess('Funcionário excluído com sucesso!');
        loadStaff();
      } catch (error) {
        console.error('Erro ao excluir funcionário:', error);
        setError('Erro ao excluir funcionário.');
      }
    }
  };

  // Helper function to determine badge color based on role name
  const getRoleBadgeColor = (roleName) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      gerente: 'bg-blue-100 text-blue-800',
      vendedor: 'bg-green-100 text-green-800',
      caixa: 'bg-yellow-100 text-yellow-800'
    };
    return colors[roleName] || 'bg-gray-100 text-gray-800'; // Default if role not explicitly defined
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || s.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || s.role === filterRole;
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gerenciar Equipe</h1>
            <p className="text-slate-600 mt-1">Cadastre e gerencie funcionários da loja</p>
          </div>

          <PermissionGuard permission="staff.manage">
            <Button
              onClick={() => {
                setEditingStaff(null); // Set to null for "New Staff" mode
                setShowForm(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Funcionário
            </Button>
          </PermissionGuard>
        </div>

        {(error || success) && (
          <Alert className={`mb-6 ${error ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <AlertDescription className={error ? 'text-red-800' : 'text-green-800'}>
              {error || success}
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-6 flex flex-wrap gap-4">
          <Input 
            placeholder="Buscar por nome ou usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Perfis</SelectItem>
              {roles.map(role => (
                <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
           <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setFilterRole("all");
                setFilterStatus("all");
              }}
            >
              Limpar
            </Button>
        </div>

        {/* List of Staff (Cards Layout) */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-slate-200/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Funcionários Cadastrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-slate-500 mt-2">Carregando...</p>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Nenhum funcionário encontrado com os filtros aplicados.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStaff.map((member) => (
                  <Card key={member.id} className="bg-white shadow-lg border-slate-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="w-5 h-5 text-blue-600" />
                        {member.full_name}
                      </CardTitle>
                      <CardDescription className="text-sm text-slate-500">@{member.username}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                          {member.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Badge className={getRoleBadgeColor(member.role)}>
                          {member.role}
                        </Badge>
                      </div>

                      <PermissionGuard permission="staff.manage">
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setEditingStaff(member); setShowForm(true); }}
                            className="flex-1"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(member.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </PermissionGuard>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Staff Form Overlay (renders StaffForm component) */}
        <AnimatePresence>
          {showForm && (
            <StaffForm
              staff={editingStaff} // Pass existing staff data if editing
              onSave={handleSave} // Callback for saving staff
              onCancel={() => {
                setShowForm(false); // Close the form
                setEditingStaff(null); // Clear editing state
                setError(''); // Clear any form-related errors
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
