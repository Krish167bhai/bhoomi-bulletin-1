# 🏢 BHOOMI BULLETIN — Real Estate & Media Platform

A complete, production-ready, full-stack web application for real estate editorial journalism, property listing & advertising duration management, broker CRM, user accounts, and protected admin control.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
# In Root
npm install

# In Server
cd server
npm install
npm run seed     # Seeds Admin, Brokers, Properties, Articles, Leads
cd ..

# In Client
cd client
npm install
cd ..
```

### 2. Run Full-Stack Locally
```bash
# Starts both Backend (Port 5000) and Frontend (Port 5173)
npm run dev
```

- **Frontend App**: `http://localhost:5173/`
- **Backend API**: `http://localhost:5000/api`
- **Admin Panel**: `http://localhost:5173/admin`
- **User Portal**: `http://localhost:5173/account`

---

## 🔑 Default Login Credentials

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `admin@bhoomibulletin.com` | `Admin@123456` |
| **Broker** | `rajesh.broker@bhoomibulletin.com` | `User@123456` |
| **Owner** | `vikram.singh@gmail.com` | `User@123456` |

---

## 🌐 Production Hosting Guide

### Option 1: Deploy on Any Linux VPS / Cloud (Ubuntu / Debian / AWS EC2 / DigitalOcean)

1. **Upload & Unzip**:
   ```bash
   unzip bhoomi-bulletin-fullstack.zip -d bhoomi-bulletin
   cd bhoomi-bulletin
   ```

2. **Install Node.js (v18+) & Dependencies**:
   ```bash
   npm install --prefix server
   npm install --prefix client
   ```

3. **Build Full Application**:
   ```bash
   npm run build:server
   npm run build:client
   ```

4. **Start with PM2 (Process Manager)**:
   ```bash
   npm install -g pm2
   pm2 start "npm run start --prefix server" --name "bhoomi-server"
   pm2 save
   ```

5. **Nginx Reverse Proxy**:
   Point your domain to port `5000` (Backend API) and serve `client/dist` statically or proxy to Vite/Node.

---

### Option 2: Deploy on Render / Railway / Vercel

- **Backend (Render / Railway Web Service)**:
  - Root Directory: `server`
  - Build Command: `npm install && npx prisma generate && npm run build`
  - Start Command: `npm start`
  - Env Vars: `JWT_SECRET`, `NODE_ENV=production`, `PORT=5000`

- **Frontend (Vercel / Netlify)**:
  - Root Directory: `client`
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Env Vars / Proxy: `VITE_API_URL=https://your-backend-api.onrender.com`

---

## 📁 Project Architecture

- **`client/`**: React 18 + Vite + Tailwind CSS + Lucide React + Recharts + React Router DOM
- **`server/`**: Express.js + TypeScript + Prisma ORM (SQLite / PostgreSQL) + JWT Authentication + Multer Disk Storage + Node-Cron Ad Expiry + Decoupled EventEmitter EventBus
- **`server/prisma/`**: 15 Relational database models and seed scripts
- **`server/uploads/`**: Persistent directory for uploaded property photos, videos, logos, and avatars.
