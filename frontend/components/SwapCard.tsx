'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Wallet, CheckCircle2, RefreshCw, Zap, ExternalLink } from 'lucide-react';
import { useFreighter } from '@/hooks/useFreighter';
import { useVoltBalance } from '@/hooks/useVoltBalance';
import { useVoltPrice } from '@/hooks/useVoltPrice';
import { floatUp, successBurst, hoverLift } from '@/lib/animations';
import { useTilt } from '@/hooks/useTilt';
import useSWR from 'swr';
import { poolContract, signAndSubmit, nativeToScVal, voltContract, XLM_CONTRACT, Address } from '@/lib/soroban';

type Dir = 'VOLT_TO_XLM' | 'XLM_TO_VOLT';

export function SwapCard() {
  const { isConnected, connect, publicKey } = useFreighter();
  const { voltBalance, xlmBalance } = useVoltBalance(publicKey);
  const { price, isLoading: priceLoading } = useVoltPrice();
  const { isValidating } = useSWR('/api/price');

  const [dir, setDir] = useState<Dir>('VOLT_TO_XLM');
  const [amountIn, setAmountIn] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [success, setSuccess] = useState<{ txHash: string } | null>(null);

  const { ref: tiltRef, style: tiltStyle, ...tiltHandlers } = useTilt(8);

  const fromToken = dir === 'VOLT_TO_XLM' ? 'VOLT' : 'XLM';
  const toToken   = dir === 'VOLT_TO_XLM' ? 'XLM' : 'VOLT';
  const fromBal   = dir === 'VOLT_TO_XLM' ? voltBalance : xlmBalance;
  const priceVal  = parseFloat(price) || 0.05;
  const amountOut = amountIn
    ? (dir === 'VOLT_TO_XLM'
        ? (parseFloat(amountIn) * priceVal).toFixed(6)
        : (parseFloat(amountIn) / priceVal).toFixed(6))
    : '';

  const flip = () => {
    setDir((d) => (d === 'VOLT_TO_XLM' ? 'XLM_TO_VOLT' : 'VOLT_TO_XLM'));
    setAmountIn('');
  };

  const doSwap = async () => {
    if (!isConnected) return connect();
    if (!amountIn || parseFloat(amountIn) <= 0) return;
    
    setIsSwapping(true);
    try {
      const tokenInAddress = dir === 'VOLT_TO_XLM' ? voltContract.contractId() : XLM_CONTRACT;
      const amountInStroops = BigInt(Math.floor(parseFloat(amountIn) * 1e7));

      const op = poolContract.call(
        'swap',
        new Address(publicKey).toScVal(),
        new Address(tokenInAddress).toScVal(),
        nativeToScVal(amountInStroops, { type: 'i128' }),
      );

      const hash = await signAndSubmit(publicKey, op);
      setSuccess({ txHash: hash });
      setAmountIn('');
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Swap failed");
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto">
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
              <h2 className="text-2xl font-black text-gray-900">Swap Confirmed!</h2>
              <p className="text-gray-500 font-medium">Successfully swapped tokens on Stellar.</p>
            </div>
            <a 
              href={`https://stellar.expert/explorer/testnet/tx/${success.txHash}`} 
              target="_blank" 
              className="flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 transition-colors"
            >
              View Transaction <ExternalLink size={16} />
            </a>
            <button 
              onClick={() => setSuccess(null)}
              className="mt-4 text-gray-400 font-bold hover:text-gray-900 transition-colors"
            >
              Back to Swap
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
            className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col gap-1 relative z-10"
          >
            <div className="flex justify-between items-center mb-4 px-2">
              <h2 className="text-lg font-black text-gray-900">Swap</h2>
              <RefreshCw 
                size={16} 
                className={`text-gray-300 transition-colors ${isValidating ? 'animate-spin text-orange-500' : ''}`}
              />
            </div>

            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Sell</span>
                <button 
                  onClick={() => setAmountIn(fromBal)}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
                >
                  Balance: {parseFloat(fromBal).toFixed(4)} {fromToken}
                </button>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  placeholder="0.00"
                  value={amountIn}
                  onChange={(e) => setAmountIn(e.target.value)}
                  className="text-3xl font-black text-gray-900 bg-transparent outline-none w-full placeholder:text-gray-200"
                />
                <div className="bg-white rounded-xl border border-gray-200 px-3 py-1.5 flex items-center gap-2 font-bold hover:border-orange-400 transition-colors cursor-pointer shadow-sm">
                  <div className={`w-2 h-2 rounded-full ${fromToken === 'VOLT' ? 'bg-orange-500' : 'bg-gray-300'}`} />
                  <span className="text-sm text-gray-900">{fromToken}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center -my-3 z-10 relative">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={flip}
                className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20 active:bg-orange-600 transition-colors"
              >
                <ArrowUpDown size={20} />
              </motion.button>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Buy (Estimated)</span>
              </div>
              <div className="flex items-center gap-4">
                <div className={`text-3xl font-black w-full ${amountOut ? 'text-gray-900' : 'text-gray-200'}`}>
                  {amountOut || '0.00'}
                </div>
                <div className="bg-white rounded-xl border border-gray-200 px-3 py-1.5 flex items-center gap-2 font-bold hover:border-orange-400 transition-colors cursor-pointer shadow-sm">
                  <div className={`w-2 h-2 rounded-full ${toToken === 'VOLT' ? 'bg-orange-500' : 'bg-gray-300'}`} />
                  <span className="text-sm text-gray-900">{toToken}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-gray-50 rounded-xl p-4 text-sm text-gray-500 flex flex-col gap-2 border border-gray-100">
              <div className="flex justify-between font-medium">
                <span>Exchange Rate</span>
                <span className="text-gray-900 font-bold">1 {fromToken} = {priceVal.toFixed(6)} {toToken}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Price Impact</span>
                <span className="text-green-600 font-bold">0.05%</span>
              </div>
            </div>

            <button
              onClick={doSwap}
              disabled={isSwapping || !amountIn}
              className="w-full mt-6 bg-orange-500 text-white font-black text-lg py-5 rounded-2xl hover:bg-orange-600 active:scale-[0.98] transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed shadow-xl shadow-orange-500/10 flex items-center justify-center gap-3"
            >
              {isSwapping ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  <span>Swapping...</span>
                </>
              ) : isConnected ? (
                <span>Swap {fromToken}</span>
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
