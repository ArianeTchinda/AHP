// Moteur AHP (Analytical Hierarchy Process)
// Indices aléatoires de Saaty
export const RI_TABLE: Record<number, number> = {
  1: 0,
  2: 0,
  3: 0.58,
  4: 0.9,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
};

export type Matrix = number[][];

/** Crée une matrice identité n×n (diagonale = 1). */
export function identityMatrix(n: number): Matrix {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 1))
  );
}

/** Définit M[i][j] = v et M[j][i] = 1/v (réciprocité automatique). */
export function setReciprocal(matrix: Matrix, i: number, j: number, value: number): Matrix {
  const safe = value <= 0 ? 1 : value;
  const next = matrix.map((row) => [...row]);
  next[i][j] = safe;
  next[j][i] = 1 / safe;
  next[i][i] = 1;
  next[j][j] = 1;
  return next;
}

/** Normalise par somme de colonne, puis moyenne des lignes => poids (priority vector). */
export function computeWeights(matrix: Matrix): { weights: number[]; normalized: Matrix; colSums: number[] } {
  const n = matrix.length;
  if (n === 0) return { weights: [], normalized: [], colSums: [] };

  const colSums = Array.from({ length: n }, (_, j) =>
    matrix.reduce((acc, row) => acc + row[j], 0)
  );

  const normalized: Matrix = matrix.map((row) =>
    row.map((cell, j) => (colSums[j] === 0 ? 0 : cell / colSums[j]))
  );

  const weights = normalized.map((row) => row.reduce((a, b) => a + b, 0) / n);
  return { weights, normalized, colSums };
}

/** Calcule lambda_max, CI, CR. */
export function consistency(matrix: Matrix, weights: number[]): {
  lambdaMax: number;
  CI: number;
  CR: number;
  RI: number;
} {
  const n = matrix.length;
  if (n <= 2) return { lambdaMax: n, CI: 0, CR: 0, RI: 0 };

  // Aw : produit matrice × vecteur de poids
  const Aw = matrix.map((row) =>
    row.reduce((acc, cell, j) => acc + cell * weights[j], 0)
  );
  // (Aw_i / w_i), puis moyenne
  const ratios = Aw.map((v, i) => (weights[i] === 0 ? 0 : v / weights[i]));
  const lambdaMax = ratios.reduce((a, b) => a + b, 0) / n;

  const CI = (lambdaMax - n) / (n - 1);
  const RI = RI_TABLE[n] ?? 1.49;
  const CR = RI === 0 ? 0 : CI / RI;

  return { lambdaMax, CI, CR, RI };
}

/** Synthèse finale : poids critères × scores alternatives. */
export function finalSynthesis(
  criteriaWeights: number[],
  alternativeScores: number[][] // [altIndex][critIndex]
): number[] {
  return alternativeScores.map((scores) =>
    scores.reduce((acc, s, j) => acc + s * (criteriaWeights[j] ?? 0), 0)
  );
}

/** Convertit une valeur du slider 1..9 (avec inversion via signe) en valeur Saaty.
 *  direction: si "right" -> v ; si "left" -> 1/v
 */
export function saatyFromSlider(intensity: number, direction: "left" | "right" | "equal"): number {
  if (direction === "equal" || intensity <= 1) return 1;
  return direction === "right" ? intensity : 1 / intensity;
}

/** Étiquettes Saaty 1-9 */
export const SAATY_LABELS: Record<number, string> = {
  1: "Égale importance",
  2: "Faible",
  3: "Modérée",
  4: "Modérée+",
  5: "Forte",
  6: "Forte+",
  7: "Très forte",
  8: "Très forte+",
  9: "Extrême",
};
