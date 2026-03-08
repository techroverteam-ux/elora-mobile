export interface User {
  _id: string;
  name: string;
  email: string;
  roles: Role[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  _id: string;
  name: string;
  code: string;
  permissions: Record<string, PermissionSet>;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionSet {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface Store {
  _id: string;
  storeId?: string;
  dealerCode: string;
  storeName: string;
  clientCode?: string;
  location: {
    city: string;
    state?: string;
    district?: string;
    zone?: string;
    address?: string;
    pincode?: string;
  };
  currentStatus: string;
  assignedTo?: {
    recce?: User;
    installation?: User;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'NEW' | 'READ' | 'CONTACTED' | 'RESOLVED';
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RFQ {
  _id: string;
  stores: Store[];
  generatedBy: User;
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  overview: {
    totalStores: number;
    activeUsers: number;
    totalAssigned: number;
    pending: number;
    submitted: number;
    approved: number;
    completed: number;
    completionRate: number;
  };
  recce: {
    total: number;
    assigned: number;
    submitted: number;
    approved: number;
    rejected: number;
    completionRate: number;
  };
  installation: {
    total: number;
    assigned: number;
    submitted: number;
    completed: number;
    completionRate: number;
  };
  recentActivity: {
    newStores: number;
    recceSubmissions: number;
    installations: number;
    submissionsLast7Days: number;
  };
  topPerformers: {
    recce: Array<{ name: string; count: number }>;
    installation: Array<{ name: string; count: number }>;
  };
  distribution: {
    byCity: Array<{ _id: string; count: number }>;
  };
  assignments: Array<{
    storeName: string;
    dealerCode: string;
    city: string;
    state: string;
    assignedTo: string;
    role: string;
    date: string;
    status: string;
    storeId: string;
  }>;
  myTasks: Array<{
    storeName: string;
    city: string;
    district: string;
    state: string;
    status: string;
    assignedDate: string;
  }>;
}