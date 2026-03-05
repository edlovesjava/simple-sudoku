"""Tests for the Simple Sudoku FastAPI backend."""
import pytest
from fastapi.testclient import TestClient

from main import app, string_to_grid

from dokusan.boards import Sudoku, BoxSize
from dokusan import solvers


@pytest.fixture
def client():
    return TestClient(app)


def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Simple Sudoku API"


@pytest.mark.parametrize("difficulty", ["easy", "medium", "hard"])
def test_get_puzzle_valid_difficulty(client, difficulty):
    response = client.get(f"/puzzle?difficulty={difficulty}")
    assert response.status_code == 200
    data = response.json()
    assert data["difficulty"] == difficulty
    assert isinstance(data["rank"], int)
    assert isinstance(data["id"], str) and len(data["id"]) == 81
    grid = data["puzzle"]
    assert len(grid) == 9
    assert all(len(row) == 9 for row in grid)
    assert all(0 <= cell <= 9 for row in grid for cell in row)


def test_get_puzzle_default_difficulty(client):
    response = client.get("/puzzle")
    assert response.status_code == 200
    assert response.json()["difficulty"] == "medium"


def test_get_puzzle_invalid_difficulty(client):
    response = client.get("/puzzle?difficulty=expert")
    assert response.status_code == 400
    assert "Invalid difficulty" in response.json()["detail"]


def test_verify_correct_solution(client):
    puzzle_resp = client.get("/puzzle?difficulty=easy")
    puzzle_id = puzzle_resp.json()["id"]

    sudoku = Sudoku.from_string(puzzle_id, box_size=BoxSize(3, 3))
    solution = solvers.backtrack(sudoku)
    solution_str = str(solution)
    solution_grid = string_to_grid(solution_str)

    response = client.post("/verify", json={"solution": solution_grid})
    assert response.status_code == 200
    data = response.json()
    assert data["solved"] is True
    assert "Congratulations" in data["message"]


def test_verify_incorrect_solution(client):
    wrong_grid = [[1] * 9 for _ in range(9)]
    response = client.post("/verify", json={"solution": wrong_grid})
    assert response.status_code == 200
    data = response.json()
    assert data["solved"] is False
    assert "incorrect" in data["message"]


def test_verify_invalid_grid_size(client):
    bad_grid = [[1, 2, 3]]
    response = client.post("/verify", json={"solution": bad_grid})
    assert response.status_code == 400
