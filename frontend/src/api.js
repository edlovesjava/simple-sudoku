const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchPuzzle(difficulty = 'medium') {
  const response = await fetch(`${API_BASE_URL}/puzzle?difficulty=${difficulty}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch puzzle');
  }
  return response.json();
}

export async function verifySolution(solution) {
  const response = await fetch(`${API_BASE_URL}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ solution }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to verify solution');
  }
  return response.json();
}
