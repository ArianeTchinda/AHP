import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Trophy, Download, FileJson, AlertTriangle, Sparkles } from "lucide-react";
import { ConsistencyGauge } from "./ConsistencyGauge";
import { useAHP } from "@/hooks/useAHP";
import { exportJSON, exportPDF } from "@/lib/exportAHP";

interface DashboardStepProps {
  ahp: ReturnType<typeof useAHP>;
}

export function DashboardStep({ ahp }: DashboardStepProps) {
  const max = Math.max(...ahp.ranking.map((r) => r.score), 0.0001);
  const winner = ahp.ranking[0];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="glass-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/40 border border-border text-xs text-muted-foreground mb-3">
              <Sparkles className="h-3.5 w-3.5 text-secondary" />
              Synthèse AHP terminée
            </div>
            <h2 className="text-2xl md:text-4xl font-bold">
              Recommandation : <span className="text-gradient">{winner?.name ?? "—"}</span>
            </h2>
            <p className="text-muted-foreground mt-2">
              Score pondéré : {(winner?.score * 100).toFixed(2)}%
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => exportJSON(ahp)}
              variant="outline"
              className="border-border/60 bg-muted/30"
            >
              <FileJson className="h-4 w-4 mr-2" /> JSON
            </Button>
            <Button
              onClick={() => exportPDF(ahp)}
              className="bg-gradient-primary hover:opacity-90 border-0"
            >
              <Download className="h-4 w-4 mr-2" /> PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Cohérence + alerte */}
      <div className="grid gap-4 md:grid-cols-3">
        <ConsistencyGauge CR={ahp.criteriaResult.CR} label="Cohérence des critères" />
        <Card className="glass-card p-5">
          <p className="text-xs text-muted-foreground">λ max</p>
          <p className="text-2xl font-bold tabular-nums">
            {ahp.criteriaResult.lambdaMax.toFixed(3)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            CI = {ahp.criteriaResult.CI.toFixed(3)} · RI = {ahp.criteriaResult.RI}
          </p>
        </Card>
        <Card className="glass-card p-5">
          <p className="text-xs text-muted-foreground">Dimensions</p>
          <p className="text-2xl font-bold">
            {ahp.criteria.length}<span className="text-muted-foreground text-lg"> crit.</span>
            {" × "}
            {ahp.alternatives.length}<span className="text-muted-foreground text-lg"> alt.</span>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {ahp.criteria.length * (ahp.criteria.length - 1) / 2} comparaisons critères
          </p>
        </Card>
      </div>

      {!ahp.isConsistent && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 border-destructive/40"
        >
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-destructive">Préférences incohérentes</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Vos préférences sont incohérentes. Veuillez revoir vos comparaisons par paires
                (par ex. si A &gt; B et B &gt; C, alors A doit être nettement supérieur à C).
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {ahp.inconsistentCriterionIndexes.length > 0 && (
        <Card className="glass-card p-5 border-warning/30">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-warning">
                Notation incohérente sur certains critères
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Critère(s) à revoir :{" "}
                {ahp.inconsistentCriterionIndexes
                  .map((r) => `${ahp.criteria[r.i]} (CR ${(r.CR * 100).toFixed(1)}%)`)
                  .join(", ")}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Classement */}
      <Card className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Trophy className="h-5 w-5 text-secondary" />
          <h3 className="text-xl font-bold">Classement final</h3>
        </div>
        <ul className="space-y-3">
          {ahp.ranking.map((r, idx) => {
            const pct = (r.score / max) * 100;
            return (
              <motion.li
                key={r.index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="relative"
              >
                <div className="flex items-center gap-3 mb-1">
                  <span
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0
                        ? "bg-gradient-primary text-primary-foreground shadow-elegant"
                        : "bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="font-semibold flex-1 truncate">{r.name}</span>
                  <span className="tabular-nums text-sm">
                    {(r.score * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted/40 overflow-hidden ml-11">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.06 }}
                    className={`h-full rounded-full ${
                      idx === 0
                        ? "bg-gradient-primary"
                        : "bg-gradient-to-r from-muted-foreground/60 to-muted-foreground/30"
                    }`}
                  />
                </div>
              </motion.li>
            );
          })}
        </ul>
      </Card>

      {/* Poids des critères */}
      <Card className="glass-card p-6">
        <h3 className="text-xl font-bold mb-5">Poids des critères</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {ahp.criteria.map((c, i) => {
            const w = ahp.criteriaResult.weights[i] ?? 0;
            return (
              <div
                key={i}
                className="p-4 rounded-xl bg-muted/20 border border-border/50"
              >
                <div className="flex justify-between items-baseline">
                  <span className="font-medium truncate">{c}</span>
                  <span className="tabular-nums text-secondary font-semibold">
                    {(w * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${w * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-primary"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
