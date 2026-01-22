import { UserRole, AdminUser, AuditLogEntry, AuditAction, SystemBankDetails } from '../types';

const STORAGE_KEY_USERS_DB = 'davpro_users_db';
const STORAGE_KEY_AUDIT_LOGS = 'davpro_audit_logs';
const STORAGE_KEY_SYSTEM_SETTINGS = 'davpro_system_settings';

// Seed Data
const MOCK_USERS_SEED: any[] = [
  {
    id: 'user-2',
    name: 'John Doe',
    username: 'john',
    email: 'john.doe@example.com',
    password: 'password',
    role: UserRole.USER,
    avatar: 'https://picsum.photos/seed/john/100/100',
    status: 'ACTIVE',
    createdAt: Date.now() - 2592000000
  },
  {
    id: 'user-3',
    name: 'Alice Wonder',
    username: 'alice',
    email: 'alice@crypto-scam.net',
    password: 'password',
    role: UserRole.USER,
    avatar: 'https://picsum.photos/seed/alice/100/100',
    status: 'DISABLED',
    createdAt: Date.now() - 604800000
  },
  {
    id: 'user-4',
    name: 'Michael Scott',
    username: 'michael',
    email: 'michael@dunder-mifflin.com',
    password: 'password',
    role: UserRole.USER,
    avatar: 'https://picsum.photos/seed/michael/100/100',
    status: 'ACTIVE',
    createdAt: Date.now() - 86400000
  }
];

// Helper to access DB
const getDbUsers = (): any[] => {
  const stored = localStorage.getItem(STORAGE_KEY_USERS_DB);
  return stored ? JSON.parse(stored) : [];
};

const saveDbUsers = (users: any[]) => {
  localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(users));
};

const getDbLogs = (): AuditLogEntry[] => {
  const stored = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
  return stored ? JSON.parse(stored) : [];
};

const saveDbLogs = (logs: AuditLogEntry[]) => {
  localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(logs));
};

export const getUsers = async (): Promise<AdminUser[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  let dbUsers = getDbUsers();

  // Seed mock users if DB is empty (first run)
  if (dbUsers.length === 0) {
    dbUsers = [...MOCK_USERS_SEED];
    saveDbUsers(dbUsers);
  }

  // Transform to AdminUser format
  return dbUsers.map(u => ({
    id: u.id,
    email: u.email || u.username, // Handle legacy schema
    name: u.name,
    role: u.role,
    avatar: u.avatar || `https://picsum.photos/seed/${u.id}/100/100`,
    status: u.status || 'ACTIVE',
    joinedAt: u.createdAt || Date.now()
  }));
};

export const updateUserStatus = async (userId: string, status: 'ACTIVE' | 'DISABLED'): Promise<AdminUser> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const dbUsers = getDbUsers();
  const index = dbUsers.findIndex(u => u.id === userId);
  
  if (index !== -1) {
    dbUsers[index].status = status;
    saveDbUsers(dbUsers);
    
    // Return updated object
    const u = dbUsers[index];
    return {
      id: u.id,
      email: u.email || u.username,
      name: u.name,
      role: u.role,
      avatar: u.avatar,
      status: u.status,
      joinedAt: u.createdAt
    };
  }
  
  throw new Error('User not found');
};

export const deleteUser = async (userId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const dbUsers = getDbUsers();
  const filtered = dbUsers.filter(u => u.id !== userId);
  saveDbUsers(filtered);
};

export const getAuditLogs = async (): Promise<AuditLogEntry[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const logs = getDbLogs();
  
  if (logs.length === 0) {
    // Return a default init log if empty
    return [{
      id: 'log-init',
      action: AuditAction.SYSTEM_UPDATE,
      adminName: 'System',
      targetUser: 'N/A',
      timestamp: Date.now(),
      details: 'Audit Log System Initialized'
    }];
  }
  
  return logs.sort((a, b) => b.timestamp - a.timestamp);
};

export const addAuditLog = async (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> => {
   const newLog: AuditLogEntry = {
     ...entry,
     id: 'log-' + Math.random().toString(36).substr(2, 9),
     timestamp: Date.now()
   };
   
   const logs = getDbLogs();
   logs.push(newLog);
   saveDbLogs(logs);
};

// --- Monetization / System Settings ---

export const getSystemBankDetails = async (): Promise<SystemBankDetails> => {
  // Allow synchronous read for UI but keep promise signature for future async API
  const stored = localStorage.getItem(STORAGE_KEY_SYSTEM_SETTINGS);
  return stored ? JSON.parse(stored) : {
    bankName: '',
    accountName: '',
    accountNumber: '',
    isVisible: false
  };
};

export const saveSystemBankDetails = async (details: SystemBankDetails): Promise<void> => {
  localStorage.setItem(STORAGE_KEY_SYSTEM_SETTINGS, JSON.stringify(details));
};