# 42Brain - Online Multiplayer Quiz Platform

*This project was created as part of the 42 curriculum by **jmen**, **alandel**, **ikayiban**, and **tclouet**.*

42Brain is a real-time, online multiplayer quiz application developed as a team of four for the `ft_transcendence` project. It allows users to authenticate, practice, compete in tournaments, and interact with each other seamlessly.

---

## 🚀 Key Features & Highlights

* **Diverse Game Modes:** Supports Solo, Versus AI, Remote Multiplayer (1v1 & multi-player), and a structured Tournament system (4-player brackets with spectator mode).
* **Real-Time Synchronization:** Powered by WebSockets (Socket.IO) and backed by Redis for fast, in-memory session and game state management.
* **Blockchain Integration:** Tournament scores are permanently and immutably recorded on the Avalanche (Fuji Testnet) blockchain via Solidity smart contracts.
* **Social & Chat Layer:** Full-fledged friend system (requests, status) and real-time private messaging with read/unread tracking.
* **Robust Tech Stack:** Fully type-safe end-to-end architecture built using **SvelteKit**, **Express.js**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**.

---

## 🛠️ Getting Started & Makefile Commands

Before starting, ensure that **Docker Engine** (with Swarm mode capability) and **Google Chrome** are installed.

### 1. Environment & Secrets Configuration (Action Required)

* **For Local Development (`docker compose`):** Copy the `env_template` file at the root to `.env` and fill in your variables (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET`, `CHAIN_PRIVATE_KEY`).
  
* **For Cluster Deployment (`docker swarm`):** Navigate to the `secrets/` directory. **You must edit or create the `.txt` files inside this folder** with your actual sensitive data (e.g., database passwords, API keys) *before* running the secrets initialization command.

### 2. Deployment via Makefile
The included `Makefile` automates both production cluster orchestration (Docker Swarm) and local development (Docker Compose):

| Command | Context | Description |
| :--- | :--- | :--- |
| `make init` | **Swarm** | Initializes a Docker Swarm cluster on the local node. |
| `make secrets` | **Swarm** | **Reads files from `secrets/*.txt` and provisions them into Docker Secrets.** |
| `make deploy` | **Swarm** | Deploys the complete stack onto the Swarm cluster using the compose file. |
| `make rm` | **Swarm** | Tears down and removes the deployed Swarm stack. |
| `make reset-secrets` | **Swarm** | Purges all registered Docker secrets from the manager node. |
| `make up` | **Compose** | Builds and starts all services in the foreground using standard Docker Compose. |
| `make down` | **Compose** | Stops and removes active local Compose containers. |
| `make restart` | **Compose** | Hard-resets the local environment by clearing volumes and rebuilding from scratch. |

> 💡 **Accessing the App:** Once services are running, open **https://localhost:8888/**. (Accept the browser self-signed SSL certificate warning if prompted).

---

## 🔮 Future Roadmap: AI Co-Pilot Integration

We are planning to upgrade the application with an advanced **AI Injection Module** aimed at elevating both the user and developer experience:

* **RAG-Powered Quiz Assistant:** Implementing Retrieval-Augmented Generation (RAG) to dynamically extract contextual data, allowing the AI to generate high-quality, niche quiz questions on the fly based on custom text inputs or documents.
* **Intelligent Log & Error Diagnostic:** An automated backend pipeline that tracks, catches, and pipes system runtime exceptions to an LLM instance. It will provide developers with instant semantic error explanations, root-cause diagnostics, and code fix suggestions.
* **In-Game Explainer:** A smart assistant for players to query *why* a certain choice was correct right after a question concludes, deepening the educational value of the platform.

---

## 👥 Team & Roles

* **jmen** (Tech Lead / Architect): Backend infrastructure, API design, Socket.IO real-time synchronization, Redis caching, and Zod validation.
* **alandel** (Tech Lead Support): Game loops (matchmaking, multi-player logic, tournament brackets) and Avalanche Blockchain smart contract integration.
* **ikayiban** (Product Owner): Database modeling, Prisma ORM migration management, and the core algorithmic logic for the standard AI opponent.
* **tclouet** (Project Manager / Scrum Master): Frontend UI architecture (SvelteKit + Tailwind), client-side route guards, chat engine, and notification systems.