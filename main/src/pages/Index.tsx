import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stepper, type Step } from "@/components/ahp/Stepper";
import { SetupStep } from "@/components/ahp/SetupStep";
import { PairwiseMatrix } from "@/components/ahp/PairwiseMatrix";
import { ConsistencyGauge } from "@/components/ahp/ConsistencyGauge";
import { AlternativeScoringStep } from "@/components/ahp/AlternativeScoringStep";
import { DashboardStep } from "@/components/ahp/DashboardStep";
import { useAHP } from "@/hooks/useAHP";

const STEPS: Step[] = [
  { id: 1, title: "Configuration", subtitle: "Critères & alternatives" },
  { id: 2, title: "Critères", subtitle: "Comparaisons par paires" },
  { id: 3, title: "Alternatives", subtitle: "Notation par critère" },
  { id: 4, title: "Centre d'intelligence", subtitle: "Synthèse & diagnostic" },
];

const Index = () => {
  const ahp = useAHP();
  const [step, setStep] = useState(0);

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  return (
    <main className="min-h-screen px-4 py-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8 md:mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-5">
            <Brain className="h-4 w-4 text-secondary" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              AHP Decision Engine
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Décidez avec <span className="text-gradient">rigueur</span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Méthode AHP de Saaty — Comparez vos critères, notez vos alternatives,
            obtenez une recommandation mesurée et cohérente.
          </p>
        </header>

        <Card className="glass-card p-5 md:p-6 mb-6">
          <Stepper steps={STEPS} current={step} onSelect={setStep} />
        </Card>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <SetupStep
                criteria={ahp.criteria}
                alternatives={ahp.alternatives}
                onCriteriaChange={ahp.resyncCriteria}
                onAlternativesChange={ahp.resyncAlternatives}
              />
            )}

            {step === 1 && (
              <Card className="glass-card p-4 md:p-6">
                <div className="mb-5 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold">
                      Comparaison des critères
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Faites glisser vers le critère qui vous semble le plus important.
                    </p>
                  </div>
                  <div className="md:w-72">
                    <ConsistencyGauge CR={ahp.criteriaResult.CR} />
                  </div>
                </div>
                <PairwiseMatrix
                  labels={ahp.criteria}
                  matrix={ahp.criteriaMatrix}
                  onChange={ahp.updateCriteriaCell}
                />
              </Card>
            )}

            {step === 2 && <AlternativeScoringStep ahp={ahp} />}

            {step === 3 && <DashboardStep ahp={ahp} />}
          </motion.div>
        </AnimatePresence>

        {/* Nav */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={prev}
            disabled={step === 0}
            className="border-border/60 bg-muted/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Précédent
          </Button>

          <span className="text-xs text-muted-foreground tabular-nums">
            Étape {step + 1} / {STEPS.length}
          </span>

          <Button
            onClick={next}
            disabled={step === STEPS.length - 1}
            className="bg-gradient-primary hover:opacity-90 border-0"
          >
            Suivant <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          Calculs AHP en local · Aucune donnée n'est envoyée sur Internet.
        </footer>
      </div>
    </main>
  );
};

export default Index;
