export interface PermissionSet {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface Role {
  _id: string;
  name: string;
  code: string;
  permissions: Record<string, PermissionSet>;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  roles: Role[];
  isActive: boolean;
}

export enum StoreStatus {
  UPLOADED = 'UPLOADED',
  RECCE_ASSIGNED = 'RECCE_ASSIGNED',
  RECCE_SUBMITTED = 'RECCE_SUBMITTED',
  RECCE_APPROVED = 'RECCE_APPROVED',
  RECCE_REJECTED = 'RECCE_REJECTED',
  INSTALLATION_ASSIGNED = 'INSTALLATION_ASSIGNED',
  INSTALLATION_SUBMITTED = 'INSTALLATION_SUBMITTED',
  INSTALLATION_REJECTED = 'INSTALLATION_REJECTED',
  COMPLETED = 'COMPLETED',
}

export interface Store {
  _id: string;
  storeId: string;
  dealerCode: string;
  storeName: string;
  vendorCode?: string;
  clientCode?: string;
  location: {
    zone?: string;
    state?: string;
    district?: string;
    city: string;
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  commercials?: {
    poNumber?: string;
    poMonth?: string;
    invoiceNumber?: string;
    invoiceRemarks?: string;
    totalCost?: number;
  };
  costDetails?: {
    boardRate?: number;
    totalBoardCost?: number;
    angleCharges?: number;
    scaffoldingCharges?: number;
    transportation?: number;
    flanges?: number;
    lollipop?: number;
    oneWayVision?: number;
    sunboard?: number;
  };
  specs?: {
    boardSize?: string;
    type?: string;
    width?: number;
    height?: number;
    qty?: number;
  };
  currentStatus: StoreStatus;
  workflow: {
    recceAssignedTo?: { _id: string; name: string; email: string };
    installationAssignedTo?: { _id: string; name: string; email: string };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Enquiry {
  _id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedTo?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Recce {
  _id: string;
  storeId: Store;
  assignedDate: string;
  submittedDate?: string;
  sizes?: { width: number; height: number };
  photos?: { front: string; side: string; closeUp: string };
  notes?: string;
  status: string;
}

export interface Installation {
  _id: string;
  storeId: Store;
  assignedDate: string;
  submittedDate?: string;
  photos?: { after1?: string; after2?: string };
  status: string;
}
