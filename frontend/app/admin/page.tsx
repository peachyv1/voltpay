'use client';
import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, XCircle, Loader2, RefreshCw, Coins, Droplets, ArrowUpRight } from 'lucide-react';
import { useFreighter } from '@/hooks/useFreighter';
import { BottomNav } from '@/components/BottomNav';
import { revealUp, floatUp } from '@/lib/animations';

const ADMIN_WALLETS = [
  'GDG6D267U5S3O3O6U2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2', // Example issuer
  'GBY27H725NURXU2OQ75Q75Q75Q75Q75Q75Q75Q75Q75Q75Q75Q75Q75Q', // Local test wallet
];

// --- Subcomponents ---

const MintCard = memo(function MintCard({ publicKey }: { publicKey: string }) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('1000');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const mint = async () => {
    if (!recipient || !amount) {
      setResult({ ok: false, msg: 'Recipient and Amount are required' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/mint', {
        method: 'POST',
        body: JSON.stringify({ recipient, amount, callerPubKey: publicKey }),
      });
      const data = await res.json();
      setResult({ ok: !!data.hash, msg: data.hash ? `Success! Hash: ${data.hash.slice(0, 16)}...` : data.error || 'Mint failed' });
    } catch {
      setResult({ ok: false, msg: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card h-full flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
          <Coins size={24} />
        </div>
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight">Mint VOLT</h2>
          <p className="text-xs text-gray-400 font-medium">Issue new tokens from the protocol reserve</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Recipient</label>
            <button 
              onClick={() => setRecipient(publicKey)}
              className="text-[10px] font-bold text-orange-500 hover:text-orange-600 transition-colors"
            >
              Mint to self
            </button>
          </div>
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="G..."
            className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-mono focus:border-orange-400 outline-none transition-colors"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-black focus:border-orange-400 outline-none transition-colors"
          />
        </div>
      </div>

      <button
        onClick={mint}
        disabled={loading}
        className="w-full bg-orange-500 text-white font-black py-4 rounded-2xl hover:bg-orange-600 transition-all disabled:bg-gray-100 disabled:text-gray-400"
      >
        {loading ? <RefreshCw size={20} className="animate-spin mx-auto" /> : 'Execute Mint'}
      </button>

      {result && (
        <div className={`p-4 rounded-xl text-xs font-bold border ${result.ok ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
          {result.msg}
        </div>
      )}
    </div>
  );
});

const PoolStatsCard = memo(function PoolStatsCard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try { setStats(await (await fetch('/api/pool')).json()); } catch { /* */ } finally { setLoading(false); }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="surface-card flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
            <Droplets size={24} />
          </div>
          <h2 className="text-lg font-black uppercase tracking-tight">Pool Status</h2>
        </div>
        <button onClick={refresh} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
          {loading ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
        </button>
      </div>

      {!stats && !loading ? (
        <div className="py-10 text-center text-gray-400 text-xs font-black uppercase tracking-widest">Click refresh to load data</div>
      ) : stats && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'VOLT Reserve', val: stats.voltReserve, unit: 'VOLT' },
            { label: 'XLM Reserve', val: stats.xlmReserve, unit: 'XLM' },
            { label: 'Market Price', val: stats.price, unit: 'XLM/VOLT' },
            { label: 'LP Count', val: stats.providers, unit: 'Users' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{s.label}</p>
              <p className="text-lg font-black text-gray-900">{parseFloat(s.val || 0).toLocaleString()}</p>
              <p className="text-[10px] font-bold text-orange-500">{s.unit}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// --- Main Page ---

export default function AdminPage() {
  const { isConnected, connect, publicKey, isLoading } = useFreighter();
  const isAdmin = isConnected; // In production, check ADMIN_WALLETS

  if (isLoading) return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6">
      <Loader2 size={40} className="animate-spin text-orange-500" />
    </main>
  );

  if (!isConnected) return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6">
      <motion.div variants={revealUp} initial="hidden" animate="visible" className="max-w-md w-full text-center flex flex-col items-center gap-8">
        <div className="w-20 h-20 rounded-[2rem] bg-gray-50 border border-gray-100 flex items-center justify-center text-orange-500">
          <Lock size={40} />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Admin Panel</h1>
          <p className="text-gray-500 font-medium">Restricted access area. Connect authorized wallet.</p>
        </div>
        <button className="w-full bg-orange-500 text-white font-black py-5 rounded-3xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/10" onClick={connect}>
          Connect Authorized Wallet
        </button>
      </motion.div>
    </main>
  );

  return (
    <main className="min-h-screen bg-gray-50 p-6 pt-20 pb-32">
      <div className="max-w-5xl mx-auto flex flex-col gap-10">
        
        <motion.div variants={revealUp} initial="hidden" animate="visible" className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white">
            <Shield size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">System Console</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-mono text-gray-400">
                {typeof publicKey === 'string' 
                  ? publicKey 
                  : (publicKey as any)?.address || (publicKey as any)?.publicKey || String(publicKey)}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div variants={floatUp} initial="initial" animate="animate">
            <MintCard publicKey={publicKey} />
          </motion.div>
          <motion.div variants={floatUp} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
            <PoolStatsCard />
          </motion.div>
        </div>
        
      </div>
      <BottomNav />
    </main>
  );
}
