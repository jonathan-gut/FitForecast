## Getting Started 

### 1) Prereqs
- Python **3.10+**
- Git

### 2) Clone & enter repo
```bash
git clone https://github.com/jonathan-gut/FitForecast.git.git
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

### 5) Environment variables
Copy the example file and edit as needed:
```bash
cp .env.dist .env
```
**.env keys used now**
- `PORT` – optional; defaults to **5050** if not set.

*(Other keys in `.env.dist` like `DATABASE_URL`, `JWT_SECRET_KEY`, `WEATHER_API_KEY` are placeholders for upcoming features.)*

### 6) Run the backend
```bash
python backend/app.py
```
Then open:
```
http://localhost:5050/health
```
You should see:
```json
{"status":"Flask app working"}
```