# Unit Calc — Enterprise MERN Unit Converter & Financial Portal

A high-performance, dark cyber-luxe Unit Converter, Mathematical Suite, and Financial Calculator application built with Next.js 16 (React 19), Express 5, Tailwind CSS, and MongoDB.

---

## ✨ Features

- **Unit Converters**:
  - Length, Height Comparison Visualizer, Area (including Gujarati Land Units: Vigha, Guntha, Vaar), Weight & Mass, Volume & Liquid Measures, Weight ⟷ Volume Density substance converter, Temperature, Speed, Time, and Digital Storage.
- **Financial Calculators (Ported & Enhanced)**:
  - **NSC (National Savings Certificate)**: 5-year fixed cycles, Single/Joint investment modes, At-maturity options (Payout / Reinvest), Yearly Additions, One-time Additions, and complete amortization schedule.
  - **Loan / EMI Amortization**: Vehicle, Home, Personal, Education loans, Moratorium period, Prepayment impact modes (Reduce Tenure vs Reduce EMI), Processing fees, Exchange value, and Down payment.
  - **PPF (Public Provident Fund)**: 15-year statutory tenure with 5-year block extensions and compound interest breakdowns.
  - **FD (Fixed Deposit)**: Cumulative, Quarterly, Monthly, and Half-Yearly compounding options.
  - **RD (Recurring Deposit)**: Indian Post / Banking standard quarterly compounding schedules.
  - **SIP / Mutual Funds**: Monthly SIP and Lumpsum investment growth with wealth gain vs invested capital analytics.
- **Super Administrator Portal (`/admin`)**:
  - **Live Cluster Telemetry**: Real-time Node API latency monitoring, DB status, active session counters.
  - **Individual User Privileges Controller**: Granular tool-by-tool and section-by-section access control for every individual user in the database.
  - **Role-Based Privileges Matrix**: Configurable default permissions matrix for Guests, Registered Users, Admins, and SuperAdmins.
  - **Mathematical Formula Sandbox**: Live interactive formula verification sandbox.
  - **Emergency Maintenance & Lockdown Controls**: Instant system suspension switches.
- **UX & Design**:
  - Global `pointer` cursor on all interactive elements.
  - Removed native number spinners globally across all input boxes.
  - Bilingual interface (English & Gujarati).
  - Modern glassmorphism UI with Tailwind CSS.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally on port 27017 or Atlas URI)

### 1. Backend Setup
```bash
cd backend
npm install
node server.js
```
The backend will run on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🌐 Production Deployment

Refer to [`DEPLOYMENT.md`](./DEPLOYMENT.md) for step-by-step instructions for:
- Deploying frontend to **Vercel**
- Deploying backend to **Render**
- Setting up **MongoDB Atlas**
- GitHub repository configuration

