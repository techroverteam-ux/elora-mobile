import { useAuth } from '../context/AuthContext';

/**
 * Check if the current user is permitted to delete a given store.
 * - ADMIN and SUB_ADMIN (and SUPER_ADMIN, MANAGER) can delete any store across all stages.
 * - Field users (RECCE, INSTALLATION) can ONLY delete stores that they created.
 */
export const canDeleteStore = (user: any, store: any): boolean => {
  if (!user || !store) return false;

  const roleKeys = (role: any): string[] =>
    [role?.code, role?.name]
      .filter(Boolean)
      .map((v: any) => String(v).trim().toUpperCase().replace(/[\s-]+/g, '_'));

  // 1. Privileged users can delete any store across all stages
  const isPrivileged =
    Array.isArray(user.roles) &&
    user.roles.some((role: any) =>
      roleKeys(role).some((k) => ['SUPER_ADMIN', 'ADMIN', 'SUB_ADMIN', 'MANAGER'].includes(k))
    );

  if (isPrivileged) return true;

  // 2. Field users can ONLY delete stores that they created
  const createdById =
    typeof store.createdBy === 'object' && store.createdBy !== null
      ? store.createdBy._id || store.createdBy.id
      : store.createdBy;

  const currentUserId = user._id || user.id;

  if (createdById && currentUserId && String(createdById) === String(currentUserId)) {
    return true;
  }

  return false;
};

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (resource: string, action: 'view' | 'create' | 'edit' | 'delete'): boolean => {
    if (!user || !user.roles || !Array.isArray(user.roles)) return false;

    return user.roles.some(role => {
      const permissions = role.permissions?.[resource];
      return permissions?.[action] === true;
    });
  };

  const checkCanDeleteStore = (store: any): boolean => canDeleteStore(user, store);

  return { hasPermission, canDeleteStore: checkCanDeleteStore, user };
};