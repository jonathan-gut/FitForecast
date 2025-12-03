## Getting Started 

### 1) Prereqs
- **Python** 3.10+
- **Node.js** 18+ (20.19+ recommended)
- **Git**

## ⚙️ Backend Setup (Flask)

### 2) Clone & enter repo
```bash
git clone https://github.com/jonathan-gut/FitForecast.git
cd FitForecast
```

### 3) Create a virtual environment
**macOS/Linux**
```bash
python3 -m venv .venv
source .venv/bin/activate
```
**Windows (PowerShell)**
```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 4) Install dependencies
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 5) PostgreSQL Setup (first-time only)
Start Postgres and create the local database:
```
brew services start postgresql@16           # macOS (if not running already)
createdb fitforecast

net start postgresql-x64-16                 # Windows
```
ensure psql is in your PATH (Apple Silicon):
```
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc # macOS
source ~/.zshrc

echo 'export PATH="/usr/local/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc    # Windows
source ~/.zshrc
```

check with
```
psql fitforecast -c "\dt"
```

### 6) Environment variables

Copy the example file and edit as needed:
```bash
cp .env.dist .env
```
**.env keys used now**
- Set 
```
DATABASE_URL=postgresql+psycopg2://<your-username>@localhost:5432/fitforecast
PORT=5050
```

Replace <your-username> with your macOS login name

*(Other keys in `.env.dist` like `DATABASE_URL`, `JWT_SECRET_KEY`, `WEATHER_API_KEY` are placeholders for upcoming features.)*

### 7) Run the backend + Test
Run the backend flask app (as a module)
```bash
python -m backend.app 
```
Then open:
```
http://localhost:5050/health
```
You should see:
```json
{"status":"Flask app working"}
```

Also run/open
```
curl http://localhost:5050/api/items
```
You should see:
```json
[]
```

Note: Empty right now because we have nothing in our database


## 💻 Frontend Setup (React + Vite)

### 1) Navigate to frontend 

```bash
cd frontend
```

### 2) Install dependencies
```bash
npm install
```

### 3) Development Proxy

Your React dev server (Vite) runs on http://localhost:5173,
and proxies API calls (like /health and /api/...) to the Flask backend on http://localhost:5050.

This is configured in frontend/vite.config.js:

```js
server: {
  proxy: {
    "/health": "http://localhost:5050",
    "/api": "http://localhost:5050"
  }
}
```

### 4) Run the frontend

```bash
npm run dev
```
Then open:
```
http://localhost:5173
```
You should see:
```json
FitForecast
Backend health: ✅ Flask app working
```


