# simple-sudoku

A full-stack Sudoku game with a **Python / FastAPI** backend that generates puzzles using [dokusan](https://github.com/unmade/dokusan) and a **React** web client to solve them.

## Project Structure

```
simple-sudoku/
├── backend/          # Python FastAPI API server
│   ├── main.py       # API endpoints
│   ├── requirements.txt
│   ├── Dockerfile
│   └── test_main.py  # pytest tests
├── frontend/         # React (Vite) web client
│   ├── src/
│   │   ├── App.jsx            # Root component & game state
│   │   ├── api.js             # API calls to backend
│   │   └── components/
│   │       ├── SudokuGrid.jsx  # 9×9 grid
│   │       ├── SudokuCell.jsx  # Individual cell (read-only or editable)
│   │       ├── NumberPad.jsx   # Mobile-friendly number input
│   │       └── Timer.jsx       # Elapsed-time counter
│   ├── Dockerfile
│   └── vite.config.js
└── docker-compose.yml
```

## Quick Start — Docker Compose

```bash
docker-compose up --build
```

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:5173  |
| Backend  | http://localhost:8000  |
| API docs | http://localhost:8000/docs |

---

## Backend (Python + FastAPI + dokusan)

### Requirements

- Python 3.10+

### Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Optional: copy env file
cp .env.example .env
```

### Run

```bash
uvicorn main:app --reload
```

API available at http://localhost:8000  
Interactive docs at http://localhost:8000/docs

### API Endpoints

| Method | Path              | Description                         |
|--------|-------------------|-------------------------------------|
| GET    | `/puzzle`         | Generate a new puzzle                |
| POST   | `/verify`         | Verify a completed solution          |

**GET /puzzle**

Query params:
- `difficulty` — `easy` \| `medium` \| `hard` (default: `medium`)

Response:
```json
{
  "puzzle": [[5,0,4,...], ...],  // 9×9 grid (0 = empty)
  "difficulty": "medium",
  "rank": 157,
  "id": "504900632..."           // 81-char string representation
}
```

**POST /verify**

Body:
```json
{
  "solution": [[5,7,4,...], ...]  // completed 9×9 grid
}
```

Response:
```json
{
  "solved": true,
  "message": "Congratulations! The solution is correct."
}
```

### Tests

```bash
pip install pytest httpx
pytest test_main.py -v
```

---

## Frontend (React + Vite)

### Requirements

- Node.js 18+

### Setup

```bash
cd frontend
npm install
cp .env.example .env    # points VITE_API_URL to the backend
```

### Run

```bash
npm run dev
```

App available at http://localhost:5173

### Build

```bash
npm run build
```

### Features

- 🎮 Three difficulty levels: Easy, Medium, Hard
- ⏱ Live timer per game
- 🔴 Real-time error highlighting (invalid rows, columns, and boxes)
- 📱 Mobile-friendly number pad
- ✅ Server-side solution verification
- 🌙 Dark mode support (follows OS preference)
