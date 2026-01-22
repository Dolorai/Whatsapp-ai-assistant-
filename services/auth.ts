import { User, UserRole } from '../types';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASS } from '../constants';

const STORAGE_KEY_USER = 'davpro_auth_user';
const STORAGE_KEY_USERS_DB = 'davpro_users_db';

export const login = async (email: string, pass: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  // 1. Check Admin Hardcoded
  if (email === DEMO_ADMIN_EMAIL && pass === DEMO_ADMIN_PASS) {
    const admin: User = {
      id: 'admin-1',
      email: DEMO_ADMIN_EMAIL,
      name: 'Super Admin',
      role: UserRole.ADMIN,
      avatar: 'https://picsum.photos/100/100',
      status: 'ACTIVE'
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(admin));
    return admin;
  }

  // 2. Check Registered Users in LocalStorage
  const storedDb = localStorage.getItem(STORAGE_KEY_USERS_DB);
  if (storedDb) {
    const usersDb = JSON.parse(storedDb);
    const foundUser = usersDb.find((u: any) => (u.email === email || u.username === email) && u.password === pass);
    
    if (foundUser) {
      // SECURITY CHECK: Is user active?
      if (foundUser.status === 'DISABLED') {
        throw new Error('Your account has been disabled. Please contact support.');
      }

      const user: User = {
        id: foundUser.id,
        email: foundUser.email || foundUser.username,
        name: foundUser.name,
        role: UserRole.USER,
        avatar: foundUser.avatar || `https://picsum.photos/seed/${foundUser.id}/100/100`,
        status: foundUser.status || 'ACTIVE'
      };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      return user;
    }
  }

  // 3. Fallback Mock for testing if no DB exists (Legacy behavior)
  if (!storedDb && email.includes('@')) {
    const user: User = {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      email,
      name: email.split('@')[0],
      role: UserRole.USER,
      avatar: `https://picsum.photos/seed/${email}/100/100`,
      status: 'ACTIVE'
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    return user;
  }

  throw new Error('Invalid credentials');
};

export const register = async (userData: any): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const newUser = {
    id: 'user-' + Math.random().toString(36).substr(2, 9),
    username: userData.username,
    email: userData.username, // Using username as email for simplicity
    password: userData.password,
    name: userData.fullName,
    role: UserRole.USER,
    status: 'ACTIVE', // Default status
    createdAt: Date.now()
  };

  // Save to DB
  const storedDb = localStorage.getItem(STORAGE_KEY_USERS_DB);
  const usersDb = storedDb ? JSON.parse(storedDb) : [];
  
  // Check duplicates
  if (usersDb.find((u: any) => u.username === newUser.username)) {
    throw new Error('Username already exists');
  }

  usersDb.push(newUser);
  localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(usersDb));

  // Auto Login
  const userSession: User = {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: UserRole.USER,
    avatar: `https://picsum.photos/seed/${newUser.id}/100/100`,
    status: 'ACTIVE'
  };
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userSession));

  return userSession;
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEY_USER);
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(STORAGE_KEY_USER);
  return stored ? JSON.parse(stored) : null;
};