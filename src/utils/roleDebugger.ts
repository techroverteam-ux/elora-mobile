// Debug utility for role-based access control
// Add this to any component to debug user roles and permissions

export const debugUserRoles = (user: any) => {
  console.log('=== USER ROLE DEBUG ===');
  console.log('User object:', user);
  console.log('User roles array:', user?.roles);
  
  if (user?.roles && Array.isArray(user.roles)) {
    user.roles.forEach((role: any, index: number) => {
      console.log(`Role ${index + 1}:`, {
        name: role.name,
        code: role.code,
        permissions: role.permissions,
        fullRole: role
      });
    });
  } else {
    console.log('No roles found or roles is not an array');
  }
  
  console.log('======================');
};

// Test role access for specific modules
export const testModuleAccess = (user: any, moduleName: string) => {
  console.log(`=== TESTING ACCESS TO ${moduleName.toUpperCase()} ===`);
  
  if (!user || !user.roles) {
    console.log('❌ No user or roles');
    return false;
  }
  
  // Check SUPER_ADMIN
  const isSuperAdmin = user.roles.some((r: any) => 
    r.code === "SUPER_ADMIN" || r.name === "SUPER_ADMIN"
  );
  
  if (isSuperAdmin) {
    console.log('✅ SUPER_ADMIN access granted');
    return true;
  }
  
  // Check permissions
  const hasPermission = user.roles.some((role: any) => {
    console.log(`Checking role: ${role.name || role.code}`);
    
    if (role.permissions && role.permissions[moduleName]) {
      const canView = role.permissions[moduleName].view === true;
      console.log(`Permission object found: view = ${canView}`);
      return canView;
    }
    
    // Fallback to basic role access
    const basicAccess = checkBasicRoleAccess(role.name || role.code, moduleName);
    console.log(`Basic role access: ${basicAccess}`);
    return basicAccess;
  });
  
  console.log(`Final result: ${hasPermission ? '✅ ALLOWED' : '❌ DENIED'}`);
  console.log('=======================================');
  return hasPermission;
};

const checkBasicRoleAccess = (roleName: string, moduleName: string) => {
  const roleAccess: Record<string, string[]> = {
    'SUPER_ADMIN': ['dashboard', 'users', 'roles', 'stores', 'recce', 'installation', 'elements', 'clients', 'enquiries', 'reports'],
    'ADMIN': ['dashboard', 'stores', 'recce', 'installation', 'elements', 'clients', 'enquiries', 'reports'],
    'MANAGER': ['dashboard', 'stores', 'recce', 'installation', 'reports'],
    'CLIENT': ['dashboard', 'stores', 'recce', 'installation', 'reports'],
    'RECCE': ['dashboard', 'recce', 'stores'],
    'INSTALLATION': ['dashboard', 'installation', 'stores'],
    'FIELD_WORKER': ['dashboard', 'recce', 'installation']
  };
  
  return roleAccess[roleName]?.includes(moduleName) || false;
};