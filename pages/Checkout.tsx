import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Upload, CheckCircle, ShieldAlert } from 'lucide-react';
import { analyzePaymentProof } from '../services/gemini';
import { getBusinessById } from '../services/business';
import { Business } from '../types';

const Checkout: React.FC = () => {
  const { businessId } = useParams();
  const [business, setBusiness] = useState<Business | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [proofStatus, setProofStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [verificationMsg, setVerificationMsg] = useState("");

  useEffect(() => {
    const fetchBiz = async () => {
      if (businessId) {
        const biz = await getBusinessById(businessId);
        setBusiness(biz);
      }
    };
    fetchBiz();
  }, [businessId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setProofStatus('idle');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setAnalyzing(true);
    // Simulate upload delay
    await new Promise(r => setTimeout(r, 1500));
    
    // Simulate getting a URL (in reality, upload to S3/Cloudinary)
    const fakeUrl = URL.createObjectURL(file);
    
    // Analyze with Gemini
    const result = await analyzePaymentProof(fakeUrl);
    
    setAnalyzing(false);
    if (result.valid) {
      setProofStatus('valid');
      setVerificationMsg("AI Verification Successful: Proof looks authentic.");
    } else {
      setProofStatus('invalid');
      setVerificationMsg("AI Verification Warning: " + result.reason);
    }
  };

  if (!businessId) return <div>Invalid Link</div>;

  return (
    <div className="min-h-screen bg-dark-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
        <div className="text-center mb-8">
          {business?.logoUrl ? (
             <img src={business.logoUrl} alt="Logo" className="w-20 h-20 mx-auto rounded-lg object-contain bg-slate-900 p-2 mb-4 border border-slate-700" />
          ) : (
             <h2 className="text-2xl font-bold text-white">{business?.name || "Payment Portal"}</h2>
          )}
          <h2 className="text-2xl font-bold text-white">Upload Payment Proof</h2>
          <p className="text-slate-400 mt-2">Please upload the screenshot of your transfer to finalize your order.</p>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-lg mb-6 border border-slate-700">
          <p className="text-sm text-slate-400 mb-1">Transfer Amount</p>
          <p className="text-xl font-bold text-white">$299.00</p>
          <div className="my-2 h-px bg-slate-700"></div>
          <p className="text-xs text-slate-500">Bank: {business?.bankName || "Global Bank"}</p>
          <p className="text-xs text-slate-500">Account: {business?.accountNumber || "123-456-7890"}</p>
          <p className="text-xs text-slate-500">Name: {business?.accountName || "Business Account"}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Order Reference</label>
            <input type="text" placeholder="e.g. REF-001" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-lg p-6 hover:border-blue-500 transition cursor-pointer relative">
            <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
            <Upload className="w-10 h-10 text-slate-400 mb-3" />
            <p className="text-sm text-slate-300 font-medium">{file ? file.name : "Click to upload screenshot"}</p>
            <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 5MB</p>
          </div>

          <button 
            type="submit" 
            disabled={!file || analyzing}
            className={`w-full py-3 rounded-lg font-bold text-white transition shadow-lg ${
              analyzing ? 'bg-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30'
            }`}
          >
            {analyzing ? 'Verifying with AI...' : 'Submit Proof'}
          </button>
        </form>

        {proofStatus === 'valid' && (
           <div className="mt-6 p-4 bg-green-900/30 border border-green-500/30 rounded-lg flex items-start space-x-3">
             <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
             <div>
               <p className="text-sm font-bold text-green-400">Upload Complete</p>
               <p className="text-xs text-green-300/80 mt-1">{verificationMsg}</p>
             </div>
           </div>
        )}

        {proofStatus === 'invalid' && (
           <div className="mt-6 p-4 bg-red-900/30 border border-red-500/30 rounded-lg flex items-start space-x-3">
             <ShieldAlert className="text-red-500 flex-shrink-0" size={20} />
             <div>
               <p className="text-sm font-bold text-red-400">Verification Alert</p>
               <p className="text-xs text-red-300/80 mt-1">{verificationMsg}</p>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;