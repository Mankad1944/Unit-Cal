# Deployment Guide: Unit Calc MERN Stack

This guide details the step-by-step procedure to deploy the Unit Calc MERN application to production using **GitHub**, **MongoDB Atlas**, **Render** (Backend), and **Vercel** (Frontend).

---

## Architecture Overview

```
                      ┌─────────────────────────────────┐
                      │        Vercel (Frontend)        │
                      │   Next.js 16 + React 19 + CSS   │
                      └────────────────┬────────────────┘
                                       │ HTTPS REST / CORS
                                       ▼
                      ┌─────────────────────────────────┐
                      │        Render (Backend)         │
                      │     Node.js + Express API       │
                      └────────────────┬────────────────┘
                                       │ Mongoose TLS
                                       ▼
                      ┌─────────────────────────────────┐
                      │      MongoDB Atlas (Cloud)      │
                      │    Cluster M0 Distributed DB    │
                      └─────────────────────────────────┘
```

---

## Part 1: MongoDB Atlas Setup (Database)

1. **Log in / Sign up**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. **Create a Free Cluster**:
   - Choose **Shared M0** (Free).
   - Select cloud provider (AWS/GCP) and a region closest to your users (e.g., `ap-south-1` Mumbai or `us-east-1`).
3. **Configure Database Access (User)**:
   - Go to **Security** → **Database Access** → **Add New Database User**.
   - Authentication Method: **Password**.
   - Username: e.g. `unitcalc_admin`.
   - Password: Click **Autogenerate Secure Password** or set a strong password. (Save this securely!).
   - Database User Privileges: `Read and write to any database` or `Atlas admin`.
4. **Configure Network Access (IP Whitelist)**:
   - Go to **Security** → **Network Access** → **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`) so that Render's cloud servers can connect to the database.
   - Click **Confirm**.
5. **Get Connection String**:
   - Go to **Clusters** → Click **Connect**.
   - Select **Drivers** (Node.js).
   - Copy the connection URI. It will look like:
     ```
     mongodb+srv://unitcalc_admin:<password>@cluster0.xxxxx.mongodb.net/unitcalc?retryWrites=true&w=majority
     ```
   - Replace `<password>` with the password you set in Step 3.

---

## Part 2: Backend Deployment on Render

1. **Push Backend to GitHub**:
   - If using a monorepo or dedicated backend repo, ensure `backend` contains:
     - `server.js`
     - `package.json` (with `"start": "node server.js"`)
     - `Procfile`
2. **Create New Web Service on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com).
   - Click **New +** → **Web Service**.
   - Connect your GitHub repository.
3. **Configure the Service**:
   - **Name**: `unitcalc-backend` (or your choice)
   - **Root Directory**: `backend` (if in monorepo, else leave blank)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
4. **Set Environment Variables** (under **Environment** tab):
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGO_URI` | `mongodb+srv://unitcalc_admin:<password>@cluster0.xxxxx.mongodb.net/unitcalc?retryWrites=true&w=majority` |
   | `JWT_SECRET` | A secure random 64-character secret key |
   | `FRONTEND_URL` | Your Vercel frontend URL (e.g. `https://unit-calc.vercel.app`) |
5. **Deploy**:
   - Click **Create Web Service**.
   - Once deployed, copy your Render backend URL (e.g. `https://unitcalc-backend.onrender.com`).

---

## Part 3: Frontend Deployment on Vercel

1. **Push Frontend to GitHub**:
   - Ensure `frontend` contains `package.json`, `vercel.json`, and all source files.
2. **Import Project into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com).
   - Click **Add New...** → **Project**.
   - Select your GitHub repository.
3. **Configure Project Settings**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click edit and select `frontend` (if in monorepo).
   - **Build Command**: `next build --no-turbo` (already configured in `package.json` & `vercel.json`).
4. **Set Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | Your Render backend URL (e.g. `https://unitcalc-backend.onrender.com`) |
5. **Deploy**:
   - Click **Deploy**.
   - Vercel will build and assign a production URL (e.g. `https://unit-calc.vercel.app`).
6. **Final CORS Sync**:
   - Go back to Render → your backend service → Environment Variables.
   - Ensure `FRONTEND_URL` matches your exact Vercel production domain.

---

## Part 4: Super Admin Access

Once deployed (or locally):
- Navigate to `/login` or click the user account icon in the header.
- Sign in using your Super Administrator credentials:
  - **Email**: `superadmin@unitcalc.io`
  - **Password**: *(Provided in the completion summary)*
- After signing in, you will be automatically routed to the **Super Admin Portal** (`/admin`).
- You have unrestricted, complete access to:
  - **System Telemetry & Live Controls**
  - **Individual User Privileges & Access Toggles**
  - **Global & Role-Based Access Matrix**
  - **Formula Specs & Mathematical Sandbox**
  - **System Lockdown / Maintenance Controls**

