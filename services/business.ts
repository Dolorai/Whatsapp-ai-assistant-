import { Business, Product, User } from '../types';
import { MOCK_PRODUCTS, DEFAULT_BUSINESS_SETTINGS } from '../constants';

const STORAGE_KEY_BIZ = 'davpro_businesses';

export const getBusinessByUserId = async (userId: string): Promise<Business | null> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Network delay
  const stored = localStorage.getItem(STORAGE_KEY_BIZ);
  if (!stored) return null;
  
  const businesses: Business[] = JSON.parse(stored);
  return businesses.find(b => b.ownerId === userId) || null;
};

export const getBusinessById = async (id: string): Promise<Business | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const stored = localStorage.getItem(STORAGE_KEY_BIZ);
  if (!stored) return null;
  
  const businesses: Business[] = JSON.parse(stored);
  return businesses.find(b => b.id === id) || null;
};

export const createBusiness = async (user: User, details: any): Promise<Business> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Network delay
  
  const newBusiness: Business = {
    id: 'biz-' + Math.random().toString(36).substr(2, 9),
    ownerId: user.id,
    name: details.businessName,
    description: details.description,
    address: details.address || '',
    operatingHours: details.operatingHours || 'Mon-Fri: 9AM - 5PM',
    logoUrl: '',
    whatsappNumber: details.whatsappNumber,
    welcomeMessage: details.welcomeMessage || DEFAULT_BUSINESS_SETTINGS.welcomeMessage,
    bankName: details.bankName || 'Not Configured',
    accountName: details.accountName || 'Not Configured',
    accountNumber: details.accountNumber || '0000000000',
    products: MOCK_PRODUCTS, // Default products for demo
    themeColor: DEFAULT_BUSINESS_SETTINGS.themeColor
  };

  const stored = localStorage.getItem(STORAGE_KEY_BIZ);
  const businesses: Business[] = stored ? JSON.parse(stored) : [];
  businesses.push(newBusiness);
  localStorage.setItem(STORAGE_KEY_BIZ, JSON.stringify(businesses));
  
  return newBusiness;
};

export const updateBusiness = async (updatedBiz: Business): Promise<Business> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Network delay
  
  const stored = localStorage.getItem(STORAGE_KEY_BIZ);
  let businesses: Business[] = stored ? JSON.parse(stored) : [];
  
  const index = businesses.findIndex(b => b.id === updatedBiz.id);
  
  if (index !== -1) {
    // Update existing
    businesses[index] = updatedBiz;
  } else {
    // Upsert: Create new if it doesn't exist (fixes issue when saving the default demo profile)
    businesses.push(updatedBiz);
  }
  
  localStorage.setItem(STORAGE_KEY_BIZ, JSON.stringify(businesses));
  return updatedBiz;
};