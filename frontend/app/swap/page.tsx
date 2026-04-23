'use client';
import { motion } from 'framer-motion';
import { SwapCard } from '@/components/SwapCard';
import { BottomNav } from '@/components/BottomNav';
import { revealUp } from '@/lib/animations';

export default function SwapPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-6 pt-20 pb-32">
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={revealUp}
        className="w-full max-w-lg mx-auto flex flex-col gap-8"
      >
        <div className="text-center flex flex-col gap-3">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase">Token Swap</h1>
          <p className="text-gray-500 font-medium max-w-md mx-auto">
            Instant on-chain swaps between VOLT and XLM using Soroban smart contracts.
          </p>
        </div>

        <SwapCard />

        {/* Price Chart Placeholder */}
        <motion.div 
          variants={revealUp}
          className="bg-gray-50 rounded-3xl h-48 border border-gray-100 flex flex-col items-center justify-center p-8 mt-4"
        >
          <div className="w-full h-full border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center">
            <span className="text-gray-400 font-black text-xs uppercase tracking-[0.2em]">Price chart — coming soon</span>
          </div>
        </motion.div>
      </motion.div>
      <BottomNav />
    </main>
  );
}
