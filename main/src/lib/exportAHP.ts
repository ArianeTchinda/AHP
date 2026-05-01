import jsPDF from "jspdf";
import type { useAHP } from "@/hooks/useAHP";

type AHP = ReturnType<typeof useAHP>;

export function exportJSON(ahp: AHP) {
  const data = {
    generatedAt: new Date().toISOString(),
    criteria: ahp.criteria,
    alternatives: ahp.alternatives,
    criteriaMatrix: ahp.criteriaMatrix,
    criteriaWeights: ahp.criteriaResult.weights,
    consistency: {
      lambdaMax: ahp.criteriaResult.lambdaMax,
      CI: ahp.criteriaResult.CI,
      CR: ahp.criteriaResult.CR,
      isConsistent: ahp.isConsistent,
    },
    alternativeMatrices: ahp.altMatrices,
    alternativeScores: ahp.alternativeScores,
    finalScores: ahp.finalScores,
    ranking: ahp.ranking,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ahp-resultat-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPDF(ahp: AHP) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Rapport AHP", margin, y);
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Généré le ${new Date().toLocaleString("fr-FR")}`, margin, y);
  y += 25;

  doc.setTextColor(20);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Recommandation", margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const winner = ahp.ranking[0];
  doc.text(
    `Meilleure alternative : ${winner?.name ?? "—"}  (score ${(winner?.score * 100).toFixed(2)}%)`,
    margin,
    y
  );
  y += 22;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Cohérence", margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(
    `λmax = ${ahp.criteriaResult.lambdaMax.toFixed(4)}   CI = ${ahp.criteriaResult.CI.toFixed(
      4
    )}   CR = ${(ahp.criteriaResult.CR * 100).toFixed(2)}%   ${
      ahp.isConsistent ? "(cohérent)" : "(INCOHERENT)"
    }`,
    margin,
    y
  );
  y += 22;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Poids des critères", margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  ahp.criteria.forEach((c, i) => {
    doc.text(`• ${c} : ${((ahp.criteriaResult.weights[i] ?? 0) * 100).toFixed(2)}%`, margin, y);
    y += 14;
  });
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Classement final", margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  ahp.ranking.forEach((r, idx) => {
    if (y > 760) {
      doc.addPage();
      y = margin;
    }
    doc.text(`${idx + 1}. ${r.name} — ${(r.score * 100).toFixed(2)}%`, margin, y);
    y += 14;
  });

  doc.save(`ahp-rapport-${Date.now()}.pdf`);
}
