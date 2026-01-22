import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Business, Order, OrderStatus, Product, SystemBankDetails } from '../types';
import { generateWelcomeMessage } from '../services/gemini';
import { getBusinessByUserId, updateBusiness } from '../services/business';
import { getSystemBankDetails } from '../services/admin';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, RefreshCw, CheckCircle, XCircle, Clock, ExternalLink, AlertTriangle, MapPin, Package, Plus, Trash2, Edit2, Crown, Image as ImageIcon, Upload, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { MOCK_PRODUCTS } from '../constants';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingBiz, setLoadingBiz] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'settings' | 'billing'>('overview');
  
  // Billing
  const [adminBank, setAdminBank] = useState<SystemBankDetails | null>(null);

  // Product Editing
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [tempProduct, setTempProduct] = useState<Partial<Product>>({});

  useEffect(() => {
    const fetchBusiness = async () => {
      setLoadingBiz(true);
      try {
        const foundBiz = await getBusinessByUserId(user.id);
        
        if (foundBiz) {
          setBusiness(foundBiz);
        } else {
          // Fallback for demo
          setBusiness({
            id: 'biz-default-' + user.id, // Unique ID for upsert
            ownerId: user.id,
            name: user.name + "'s Enterprise",
            description: "High-end digital services and consultation.",
            whatsappNumber: "15550001234",
            welcomeMessage: "Welcome! How can we assist you today?",
            bankName: "Global Bank",
            accountName: user.name,
            accountNumber: "123-456-7890",
            products: MOCK_PRODUCTS,
            themeColor: "#0ea5e9"
          });
        }

        // Mock Orders
        setOrders([
          {
            id: 'ord-1',
            businessId: 'biz-123',
            customerName: 'Alice Smith',
            customerWhatsapp: '15559998888',
            orderReference: 'REF-001',
            amount: 299,
            proofUrl: 'https://picsum.photos/300/400',
            status: OrderStatus.PENDING,
            timestamp: Date.now() - 3600000
          },
          {
            id: 'ord-2',
            businessId: 'biz-123',
            customerName: 'Bob Jones',
            customerWhatsapp: '15557776666',
            orderReference: 'REF-002',
            amount: 99,
            proofUrl: 'https://picsum.photos/300/401',
            status: OrderStatus.CONFIRMED,
            timestamp: Date.now() - 86400000
          }
        ]);

        const sysBank = await getSystemBankDetails();
        if (sysBank.isVisible) {
          setAdminBank(sysBank);
        }

      } catch (e) {
        console.error(e);
      } finally {
        setLoadingBiz(false);
      }
    };

    fetchBusiness();
  }, [user]);

  const handleGenerateAiMessage = async () => {
    if (!business) return;
    setLoadingAi(true);
    const msg = await generateWelcomeMessage(business.name, business.description);
    // Optimistic update
    const updated = { ...business, welcomeMessage: msg };
    setBusiness(updated);
    await updateBusiness(updated);
    setLoadingAi(false);
  };

  const handleSaveSettings = async () => {
    if (!business) return;
    setSavingSettings(true);
    try {
      await updateBusiness(business);
      // Trigger a window event to update layout logo if changed
      window.dispatchEvent(new Event('business-updated'));
      setTimeout(() => {
        setSavingSettings(false);
        alert("Settings Saved Successfully!");
      }, 500);
    } catch (e) {
      setSavingSettings(false);
      alert("Error saving settings.");
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && business) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setBusiness({ ...business, logoUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductAction = async (action: 'add' | 'update' | 'delete', product?: Product) => {
    if (!business) return;
    let newProducts = [...business.products];

    if (action === 'delete' && product) {
      newProducts = newProducts.filter(p => p.id !== product.id);
    } else if (action === 'add' && tempProduct.name && tempProduct.price) {
       newProducts.push({
         id: 'prod-' + Date.now(),
         name: tempProduct.name,
         price: Number(tempProduct.price),
         description: tempProduct.description || ''
       });
       setIsAddingProduct(false);
       setTempProduct({});
    } else if (action === 'update' && editingProduct) {
       const index = newProducts.findIndex(p => p.id === editingProduct.id);
       if (index !== -1) newProducts[index] = editingProduct;
       setEditingProduct(null);
    }

    const updatedBiz = { ...business, products: newProducts };
    setBusiness(updatedBiz);
    await updateBusiness(updatedBiz);
  };

  if (loadingBiz) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading Business Profile...</div>;
  if (!business) return <div className="min-h-screen flex items-center justify-center text-red-400">Error loading profile</div>;

  const deepLink = `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(business.welcomeMessage || "Hi")}`;
  const checkoutLink = `${window.location.origin}/#/checkout/${business.id}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Bar with Back Button */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            {business.logoUrl ? (
               <img src={business.logoUrl} alt="Logo" className="w-16 h-16 rounded-lg object-cover border border-slate-700 bg-slate-900" />
            ) : (
               <div className="w-16 h-16 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500">
                 <ImageIcon size={24} />
               </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-slate-400">Manage your business <span className="text-blue-400 font-semibold">{business.name}</span></p>
            </div>
          </div>

          <Link to="/" className="flex items-center space-x-2 text-slate-300 hover:text-white transition text-sm bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg border border-slate-700">
             <ArrowLeft size={16} />
             <span>Back to Website</span>
          </Link>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6">
          <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>Overview</button>
          <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>Orders</button>
          <button onClick={() => setActiveTab('products')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>Products</button>
          <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>Settings</button>
          <button onClick={() => setActiveTab('billing')} className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${activeTab === 'billing' ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-yellow-500'}`}><Crown size={14}/> Upgrade</button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Stats */}
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-6">Business Health</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900 rounded-xl">
                <p className="text-slate-400 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-white">{orders.length}</p>
              </div>
              <div className="p-4 bg-slate-900 rounded-xl">
                <p className="text-slate-400 text-sm">Revenue</p>
                <p className="text-2xl font-bold text-green-400">${orders.reduce((acc, curr) => acc + curr.amount, 0)}</p>
              </div>
            </div>
            {business.whatsappNumber === "15550001234" && (
               <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg flex items-start space-x-2">
                 <AlertTriangle size={16} className="text-yellow-500 mt-0.5" />
                 <p className="text-xs text-yellow-400">You are using a demo WhatsApp number. Update it in settings to go live.</p>
               </div>
            )}
          </div>

          {/* QR & Links */}
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 flex flex-col sm:flex-row gap-6 items-center">
             <div className="bg-white p-4 rounded-xl">
               <QRCodeSVG value={deepLink} size={150} />
             </div>
             <div className="flex-1 w-full">
               <h3 className="text-lg font-semibold text-white mb-2">WhatsApp Auto-Start</h3>
               <div className="flex items-center space-x-2 bg-slate-900 p-3 rounded-lg mb-4">
                 <p className="text-xs text-slate-400 truncate flex-1">{deepLink}</p>
                 <button onClick={() => navigator.clipboard.writeText(deepLink)} className="text-blue-400 hover:text-white"><Copy size={16}/></button>
               </div>

               <h3 className="text-lg font-semibold text-white mb-2">Checkout Page</h3>
               <div className="flex items-center space-x-2 bg-slate-900 p-3 rounded-lg">
                 <p className="text-xs text-slate-400 truncate flex-1">{checkoutLink}</p>
                 <a href={checkoutLink} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-white"><ExternalLink size={16}/></a>
               </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700">
           <table className="w-full text-left">
             <thead className="bg-slate-900 border-b border-slate-700">
               <tr>
                 <th className="p-4 text-sm font-medium text-slate-400">Ref</th>
                 <th className="p-4 text-sm font-medium text-slate-400">Customer</th>
                 <th className="p-4 text-sm font-medium text-slate-400">Status</th>
                 <th className="p-4 text-sm font-medium text-slate-400">Proof</th>
                 <th className="p-4 text-sm font-medium text-slate-400">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-700">
               {orders.map(order => (
                 <tr key={order.id} className="hover:bg-slate-700/30 transition">
                   <td className="p-4 font-mono text-sm text-slate-300">{order.orderReference}</td>
                   <td className="p-4">
                     <p className="text-white font-medium">{order.customerName}</p>
                     <p className="text-xs text-slate-500">{order.customerWhatsapp}</p>
                   </td>
                   <td className="p-4">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                       order.status === OrderStatus.CONFIRMED ? 'bg-green-100 text-green-800' :
                       order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                       'bg-red-100 text-red-800'
                     }`}>
                       {order.status}
                     </span>
                   </td>
                   <td className="p-4">
                     {order.proofUrl && (
                       <a href={order.proofUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-sm">View Proof</a>
                     )}
                   </td>
                   <td className="p-4">
                     <div className="flex space-x-2">
                       <button className="p-1 hover:bg-green-500/20 text-green-500 rounded"><CheckCircle size={18}/></button>
                       <button className="p-1 hover:bg-red-500/20 text-red-500 rounded"><XCircle size={18}/></button>
                     </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-bold text-white">Product Catalog</h3>
             <button 
               onClick={() => setIsAddingProduct(true)}
               className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition"
             >
               <Plus size={16}/> <span>Add Product</span>
             </button>
           </div>

           {/* Add Form */}
           {isAddingProduct && (
             <div className="mb-6 p-4 bg-slate-900 rounded-xl border border-blue-500/30 animate-in fade-in slide-in-from-top-4">
               <h4 className="text-sm font-bold text-blue-400 mb-3">New Product</h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                 <input 
                   placeholder="Product Name" 
                   value={tempProduct.name || ''} 
                   onChange={e => setTempProduct({...tempProduct, name: e.target.value})}
                   className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm outline-none focus:border-blue-500"
                 />
                 <input 
                   placeholder="Price" 
                   type="number"
                   value={tempProduct.price || ''} 
                   onChange={e => setTempProduct({...tempProduct, price: Number(e.target.value)})}
                   className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm outline-none focus:border-blue-500"
                 />
                 <input 
                   placeholder="Description (Optional)" 
                   value={tempProduct.description || ''} 
                   onChange={e => setTempProduct({...tempProduct, description: e.target.value})}
                   className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm outline-none focus:border-blue-500"
                 />
               </div>
               <div className="flex justify-end space-x-2">
                 <button onClick={() => setIsAddingProduct(false)} className="px-3 py-1.5 text-sm text-slate-400 hover:text-white">Cancel</button>
                 <button onClick={() => handleProductAction('add')} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-500">Save Product</button>
               </div>
             </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {business.products.map(product => (
               <div key={product.id} className="p-4 bg-slate-900 rounded-xl border border-slate-700 relative group hover:border-blue-500/50 transition">
                 {editingProduct?.id === product.id ? (
                    <div className="space-y-2">
                       <input 
                         value={editingProduct.name} 
                         onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                         className="w-full bg-slate-800 p-1 rounded text-sm text-white"
                       />
                       <input 
                         type="number"
                         value={editingProduct.price} 
                         onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                         className="w-full bg-slate-800 p-1 rounded text-sm text-white"
                       />
                       <div className="flex justify-end space-x-2 mt-2">
                         <button onClick={() => setEditingProduct(null)} className="text-xs text-slate-400">Cancel</button>
                         <button onClick={() => handleProductAction('update')} className="text-xs text-green-400">Save</button>
                       </div>
                    </div>
                 ) : (
                   <>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white">{product.name}</h4>
                      <span className="text-green-400 font-mono">${product.price}</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">{product.description}</p>
                    <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => setEditingProduct(product)} className="p-1.5 hover:bg-slate-800 rounded text-blue-400"><Edit2 size={16}/></button>
                      <button onClick={() => handleProductAction('delete', product)} className="p-1.5 hover:bg-slate-800 rounded text-red-400"><Trash2 size={16}/></button>
                    </div>
                   </>
                 )}
               </div>
             ))}
           </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 max-w-3xl">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-bold text-white">Business Profile</h3>
             <button 
                onClick={handleSaveSettings} 
                disabled={savingSettings}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
             >
                {savingSettings ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{savingSettings ? 'Saving...' : 'Save Changes'}</span>
             </button>
          </div>
          
          <div className="mb-6">
             <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-1">
                 <ImageIcon size={14} /> Logo
              </label>
              
              <div className="flex items-start space-x-4">
                {business.logoUrl ? (
                  <img src={business.logoUrl} alt="Preview" className="w-20 h-20 rounded-lg object-cover border border-slate-700 bg-slate-900" />
                ) : (
                  <div className="w-20 h-20 rounded-lg border border-slate-700 bg-slate-900 flex items-center justify-center text-slate-500">
                    <ImageIcon size={24} />
                  </div>
                )}
                <div className="flex-1">
                  <label className="cursor-pointer inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 transition">
                    <Upload size={16} />
                    <span>Upload New Logo</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  <p className="text-xs text-slate-500 mt-2">Recommended size: 200x200px. Supports PNG, JPG.</p>
                </div>
              </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-2">Business Description</label>
            <textarea 
              value={business.description} 
              onChange={(e) => setBusiness({...business, description: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-1">
                 <MapPin size={14} /> Address
              </label>
              <input 
                type="text"
                value={business.address || ''} 
                onChange={(e) => setBusiness({...business, address: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Business Address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-1">
                 <Clock size={14} /> Operating Hours
              </label>
              <input 
                type="text"
                value={business.operatingHours || ''} 
                onChange={(e) => setBusiness({...business, operatingHours: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Mon-Fri 9-5"
              />
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-6 mt-8">AI & WhatsApp</h3>
          <div className="mb-6">
             <div className="flex justify-between items-center mb-2">
               <label className="block text-sm font-medium text-slate-400">Welcome Message (Auto-Reply)</label>
               <button 
                onClick={handleGenerateAiMessage}
                disabled={loadingAi}
                className="text-xs flex items-center space-x-1 text-blue-400 hover:text-blue-300 disabled:opacity-50"
               >
                 <RefreshCw size={12} className={loadingAi ? 'animate-spin' : ''} />
                 <span>Generate with AI</span>
               </button>
             </div>
             <textarea 
               value={business.welcomeMessage}
               onChange={(e) => setBusiness({...business, welcomeMessage: e.target.value})}
               className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
               rows={4}
             />
             <p className="text-xs text-slate-500 mt-2">This message will pre-fill the user's WhatsApp input when they scan your QR.</p>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-xl font-bold text-white mb-6">Receiving Payments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Bank Name</label>
                <input type="text" value={business.bankName} onChange={(e) => setBusiness({...business, bankName: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Account Number</label>
                <input type="text" value={business.accountNumber} onChange={(e) => setBusiness({...business, accountNumber: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Account Name</label>
                <input type="text" value={business.accountName} onChange={(e) => setBusiness({...business, accountName: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Upgrade to Pro</h2>
            <p className="text-slate-400">Unlock the full power of DAV PRO AI for your business.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Starter Plan */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 flex flex-col relative overflow-hidden">
               <h3 className="text-xl font-bold text-slate-300">Starter</h3>
               <div className="my-4">
                 <span className="text-4xl font-bold text-white">5,000</span>
                 <span className="text-slate-500 ml-1">/ mo</span>
               </div>
               <ul className="space-y-3 mb-8 flex-1">
                 <li className="flex items-center text-sm text-slate-300"><CheckCircle size={16} className="text-blue-500 mr-2"/> 1 WhatsApp Business Number</li>
                 <li className="flex items-center text-sm text-slate-300"><CheckCircle size={16} className="text-blue-500 mr-2"/> Basic AI Responses</li>
                 <li className="flex items-center text-sm text-slate-300"><CheckCircle size={16} className="text-blue-500 mr-2"/> 100 Products</li>
               </ul>
               <button className="w-full py-3 rounded-lg border border-slate-600 text-white hover:bg-slate-700 transition">Current Plan (Trial)</button>
            </div>

            {/* Yearly Plan */}
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border-2 border-yellow-500/50 p-8 flex flex-col relative overflow-hidden shadow-2xl shadow-yellow-900/20">
               <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">BEST VALUE</div>
               <h3 className="text-xl font-bold text-yellow-400">Pro Yearly</h3>
               <div className="my-4">
                 <span className="text-4xl font-bold text-white">15,000</span>
                 <span className="text-slate-500 ml-1">/ yr</span>
               </div>
               <ul className="space-y-3 mb-8 flex-1">
                 <li className="flex items-center text-sm text-white"><CheckCircle size={16} className="text-yellow-400 mr-2"/> Everything in Starter</li>
                 <li className="flex items-center text-sm text-white"><CheckCircle size={16} className="text-yellow-400 mr-2"/> Advanced AI Fine-tuning</li>
                 <li className="flex items-center text-sm text-white"><CheckCircle size={16} className="text-yellow-400 mr-2"/> Unlimited Products</li>
                 <li className="flex items-center text-sm text-white"><CheckCircle size={16} className="text-yellow-400 mr-2"/> Priority Support</li>
               </ul>
               <button className="w-full py-3 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition">Upgrade Now</button>
            </div>
          </div>

          {adminBank && adminBank.isVisible && (
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-8 text-center max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-white mb-6">Payment Details</h3>
              <p className="text-slate-400 text-sm mb-6">Please transfer the amount for your selected plan to the account below and upload proof.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left bg-slate-800 p-6 rounded-lg">
                <div>
                   <p className="text-xs text-slate-500 uppercase tracking-wider">Bank Name</p>
                   <p className="text-lg font-mono text-white mt-1">{adminBank.bankName}</p>
                </div>
                <div>
                   <p className="text-xs text-slate-500 uppercase tracking-wider">Account Number</p>
                   <p className="text-lg font-mono text-white mt-1">{adminBank.accountNumber}</p>
                </div>
                 <div>
                   <p className="text-xs text-slate-500 uppercase tracking-wider">Account Name</p>
                   <p className="text-lg font-mono text-white mt-1">{adminBank.accountName}</p>
                </div>
              </div>

              <div className="mt-8">
                <button onClick={() => alert("Upload proof flow coming soon!")} className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300">
                  <ExternalLink size={16}/> <span>Upload Payment Proof</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;