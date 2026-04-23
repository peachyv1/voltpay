import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SWRProvider } from "./swr-provider";
import { Navbar } from "@/components/Navbar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LayoutTransitions } from "@/components/LayoutTransitions";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  title: "Volt Pay | Lightning Fast Stellar DeFi",
  description: "High-voltage DeFi on Stellar. Swap VOLT, provide liquidity, and earn yield — fully on-chain via Soroban.",
  openGraph: {
    title: "Volt Pay",
    description: "High-voltage DeFi on Stellar Testnet",
    url: "https://volt-pay.vercel.app",
    siteName: "Volt Pay",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Volt Pay",
    description: "High-voltage DeFi on Stellar Testnet",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-white text-gray-900 font-sans antialiased">
        <ErrorBoundary>
          <SWRProvider>
            <Navbar />
            {children}
          </SWRProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
