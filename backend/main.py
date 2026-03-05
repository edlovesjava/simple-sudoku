from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

from dokusan.generators import random_sudoku
from dokusan.boards import Sudoku, BoxSize
from dokusan import solvers, stats

BOX_SIZE = BoxSize(3, 3)

load_dotenv()

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app = FastAPI(
    title="Simple Sudoku API",
    description="Generate and validate Sudoku puzzles using dokusan",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DIFFICULTY_RANK = {
    "easy": 50,
    "medium": 150,
    "hard": 250,
}


class PuzzleResponse(BaseModel):
    puzzle: List[List[int]]
    difficulty: str
    rank: int
    id: str


class VerifyRequest(BaseModel):
    solution: List[List[int]]


class VerifyResponse(BaseModel):
    solved: bool
    message: str


def grid_to_string(grid: List[List[int]]) -> str:
    return "".join(str(cell) for row in grid for cell in row)


def string_to_grid(s: str) -> List[List[int]]:
    return [[int(s[r * 9 + c]) for c in range(9)] for r in range(9)]


@app.get("/")
def root():
    return {"message": "Simple Sudoku API", "docs": "/docs"}


@app.get("/puzzle", response_model=PuzzleResponse)
def get_puzzle(difficulty: str = "medium"):
    if difficulty not in DIFFICULTY_RANK:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid difficulty. Choose from: {', '.join(DIFFICULTY_RANK.keys())}",
        )

    avg_rank = DIFFICULTY_RANK[difficulty]
    puzzle = random_sudoku(avg_rank=avg_rank)
    puzzle_str = str(puzzle)
    rank = stats.rank(puzzle)
    grid = string_to_grid(puzzle_str)

    return PuzzleResponse(
        puzzle=grid,
        difficulty=difficulty,
        rank=rank,
        id=puzzle_str,
    )


@app.post("/verify", response_model=VerifyResponse)
def verify_solution(body: VerifyRequest):
    solution_grid = body.solution

    if len(solution_grid) != 9 or any(len(row) != 9 for row in solution_grid):
        raise HTTPException(status_code=400, detail="Solution must be a 9x9 grid")

    try:
        solution_str = grid_to_string(solution_grid)
        sudoku = Sudoku.from_string(solution_str, box_size=BOX_SIZE)
        solved = sudoku.is_solved()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid solution format: {exc}") from exc

    if solved:
        return VerifyResponse(solved=True, message="Congratulations! The solution is correct.")
    return VerifyResponse(solved=False, message="The solution is incorrect. Keep trying!")
