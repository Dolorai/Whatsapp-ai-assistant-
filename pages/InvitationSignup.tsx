import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { register } from '../services/auth';
import { createBusiness } from '../services/business';
import { User, Business } from '../types';
import { QrCode, ArrowRight, Building, User as UserIcon, Lock, Phone, MessageSquare, CreditCard, Check, Loader2, MapPin, Clock } from 'lucide-react';

const InvitationSignup: React.FC<{ setUser: (u: User) => void }> = ({ setUser }) => {
  const { code } = useParams();
  const navigate = useNavigate();
  
  // State
  const [step, setStep] = useState<'scan' | 'form' | 'processing' | 'success'>('scan');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form Data
  const [formData, setFormData] = useState({
    // User
    username: '',
    password: '',
    fullName: '',
    // Business
    businessName: '',
    description: '',
    whatsappNumber: '',
    address: '',
    operatingHours: '',
    bankName: '',
    accountName: '',
    accountNumber: ''
  });

  // Effect to auto-scan if code is present
  useEffect(() => {
    if (code) {
      // Simulate scanning/validating code
      const timer = setTimeout(() => {
        setStep('form');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [code]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // 1. Register User
      setStep('processing');
      const user = await register({
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName
      });
      
      // 2. Create Business
      await createBusiness(user, {
        businessName: formData.businessName,
        description: formData.description,
        whatsappNumber: formData.whatsappNumber,
        address: formData.address,
        operatingHours: formData.operatingHours,
        bankName: formData.bankName,
        accountName: formData.accountName,
        accountNumber: formData.accountNumber
      });

      // 3. Finalize
      setUser(user);
      setStep('success');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setStep('form');
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition";
  const labelClasses = "block text-sm font-medium text-slate-400 mb-1";

  return (
    <div className="min-h-screen pt-20 pb-12 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        
        <AnimatePresence mode="wait">
          {step === 'scan' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }}
              className="text-center bg-slate-800/50 backdrop-blur-md p-12 rounded-3xl border border-slate-700 shadow-2xl"
            >
              <div className="mb-8 relative inline-block">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                <QrCode className="relative w-24 h-24 text-blue-400 mx-auto animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Verifying Invitation...</h2>
              <p className="text-slate-400">Please wait while we validate your secure business invite code.</p>
            </motion.div>
          )}

          {step === 'form' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-800/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-slate-700 shadow-2xl"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white">Activate Business Account</h2>
                <p className="text-slate-400 mt-2">Set up your AI Assistant and Business Profile</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-lg text-red-200 text-sm text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Section 1: User */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-blue-400 mb-2 border-b border-slate-700 pb-2">
                    <UserIcon size={20} />
                    <h3 className="text-lg font-semibold">Owner Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Full Name</label>
                      <input name="fullName" type="text" required value={formData.fullName} onChange={handleChange} className={inputClasses} placeholder="e.g. John Doe" />
                    </div>
                    <div>
                      <label className={labelClasses}>Username / Email</label>
                      <input name="username" type="text" required value={formData.username} onChange={handleChange} className={inputClasses} placeholder="john@company.com" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClasses}>Password</label>
                    <div className="relative">
                       <Lock className="absolute left-3 top-3.5 text-slate-500" size={16} />
                       <input name="password" type="password" required value={formData.password} onChange={handleChange} className={`${inputClasses} pl-10`} placeholder="Create a secure password" />
                    </div>
                  </div>
                </div>

                {/* Section 2: Business */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-purple-400 mb-2 border-b border-slate-700 pb-2">
                    <Building size={20} />
                    <h3 className="text-lg font-semibold">Business Profile</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Business Name</label>
                      <input name="businessName" type="text" required value={formData.businessName} onChange={handleChange} className={inputClasses} placeholder="e.g. Acme Corp" />
                    </div>
                     <div>
                      <label className={labelClasses}>WhatsApp Number</label>
                      <div className="relative">
                         <Phone className="absolute left-3 top-3.5 text-slate-500" size={16} />
                         <input name="whatsappNumber" type="text" required value={formData.whatsappNumber} onChange={handleChange} className={`${inputClasses} pl-10`} placeholder="e.g. 15551234567" />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">For AI Auto-Reply & Order Tracking.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 text-slate-500" size={16} />
                        <input name="address" type="text" value={formData.address} onChange={handleChange} className={`${inputClasses} pl-10`} placeholder="Business Address" />
                      </div>
                    </div>
                    <div>
                      <label className={labelClasses}>Operating Hours</label>
                       <div className="relative">
                        <Clock className="absolute left-3 top-3.5 text-slate-500" size={16} />
                        <input name="operatingHours" type="text" value={formData.operatingHours} onChange={handleChange} className={`${inputClasses} pl-10`} placeholder="e.g. Mon-Fri 9AM-5PM" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>Business Description</label>
                    <textarea name="description" required value={formData.description} onChange={handleChange} className={inputClasses} rows={2} placeholder="What does your business do? (Used for AI Context)" />
                  </div>
                </div>

                {/* Section 3: Payment */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-green-400 mb-2 border-b border-slate-700 pb-2">
                    <CreditCard size={20} />
                    <h3 className="text-lg font-semibold">Bank Details (For Payments)</h3>
                  </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClasses}>Bank Name</label>
                      <input name="bankName" type="text" value={formData.bankName} onChange={handleChange} className={inputClasses} placeholder="Bank Name" />
                    </div>
                    <div>
                      <label className={labelClasses}>Account Name</label>
                      <input name="accountName" type="text" value={formData.accountName} onChange={handleChange} className={inputClasses} placeholder="Acct Name" />
                    </div>
                     <div>
                      <label className={labelClasses}>Account Number</label>
                      <input name="accountNumber" type="text" value={formData.accountNumber} onChange={handleChange} className={inputClasses} placeholder="Acct Number" />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg shadow-lg shadow-blue-900/50 transition transform hover:-translate-y-1 flex justify-center items-center space-x-2">
                     {loading ? <Loader2 className="animate-spin" /> : <Check />}
                     <span>{loading ? 'Setting up Environment...' : 'Activate & Launch Dashboard'}</span>
                  </button>
                </div>

              </form>
            </motion.div>
          )}

           {step === 'processing' && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center p-12"
            >
              <div className="inline-block p-4 rounded-full bg-slate-800 mb-6 relative">
                 <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Creating your Digital Workspace</h2>
              <p className="text-slate-400">Configuring WhatsApp AI... Linking Payment Gateways... Generating QR...</p>
            </motion.div>
          )}

           {step === 'success' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center bg-green-900/20 backdrop-blur-md p-12 rounded-3xl border border-green-500/30 shadow-2xl"
            >
              <div className="inline-block p-4 rounded-full bg-green-500/20 mb-6">
                 <Check className="w-16 h-16 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Setup Complete!</h2>
              <p className="text-green-200/80 text-lg">Redirecting to your dashboard...</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default InvitationSignup;