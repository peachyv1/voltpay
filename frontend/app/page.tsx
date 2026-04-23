'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Zap } from 'lucide-react';
import Link from 'next/link';
import { useFreighter } from '@/hooks/useFreighter';
import { usePoolStats } from '@/hooks/usePoolStats';
import { StatsBar } from '@/components/StatsBar';
import { BottomNav } from '@/components/BottomNav';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { useTilt } from '@/hooks/useTilt';
import { zeroG, floatUp, stagger, orb, revealUp } from '@/lib/animations';

const FEATURES = [
  { title: 'Swap Tokens', desc: 'Instantly swap VOLT ↔ XLM using the Soroban liquidity pool.', href: '/swap', cta: 'Start Swapping' },
  { title: 'Provide Liquidity', desc: 'Add VOLT + XLM to the pool and earn yield on your position.', href: '/pool', cta: 'Add Liquidity' },
  { title: 'Your Dashboard', desc: 'Monitor your VOLT balance, trustline status, and live transactions.', href: '/dashboard', cta: 'View Dashboard' },
];

export default function HomePage() {
  const { isConnected, connect } = useFreighter();
  const { tvl, apy } = usePoolStats();
  const [mounted, setMounted] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const { ref: coinRef, style: coinTiltStyle, ...coinTiltHandlers } = useTilt(20);

  useEffect(() => setMounted(true), []);

  const scrollToStats = () => {
    statsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!mounted) return <div className="min-h-screen bg-white" />;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[calc(100vh-80px)] min-h-[700px] flex items-center overflow-hidden bg-white px-6">
        {/* Ambient Background Elements */}
        <motion.div {...orb(0)} className="absolute top-20 right-10 w-96 h-96 rounded-full bg-orange-50 z-0" />
        <motion.div {...orb(2)} className="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-gray-50 z-0" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center z-10">
          {/* Left Column: Content */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={revealUp}
          >
            <div className="text-label text-orange-600 mb-6 font-black tracking-[0.2em]">
              Stellar DeFi Protocol
            </div>
            <h1 className="text-display text-gray-900 mb-8">
              Volt Pay<br />Finance
            </h1>
            <p className="text-xl text-gray-500 max-w-lg mb-10 leading-relaxed font-medium">
              Minimal, high-performance DeFi on Stellar. Swap, pool, and earn yield — fully on-chain via Soroban.
            </p>

            <div className="flex flex-wrap gap-4 mb-16">
              <Link href={isConnected ? "/dashboard" : "#"} onClick={!isConnected ? connect : undefined}>
                <button className="bg-orange-500 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-orange-600 active:scale-95 transition-all">
                  {isConnected ? 'Open Dashboard' : 'Get Started'}
                </button>
              </Link>
              <button className="border-2 border-gray-900 text-gray-900 px-10 py-5 rounded-2xl font-black text-lg hover:bg-gray-900 hover:text-white active:scale-95 transition-all">
                Documentation
              </button>
            </div>

            {/* Hero Stats */}
            <div className="flex items-center gap-12 pt-8 border-t border-gray-100">
              <div className="flex flex-col">
                <div className="text-3xl font-black text-gray-900 mb-1">
                  <AnimatedNumber value={parseFloat(tvl)} prefix="$" decimals={0} />
                </div>
                <span className="text-label text-gray-400">Total Value Locked</span>
              </div>
              <div className="h-10 w-px bg-gray-200" />
              <div className="flex flex-col">
                <div className="text-3xl font-black text-orange-500 mb-1">
                  <AnimatedNumber value={parseFloat(apy)} suffix="%" decimals={1} />
                </div>
                <span className="text-label text-gray-400">Current APY</span>
              </div>
              <div className="h-10 w-px bg-gray-200" />
              <div className="flex flex-col">
                <div className="text-3xl font-black text-gray-900 mb-1">
                  <AnimatedNumber value={24000} suffix="+" decimals={0} />
                </div>
                <span className="text-label text-gray-400">Total Users</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Visual */}
          <div className="hidden lg:flex justify-center items-center">
            <motion.div
              ref={coinRef}
              style={coinTiltStyle}
              {...coinTiltHandlers}
              className="relative"
            >
              <motion.div
                {...zeroG}
                className="w-64 h-64 bg-orange-500 rounded-full flex items-center justify-center"
              >
                <Zap size={120} className="text-white fill-white" />
                {/* Orbiting Dot */}
                <div className="absolute inset-0 animate-[spin_4s_linear_infinite]">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-orange-500 border-4 border-white rounded-full" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer"
          onClick={scrollToStats}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-label text-gray-400">Scroll to Explore</span>
            <ChevronDown className="text-orange-500" size={32} />
          </motion.div>
        </motion.div>
      </section>

      {/* Live Stats Strip */}
      <motion.div 
        ref={statsRef} 
        variants={revealUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="bg-gray-50 border-y border-gray-200 py-12"
      >
        <div className="max-w-7xl mx-auto px-6">
          <StatsBar />
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 md:grid-cols-3 gap-8">
        {FEATURES.map(({ title, desc, href, cta }, i) => (
          <motion.div
            key={href}
            variants={stagger(i)}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="bg-white p-10 rounded-3xl border border-gray-100 flex flex-col gap-6"
          >
            <h3 className="text-2xl font-black text-gray-900">{title}</h3>
            <p className="text-gray-500 leading-relaxed font-medium flex-1">{desc}</p>
            <Link href={href}>
              <button className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-orange-500 transition-colors">
                {cta}
              </button>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="pb-20">
        <BottomNav />
      </div>
    </main>
  );
}
