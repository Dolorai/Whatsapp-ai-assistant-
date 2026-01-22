import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, UserRole } from '../types';
import { logout } from '../services/auth';
import { getBusinessByUserId } from '../services/business';
import { LogOut, LayoutDashboard, Home, ShoppingCart, User as UserIcon, Settings, Menu, X } from 'lucide-react';
import { APP_NAME } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  setUser: (u: User | null) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [businessLogo, setBusinessLogo] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogo = async () => {
      if (user) {
        try {
          const biz = await getBusinessByUserId(user.id);
          if (biz?.logoUrl) {
            setBusinessLogo(biz.logoUrl);
          }
        } catch (e) {
          // ignore
        }
      } else {
        setBusinessLogo(null);
      }
    };
    fetchLogo();
    
    // Listen for updates from dashboard
    const handleUpdate = () => fetchLogo();
    window.addEventListener('business-updated', handleUpdate);
    return () => window.removeEventListener('business-updated', handleUpdate);
  }, [user]);

  const handleLogout = () => {
    logout();
    setUser(null);
    setBusinessLogo(null);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-slate-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center space-x-2">
              {businessLogo ? (
                <img src={businessLogo} alt="Business Logo" className="h-10 w-auto rounded-lg object-contain" />
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="font-bold text-white">D</span>
                  </div>
                  <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
                </>
              )}
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {!user ? (
                <>
                  <Link to="/" className={`text-sm font-medium hover:text-blue-400 transition ${isActive('/') ? 'text-blue-400' : 'text-slate-300'}`}>Home</Link>
                  <Link to="/#features" className="text-sm font-medium text-slate-300 hover:text-blue-400 transition">Features</Link>
                  <Link to="/#pricing" className="text-sm font-medium text-slate-300 hover:text-blue-400 transition">Pricing</Link>
                  <Link to="/login" className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-sm font-medium transition">Login</Link>
                  <Link to="/register" className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition shadow-lg shadow-blue-900/50">Get Started</Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className={`flex items-center space-x-1 text-sm font-medium hover:text-blue-400 transition ${isActive('/dashboard') ? 'text-blue-400' : 'text-slate-300'}`}>
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </Link>
                   {user.role === UserRole.ADMIN && (
                     <Link to="/admin" className={`flex items-center space-x-1 text-sm font-medium hover:text-purple-400 transition ${isActive('/admin') ? 'text-purple-400' : 'text-slate-300'}`}>
                      <Settings size={16} />
                      <span>Admin</span>
                    </Link>
                   )}
                  <button onClick={handleLogout} className="flex items-center space-x-1 text-sm font-medium text-red-400 hover:text-red-300 transition">
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                  <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden border border-slate-600">
                     <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                  </div>
                </>
              )}
            </div>

             {/* Mobile Menu Button */}
             <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300 hover:text-white">
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass-panel border-b border-slate-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
               {!user ? (
                 <>
                   <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800">Home</Link>
                   <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800">Login</Link>
                 </>
               ) : (
                 <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800">Dashboard</Link>
               )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-dark-900 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500">
          <p className="mb-4">© 2024 {APP_NAME}. All rights reserved.</p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
            <a href="#" className="hover:text-slate-300">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;