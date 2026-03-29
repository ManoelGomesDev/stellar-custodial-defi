# Stellar Custodial DeFi

**Modern full-stack DeFi platform built on the Stellar blockchain.**

Automatic wallet creation on Stellar Testnet, user authentication, native XLM transfers, and interaction with a Soroban smart contract (Rust). Perfect for learning how to build real DeFi applications with a complete custodial wallet abstraction.

![Stellar](https://img.shields.io/badge/Stellar-0A2540?style=for-the-badge&logo=stellar&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Soroban](https://img.shields.io/badge/Soroban-Rust-000000?style=for-the-badge&logo=rust&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

## ✨ Features

- **Automatic wallet creation**: Every new user gets a Stellar wallet instantly (Testnet + Friendbot funding)
- **Custodial wallet abstraction** (built from scratch – no external wallet libraries)
- **User authentication** (JWT + bcrypt)
- **Send XLM** between accounts
- **DeFi interactions** with Soroban smart contract (mint fungible token)
- **Modern UI** with Stellar official color palette (navy + cyan)
- **Docker + PostgreSQL** ready
- **Fully functional** on Stellar Testnet

## 🛠️ Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Frontend       | Next.js 16 + Tailwind + TypeScript  |
| Backend        | NestJS + TypeScript                 |
| Smart Contract | Soroban (Rust)                      |
| Database       | PostgreSQL                          |
| Blockchain     | Stellar Testnet + RPC               |
| Auth           | JWT + bcrypt                        |
| Container      | Docker Compose                      |

## 🚀 Quick Start

1. **Clone the repo**
   ```bash
   git clone https://github.com/SEU_USUARIO/stellar-custodial-defi.git
   cd stellar-custodial-defi