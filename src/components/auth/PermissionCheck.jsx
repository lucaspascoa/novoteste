
import React, { useState, useEffect } from 'react';
import { Role } from '@/api/entities';

// Hook para verificar permissões
export const usePermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserPermissions = async () => {
      try {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          
          // CORREÇÃO: Aplicar a mesma regra de superusuário do layout
          if (user.role && (user.role.toLowerCase() === 'admin')) {
             setPermissions([
                "dashboard.read", "products.read", "products.create", "products.update", "products.delete", 
                "orders.read", "orders.update", "staff.read", "staff.manage", "settings.read", "settings.update",
                "roles.read", "roles.manage"
              ]);
          } else {
            const roles = await Role.filter({ name: user.role });
            if (roles.length > 0) {
              setPermissions(roles[0].permissions || []);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar permissões:', error);
        setPermissions([]);
      }
      setLoading(false);
    };

    loadUserPermissions();
  }, []);

  const hasPermission = (permission) => {
    // CORREÇÃO: Garantir que o admin sempre tenha permissão
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        if (user.role && user.role.toLowerCase() === 'admin') {
          return true;
        }
      } catch (e) {
        console.error("Erro ao analisar user do localStorage:", e);
      }
    }
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionsList) => {
    // CORREÇÃO: Garantir que o admin sempre tenha permissão
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        if (user.role && user.role.toLowerCase() === 'admin') {
          return true;
        }
      } catch (e) {
        console.error("Erro ao analisar user do localStorage:", e);
      }
    }
    return permissionsList.some(permission => permissions.includes(permission));
  };

  return { permissions, hasPermission, hasAnyPermission, loading };
};

// Componente para renderizar condicionalmente baseado em permissões
export const PermissionGuard = ({ permission, permissions, children, fallback = null }) => {
  const { hasPermission, hasAnyPermission } = usePermissions();

  const hasAccess = permission 
    ? hasPermission(permission)
    : permissions 
    ? hasAnyPermission(permissions)
    : true;

  return hasAccess ? children : fallback;
};

export default PermissionGuard;
