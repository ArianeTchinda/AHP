import { useMemo, useState, useCallback } from "react";
import {
  identityMatrix,
  setReciprocal,
  computeWeights,
  consistency,
  finalSynthesis,
  type Matrix,
} from "@/lib/ahp";

export function useAHP() {
  const [criteria, setCriteria] = useState<string[]>(["Prix", "Qualité", "Délai"]);
  const [alternatives, setAlternatives] = useState<string[]>(["Option A", "Option B", "Option C"]);

  const [criteriaMatrix, setCriteriaMatrix] = useState<Matrix>(() => identityMatrix(3));

  // Une matrice de comparaison par critère, sur les alternatives
  const [altMatrices, setAltMatrices] = useState<Matrix[]>(() =>
    [0, 1, 2].map(() => identityMatrix(3))
  );

  // --- Setup mutations
  const resyncCriteria = useCallback((next: string[]) => {
    setCriteria(next);
    setCriteriaMatrix(identityMatrix(next.length));
    setAltMatrices(next.map(() => identityMatrix(alternatives.length)));
  }, [alternatives.length]);

  const resyncAlternatives = useCallback((next: string[]) => {
    setAlternatives(next);
    setAltMatrices(criteria.map(() => identityMatrix(next.length)));
  }, [criteria]);

  const updateCriteriaCell = useCallback((i: number, j: number, value: number) => {
    setCriteriaMatrix((prev) => setReciprocal(prev, i, j, value));
  }, []);

  const updateAltCell = useCallback(
    (critIndex: number, i: number, j: number, value: number) => {
      setAltMatrices((prev) =>
        prev.map((m, k) => (k === critIndex ? setReciprocal(m, i, j, value) : m))
      );
    },
    []
  );

  // --- Calculs (mémorisés)
  const criteriaResult = useMemo(() => {
    const { weights, normalized, colSums } = computeWeights(criteriaMatrix);
    const cons = consistency(criteriaMatrix, weights);
    return { weights, normalized, colSums, ...cons };
  }, [criteriaMatrix]);

  const altResults = useMemo(() => {
    return altMatrices.map((m) => {
      const { weights, normalized, colSums } = computeWeights(m);
      const cons = consistency(m, weights);
      return { weights, normalized, colSums, ...cons };
    });
  }, [altMatrices]);

  // Tableau [altIndex][critIndex] des scores normalisés
  const alternativeScores = useMemo(() => {
    return alternatives.map((_, altIdx) =>
      criteria.map((_, critIdx) => altResults[critIdx]?.weights[altIdx] ?? 0)
    );
  }, [alternatives, criteria, altResults]);

  const finalScores = useMemo(
    () => finalSynthesis(criteriaResult.weights, alternativeScores),
    [criteriaResult.weights, alternativeScores]
  );

  const ranking = useMemo(() => {
    return alternatives
      .map((name, i) => ({ name, score: finalScores[i] ?? 0, index: i }))
      .sort((a, b) => b.score - a.score);
  }, [alternatives, finalScores]);

  const isConsistent = criteriaResult.CR < 0.1;
  const inconsistentCriterionIndexes = altResults
    .map((r, i) => ({ i, CR: r.CR }))
    .filter((r) => r.CR >= 0.1);

  return {
    // state
    criteria,
    alternatives,
    criteriaMatrix,
    altMatrices,
    // setters
    resyncCriteria,
    resyncAlternatives,
    updateCriteriaCell,
    updateAltCell,
    // computed
    criteriaResult,
    altResults,
    alternativeScores,
    finalScores,
    ranking,
    isConsistent,
    inconsistentCriterionIndexes,
  };
}
