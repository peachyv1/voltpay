'use client';
import { motion } from 'framer-motion';
import { Activity, Wallet, ArrowUpRight, RefreshCw, Coins } from 'lucide-react';
import { useFreighter } from '@/hooks/useFreighter';
import { useVoltBalance } from '@/hooks/useVoltBalance';
import { useContractEvents } from '@/hooks/useContractEvents';
import { TrustlineCard } from '@/components/TrustlineCard';
import { BottomNav } from '@/components/BottomNav';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { revealUp, stagger, listContainer, listItem, accentPulse } from '@/lib/animations';

export default function DashboardPage() {
  const { isConnected, connect, publicKey, network, isLoading } = useFreighter();
  const { voltBalance, xlmBalance, isLoading: balLoading } = useVoltBalance(publicKey);
  const { events, isLoading: eventsLoading } = useContractEvents();

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white p-6">
        <RefreshCw size={40} className="animate-spin text-orange-500" />
      </main>
    );
  }

  if (!isConnected) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white p-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={revealUp}
          className="max-w-md w-full flex flex-col items-center gap-8 text-center"
        >
          <div className="bg-orange-50 p-8 rounded-[2.5rem] border border-orange-100">
            <Wallet size={80} className="text-orange-500" />
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Secure Access</h1>
            <p className="text-gray-500 font-medium leading-relaxed">
              Connect your Stellar wallet to monitor your portfolio and track protocol events.
            </p>
          </div>
          <button 
            className="w-full bg-orange-500 text-white font-black py-5 rounded-3xl hover:bg-orange-600 active:scale-95 transition-all shadow-xl shadow-orange-500/20"
            onClick={connect}
          >
            Connect Wallet
          </button>
        </motion.div>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 pt-20 pb-32">
      <div className="max-w-5xl mx-auto flex flex-col gap-10">
        
        {/* Header */}
        <motion.div 
          variants={revealUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">Connected to {network}</span>
            </div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">Dashboard</h1>
            <p className="text-gray-400 font-mono text-xs truncate max-w-sm">
              {typeof publicKey === 'string' 
                ? publicKey 
                : (publicKey as any)?.address || (publicKey as any)?.publicKey || String(publicKey)}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button className="bg-white border border-gray-100 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
              Export CSV
            </button>
            <button className="bg-white border border-gray-100 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'VOLT Portfolio', value: parseFloat(voltBalance), sub: 'Volt Pay Token', color: 'text-orange-500' },
            { label: 'XLM Balance', value: parseFloat(xlmBalance), sub: 'Stellar Native', color: 'text-gray-400' },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              variants={stagger(i)}
              initial="initial"
              animate="animate"
              className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">{card.label}</p>
              <div className="text-5xl font-black text-gray-900 tracking-tighter">
                <AnimatedNumber value={card.value} decimals={4} />
              </div>
              <p className={`text-xs font-black uppercase tracking-widest mt-2 ${card.color}`}>{card.sub}</p>
              <div className="absolute top-8 right-8 text-gray-100">
                <Coins size={48} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trustline Area */}
        <motion.div variants={revealUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <TrustlineCard publicKey={publicKey} />
        </motion.div>

        {/* Faucet Banner */}
        <motion.div 
          variants={revealUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-orange-500 rounded-[2rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white"
        >
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-black uppercase tracking-tighter">Testnet Faucet</h2>
            <p className="font-medium text-orange-100 max-w-md">
              Need assets for testing? Mint 1,000 VOLT instantly to your wallet and start exploring the protocol.
            </p>
          </div>
          <button 
            className="bg-white text-orange-500 font-black px-10 py-5 rounded-2xl hover:bg-orange-50 transition-all active:scale-95"
            onClick={async () => {
              try {
                const res = await fetch('/api/admin/mint', {
                  method: 'POST',
                  body: JSON.stringify({ recipient: publicKey, amount: '1000', callerPubKey: publicKey })
                });
                const data = await res.json();
                if (data.hash) alert("Success! 1,000 VOLT Minted.");
              } catch (e) { alert("Mint failed"); }
            }}
          >
            Mint 1,000 VOLT
          </button>
        </motion.div>

        {/* Activity Feed */}
        <motion.div 
          variants={revealUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm"
        >
          <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity size={20} className="text-gray-400" />
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Recent Transactions</h3>
              <motion.div {...accentPulse} className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            </div>
            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 hover:text-orange-700">View All</button>
          </div>
          
          <div className="flex flex-col">
            {eventsLoading ? (
              <div className="p-20 flex flex-col items-center gap-4">
                <RefreshCw size={32} className="animate-spin text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading activity...</span>
              </div>
            ) : (
              <motion.div variants={listContainer} className="divide-y divide-gray-50">
                {events.slice(0, 10).map((event) => (
                  <motion.div 
                    key={event.id}
                    variants={listItem}
                    className="px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                        <ArrowUpRight size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{event.type}</span>
                        <span className="text-xs font-mono text-gray-400 truncate max-w-[150px]">{event.txHash}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right flex flex-col">
                        <span className="text-sm font-black text-gray-900">
                          {parseFloat(event.amount).toFixed(2)} VOLT
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <a href={`https://stellar.expert/explorer/testnet/tx/${event.txHash}`} target="_blank" className="text-gray-300 hover:text-orange-500 transition-colors">
                        <ArrowUpRight size={20} />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>

      </div>
      <BottomNav />
    </main>
  );
}
