# IPL2K26 — Full Stack (Node.js + PostgreSQL + React)

## Architecture
```
React (Netlify) → Node.js API (Render) → PostgreSQL (Render)
```

---

## Deploy in 3 Steps

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/ipl2k26-fullstack.git
git push -u origin main
```

### Step 2 — Deploy Backend + Database on Render

1. Go to **render.com** → Sign up free
2. **New → PostgreSQL** → Name: `ipl2k26-db` → Create
   - Copy the **Internal Database URL** shown
3. **New → Web Service** → Connect GitHub → select this repo
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `node server.js`
4. Add Environment Variables in Render:
   ```
   DATABASE_URL   = (paste your PostgreSQL Internal URL from step 2)
   JWT_SECRET     = ipl2k26SuperSecretKey2026MakeThisLong
   ADMIN_EMAIL    = velavanv77@gmail.com
   ADMIN_PASSWORD = Velavan111@
   NODE_ENV       = production
   ```
5. Click **Deploy** → Wait 2 minutes
6. Copy your backend URL: `https://ipl2k26-backend.onrender.com`

### Step 3 — Deploy Frontend on Netlify

1. **netlify.com** → New site → Import from Git → select this repo
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
2. Add Environment Variable:
   ```
   VITE_API_URL = https://ipl2k26-backend.onrender.com/api
   ```
3. Deploy ✅

---

## Local Development

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL URL
npm install
node server.js
# Runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## API Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | /api/auth/register | — | Sign up |
| POST | /api/auth/login | — | Login (email or username) |
| GET | /api/matches | — | All matches |
| POST | /api/matches | Admin | Create match |
| PUT | /api/matches/:id/live | Admin | Set live |
| DELETE | /api/matches/:id | Admin | Delete |
| POST | /api/bets | User | Place bet |
| GET | /api/bets/my | User | My bets |
| GET | /api/bets | Admin | All bets |
| POST | /api/bets/declare/:matchId | Admin | Declare result |
| GET | /api/wallet/balance | User | Balance |
| GET | /api/wallet/transactions | User | History |
| GET | /api/admin/users | Admin | All users |
| POST | /api/admin/users/:id/add-money | Admin | Credit wallet |
| GET | /api/admin/stats | Admin | Dashboard stats |

---

## Admin Access
URL: `https://your-site.netlify.app/auth/admin`
Email: `velavanv77@gmail.com`
Password: `Velavan111@`
