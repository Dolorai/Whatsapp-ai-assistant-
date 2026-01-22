export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  status?: 'ACTIVE' | 'DISABLED';
}

export interface AdminUser extends User {
  status: 'ACTIVE' | 'DISABLED';
  joinedAt: number;
}

export enum AuditAction {
  USER_BANNED = 'USER_BANNED',
  USER_UNBANNED = 'USER_UNBANNED',
  USER_DELETED = 'USER_DELETED',
  SYSTEM_UPDATE = 'SYSTEM_UPDATE'
}

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  adminName: string;
  targetUser: string;
  timestamp: number;
  details?: string;
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  address?: string; 
  operatingHours?: string; 
  logoUrl?: string; // New field for Website Logo
  whatsappNumber: string;
  welcomeMessage: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  products: Product[];
  themeColor: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface Order {
  id: string;
  businessId: string;
  customerName: string;
  customerWhatsapp: string;
  orderReference: string;
  amount: number;
  proofUrl: string | null;
  status: OrderStatus;
  timestamp: number;
}

export interface SystemBankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  isVisible: boolean;
}

export interface FeatureFlags {
  enableAi: boolean;
  enablePayments: boolean;
  maintenanceMode: boolean;
}

export enum AnimationStage { 
  Idle="IDLE", 
  Enter="ENTER", 
  Breathing="BREATHING", 
  DataFlow="DATA_FLOW", 
  Exit="EXIT", 
  Complete="COMPLETE" 
}