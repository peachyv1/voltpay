<div align="center">

![Volt Pay Banner](./screenshots/banner.png)

# ⚡ Volt Pay

**The High-Voltage Liquidity Protocol on Stellar.**

[![CI/CD](https://github.com/peachyv1/voltpay/actions/workflows/ci.yml/badge.svg)](https://github.com/peachyv1/voltpay/actions)
[![Stellar](https://img.shields.io/badge/Network-Stellar_Testnet-blue?logo=stellar)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Smart_Contracts-Soroban-purple?logo=rust)](https://soroban.stellar.org)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_14-black?logo=next.js)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

[Live Demo](https://volt-pay.vercel.app) · [Report Bug](https://github.com/peachyv1/voltpay/issues) · [Request Feature](https://github.com/peachyv1/voltpay/issues)

</div>

---

## 🚀 Overview

Volt Pay is a decentralized liquidity protocol built on the **Stellar Blockchain** using **Soroban Smart Contracts**. It allows users to swap assets, provide liquidity to automated market makers (AMM), and earn yields through a streamlined, premium user interface.

### ✨ Key Features

-   **⚡ Seamless Swaps:** Instant VOLT ↔ XLM swaps powered by an efficient AMM.
-   **💧 Liquidity Pools:** Provide liquidity and earn fees from every transaction.
-   **📈 Real-time Analytics:** Live price feeds and transaction streams directly from contract events.
-   **🛡️ Trustline-Gated Access:** Integrated Stellar trustline management for secure token interactions.
-   **✨ Premium UI:** A futuristic, glassmorphic design built with Framer Motion and Lucide icons.

---

## 📸 Visual Showcase

### 📱 Mobile Experience
![Mobile Dashboard Preview](./screenshots/dashboard.png)
*Optimized for mobile-first interaction with a persistent bottom navigation and real-time balance updates.*

### 🔄 Advanced Swaps
![Swap Interface Preview](./screenshots/swap.png)
*Precision swapping with slippage protection and live rate calculations from pool reserves.*

### 🌊 Liquidity Provision
![Liquidity Pool Preview](./screenshots/pool.png)
*Manage your positions with ease. Detailed pool statistics and APY tracking.*

---

## 🎥 Video Demonstration

![Volt Pay Demo](./screenshots/demo.gif)
*A walkthrough of the full protocol flow: connecting wallet, adding trustline, requesting test VOLT, and providing liquidity.*

---

## 🛠️ Architecture

```mermaid
graph TD
    User((User)) -->|Connects| Wallet[Freighter Wallet]
    Wallet -->|Signs| TX[Stellar Transaction]
    TX -->|Submits| RPC[Soroban RPC]
    
    subgraph "Soroban Smart Contracts"
        LP[Liquidity Pool Contract]
        Token[VOLT Token Contract]
        Bridge[Bridge Contract]
    end
    
    RPC --> LP
    LP --> Token
    Bridge --> LP
    
    subgraph "Frontend Layer"
        Next[Next.js 14 App Router]
        SWR[SWR Real-time Polling]
        Motion[Framer Motion Animations]
    end
    
    Next -->|Queries| Horizon[Stellar Horizon API]
    Next -->|Fetches| RPC
    SWR -->|Polls| NextAPI[Next.js API Routes]
```

---

## 📂 Project Structure

```text
.
├── contracts/               # Soroban Smart Contracts (Rust)
│   ├── volt-token/          # Custom SAC Token Implementation
│   └── liquidity-pool/      # AMM & Liquidity Logic
├── frontend/                # Next.js 14 Application
│   ├── app/                 # App Router Pages & API Routes
│   ├── components/          # Reusable UI Components
│   └── hooks/               # Custom React Hooks for Stellar/SWR
├── scripts/                 # Deployment & Management Scripts
└── Makefile                 # Build & Test Orchestration
```

---

## 🏗️ Technical Stack

-   **Contracts:** Rust, Soroban SDK v21
-   **Frontend:** Next.js 14, TypeScript, Vanilla CSS
-   **State Management:** SWR (Real-time polling)
-   **Animations:** Framer Motion
-   **Icons:** Lucide React
-   **Backend:** Next.js Edge Functions (API Routes)
-   **Infrastructure:** GitHub Actions (CI/CD), Vercel (Deployment)

---

## 🚦 Getting Started

### Prerequisites

-   [Stellar CLI](https://developers.stellar.org/docs/tools/stellar-cli/install)
-   [Rust & Cargo](https://rustup.rs/)
-   [Node.js 20+](https://nodejs.org/)
-   [Freighter Wallet](https://www.freighter.app/)

### Installation

1.  **Clone the repo:**
    ```bash
    git clone https://github.com/peachyv1/voltpay.git
    cd volt_pay
    ```

2.  **Build Contracts:**
    ```bash
    make build-contracts
    ```

3.  **Setup Frontend:**
    ```bash
    cd frontend
    npm install
    cp .env.example .env.local
    # Configure your environment variables
    npm run dev
    ```

---

## 📜 Contract Details

| Contract | Network | Address |
| :--- | :--- | :--- |
| **VOLT Token** | Testnet | `CCHLK4RHSS27U4K6VRIP6QW2N5IGBJJES4GA4CI3RRUGP54G4FH5HL7P` |
| **Liquidity Pool** | Testnet | `CCQZXG3QGFPLRS6LJJ4XALJGUGVNLISYN6BJSVOH57ED6FYJH7KGKXAR` |
| **Bridge** | Testnet | `CBMGE6BSHIGBXAUMW32D542POCBMI3DHP7ZZGI6RTGPRECJQA3S5ZFDI` |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <br />
  Built with ❤️ on Stellar
</div>
