# Contributing to Volt Pay

We welcome contributions! Please follow these steps:

1.  **Fork the repo** and create your branch from `main`.
2.  **Ensure you have Soroban CLI** installed.
3.  **Run tests** before submitting a PR: `make test`.
4.  **Format your code**: Use `cargo fmt` for Rust and `npm run format` for the frontend.
5.  **Submit a PR** with a clear description of your changes.

## Development Setup

-   `make build-contracts`: Compiles the Soroban contracts.
-   `cd frontend && npm run dev`: Starts the Next.js development server.
-   `scripts/deploy.js`: Deploys the protocol to Testnet.
