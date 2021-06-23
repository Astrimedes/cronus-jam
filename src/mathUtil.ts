type vector = {
  x: number,
  y: number
}

const normalFactor = 0.707; // 1/(sqrt(2))

export function normalizeDiagonal(vec: vector): vector {
  if (vec.x && vec.y) {
    vec.x *= normalFactor;
    vec.y *= normalFactor;
  }
  return vec;
}
