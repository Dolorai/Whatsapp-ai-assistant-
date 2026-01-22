import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Checkout from './pages/Checkout';
import InvitationSignup from './pages/InvitationSignup';
import { User, UserRole } from './types';
import { getCurrentUser, login } from './services/auth';
import { Lock, Mail, ChevronRight } from 'lucide-react';

// Inline Login Component for simplicity
const Login: React.FC<{ setUser: (u: User) => void }> = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      setUser(user);
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-panel p-10 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white">Sign in to DAV PRO</h2>
          <p className="mt-2 text-sm text-slate-400">Access your business dashboard</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={20} />
              <input type="text" required value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none relative block w-full px-10 py-3 border border-slate-600 placeholder-slate-500 text-white rounded-lg bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Email / Username" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none relative block w-full px-10 py-3 border border-slate-600 placeholder-slate-500 text-white rounded-lg bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Password" />
            </div>
          </div>

          {error && <div className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded">{error}</div>}

          <div>
            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition shadow-lg shadow-blue-900/50">
              {loading ? 'Signing in...' : 'Sign in'}
              <ChevronRight className="absolute right-3 top-3" size={16} />
            </button>
          </div>
          
          <div className="text-center text-xs text-slate-500">
            Demo: admin@davproai.com / DavProAI@2026
          </div>
        </form>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) setUser(currentUser);
  }, []);

  return (
    <Router>
      <Layout user={user} setUser={setUser}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={<Navigate to="/invite/DAV-PRO-PUBLIC-INVITE" />} />
          <Route path="/invite/:code" element={<InvitationSignup setUser={setUser} />} />
          <Route 
            path="/dashboard/*" 
            element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin" 
            element={user && user.role === UserRole.ADMIN ? <AdminDashboard user={user} /> : <Navigate to="/dashboard" />} 
          />
          <Route path="/checkout/:businessId" element={<Checkout />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;