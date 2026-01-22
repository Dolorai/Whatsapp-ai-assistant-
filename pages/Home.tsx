import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageSquare, ShieldCheck, Zap, Globe, Smartphone, CreditCard, QrCode } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Home: React.FC = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
              <motion.span variants={fadeInUp} className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-semibold mb-6">
                Next-Gen WhatsApp Automation
              </motion.span>
              <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
                Automate Your Sales <br />
                <span className="gradient-text">While You Sleep</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-xl text-slate-400 mb-10 leading-relaxed">
                Connect your business to WhatsApp AI. Auto-reply to customers, collect payment proofs, and manage orders from a single luxurious dashboard.
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/invite/DEMO-INVITE-2024" className="flex items-center justify-center space-x-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-lg shadow-xl shadow-blue-900/30 transition transform hover:-translate-y-1">
                  <QrCode size={20} />
                  <span>Redeem Invite Code</span>
                </Link>
                <Link to="/how-it-works" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold text-lg border border-slate-700 transition">
                  How It Works
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-dark-900/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Enterprise Grade Features</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to run a modern automated business.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<MessageSquare className="w-8 h-8 text-green-400" />}
              title="WhatsApp AI Agent"
              desc="Generative AI responses tailored to your inventory and tone. Handles greetings, FAQs, and product inquiries automatically."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8 text-blue-400" />}
              title="Proof Verification"
              desc="Secure workflow for customers to upload payment receipts. AI-assisted verification to prevent fraud."
            />
            <FeatureCard 
              icon={<CreditCard className="w-8 h-8 text-purple-400" />}
              title="Smart Checkout"
              desc="Generate deep-linked QR codes that guide customers from chat to payment instantly."
            />
             <FeatureCard 
              icon={<Zap className="w-8 h-8 text-yellow-400" />}
              title="Instant Setup"
              desc="Get your business profile up and running in less than 2 minutes with our streamlined onboarding."
            />
             <FeatureCard 
              icon={<Globe className="w-8 h-8 text-cyan-400" />}
              title="Global Reach"
              desc="Works with any WhatsApp number globally. Multilingual support built-in."
            />
             <FeatureCard 
              icon={<Smartphone className="w-8 h-8 text-pink-400" />}
              title="Mobile First"
              desc="Manage your entire empire from your phone. Responsive dashboard designed for power users."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard: React.FC<{icon: React.ReactNode, title: string, desc: string}> = ({ icon, title, desc }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-8 rounded-2xl glass-panel hover:bg-slate-800/50 transition duration-300"
  >
    <div className="mb-4 p-3 bg-slate-800/50 rounded-lg inline-block">{icon}</div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{desc}</p>
  </motion.div>
);

export default Home;