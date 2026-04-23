'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, MinusCircle, Loader2, Droplets, RefreshCw, Wallet, CheckCircle2, ExternalLink } from 'lucide-react';
import { useFreighter } from '@/hooks/useFreighter';
import { useVoltBalance } from '@/hooks/useVoltBalance';
import { usePoolStats } from '@/hooks/usePoolStats';
import { floatUp, successBurst, tabIndicator, stagger } from '@/lib/animations';
import { useTilt } from '@/hooks/useTilt';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { poolContract, signAndSubmit, nativeToScVal, Address } from '@/lib/soroban';

export function LiquidityCard() {
  const { isConnected, connect, publicKey } = useFreighter();
  const { voltBalance, xlmBalance, mutate: mutateAGT } = useVoltBalance(publicKey);
  const { tvl, xlmReserve, voltReserve, apy, isLoading, mutate: mutatePool } = usePoolStats();
  
  const [tab, setTab] = useState<'add' | 'remove'>('add');
  const [voltAmt, setVoltAmt] = useState('');
  const [xlmAmt, setXlmAmt] = useState('');
  const [lpAmt, setLpAmt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ txHash: string } | null>(null);

  const { ref: tiltRef, style: tiltStyle, ...tiltHandlers } = useTilt(6);

  const voltReserveNum = parseFloat(voltReserve) || 0;
  const xlmReserveNum = parseFloat(xlmReserve) || 0;
  
  // Use pool ratio if liquidity exists, otherwise fallback to market price from API
  const priceVal = parseFloat(price) || 0.05;
  const ratio = (voltReserveNum > 0 && xlmReserveNum > 0) 
    ? xlmReserveNum / voltReserveNum 
    : priceVal;

  const handleVoltChange = (v: string) => {
    setVoltAmt(v);
    if (!v) {
      setXlmAmt('');
    } else {
      setXlmAmt((parseFloat(v) * ratio).toFixed(6));
    }
  };

  const handleXlmChange = (v: string) => {
    setXlmAmt(v);
    if (!v) {
      setVoltAmt('');
    } else {
      setVoltAmt((parseFloat(v) / ratio).toFixed(6));
    }
  };

  const submit = async () => {
    if (!isConnected || !publicKey) return connect();
    if (tab === 'add' && (!voltAmt || parseFloat(voltAmt) <= 0)) return;
    if (tab === 'remove' && (!lpAmt || parseFloat(lpAmt) <= 0)) return;
    
    setIsSubmitting(true);
    try {

      const userScVal = new Address(publicKey).toScVal();

      let op;
      if (tab === 'add') {
        const tokenStroops = BigInt(Math.floor(parseFloat(voltAmt) * 1e7));
        const xlmStroops   = BigInt(Math.floor(parseFloat(xlmAmt) * 1e7));
        op = poolContract.call(
          'add_liquidity',
          userScVal,
          nativeToScVal(tokenStroops, { type: 'i128' }),
          nativeToScVal(xlmStroops, { type: 'i128' }),
        );
      } else {
        const lpStroops = BigInt(Math.floor(parseFloat(lpAmt) * 1e7));
        op = poolContract.call(
          'remove_liquidity',
          userScVal,
          nativeToScVal(lpStroops, { type: 'i128' }),
        );
      }

      const hash = await signAndSubmit(publicKey, op);
      setSuccess({ txHash: hash });
      setVoltAmt(''); setXlmAmt(''); setLpAmt('');
      mutateAGT();
      mutatePool();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Transaction failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[520px] mx-auto">
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            variants={successBurst}
            initial="initial"
            animate="animate"
            exit="exit"
            className="bg-white rounded-3xl border-2 border-green-400 p-10 text-center flex flex-col items-center gap-6 shadow-sm"
          >
            <div className="bg-green-50 p-4 rounded-full">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-black text-gray-900">Pool Updated!</h2>
              <p className="text-gray-500 font-medium">Liquidity successfully modified on Stellar.</p>
            </div>
            <a href="#" className="flex items-center gap-2 text-orange-600 font-bold">
              View on Explorer <ExternalLink size={16} />
            </a>
            <button onClick={() => setSuccess(null)} className="mt-4 text-gray-400 font-bold hover:text-gray-900 transition-colors">
              Back to Pool
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="card"
            ref={tiltRef}
            style={tiltStyle}
            {...tiltHandlers}
            variants={floatUp}
            initial="initial"
            animate="animate"
            className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm flex flex-col gap-6"
          >
            <div className="flex justify-between items-center px-1">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Liquidity Pool</h2>
              <div className="bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{apy}% APY</span>
              </div>
            </div>

            <div className="flex border-b border-gray-100 relative">
              {(['add', 'remove'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-4 text-sm font-black uppercase tracking-widest transition-colors relative z-10 ${
                    tab === t ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {t === 'add' ? 'Add Assets' : 'Remove Assets'}
                  {tab === t && (
                    <motion.div
                      layoutId="pool-tab"
                      variants={tabIndicator}
                      className="absolute bottom-0 left-0 w-full h-1 bg-orange-500"
                    />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col gap-5"
              >
                {tab === 'add' ? (
                  <>
                    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all flex flex-col gap-3">
                      <div className="flex justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">VOLT Deposit</span>
                        <span className="text-[10px] font-bold text-gray-400">Bal: {parseFloat(voltBalance).toFixed(2)}</span>
                      </div>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={voltAmt}
                        onChange={(e) => handleVoltChange(e.target.value)}
                        className="text-3xl font-black text-gray-900 bg-transparent outline-none w-full"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all flex flex-col gap-3">
                      <div className="flex justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">XLM Deposit</span>
                        <span className="text-[10px] font-bold text-gray-400">Bal: {parseFloat(xlmBalance).toFixed(2)}</span>
                      </div>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={xlmAmt}
                        onChange={(e) => handleXlmChange(e.target.value)}
                        className="text-3xl font-black text-gray-900 bg-transparent outline-none w-full"
                      />
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all flex flex-col gap-3">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">LP Tokens to Withdraw</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={lpAmt}
                      onChange={(e) => setLpAmt(e.target.value)}
                      className="text-3xl font-black text-gray-900 bg-transparent outline-none w-full"
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col gap-4">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Your Pool Share</span>
                  <div className="text-3xl font-black text-gray-900 leading-none">
                    <AnimatedNumber value={tab === 'add' ? 1.25 : 0.85} suffix="%" decimals={2} />
                  </div>
                </div>
                <Droplets size={32} className="text-orange-200" />
              </div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '25%' }}
                  className="h-full bg-orange-500"
                />
              </div>
            </div>

            <button
              onClick={submit}
              disabled={isSubmitting}
              className="w-full bg-orange-500 text-white font-black text-lg py-5 rounded-2xl hover:bg-orange-600 active:scale-[0.98] transition-all disabled:bg-gray-100 disabled:text-gray-400 shadow-xl shadow-orange-500/10 flex items-center justify-center gap-3 mt-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : isConnected ? (
                <span>{tab === 'add' ? 'Supply Liquidity' : 'Withdraw Assets'}</span>
              ) : (
                <>
                  <Wallet size={20} />
                  <span>Connect Wallet</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
