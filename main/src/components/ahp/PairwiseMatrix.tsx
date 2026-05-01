import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowLeftRight } from "lucide-react";
import { useMemo } from "react";
import { saatyFromSlider, SAATY_LABELS } from "@/lib/ahp";
import type { Matrix } from "@/lib/ahp";

interface PairwiseMatrixProps {
  labels: string[];
  matrix: Matrix;
  onChange: (i: number, j: number, value: number) => void;
}

/** Convertit la valeur Saaty stockée en {direction, intensity} pour le slider. */
function toSlider(v: number): { intensity: number; direction: "left" | "right" | "equal" } {
  if (v === 1 || !isFinite(v)) return { intensity: 1, direction: "equal" };
  if (v > 1) return { intensity: Math.round(v), direction: "right" };
  return { intensity: Math.round(1 / v), direction: "left" };
}

/** Convertit la position du slider (-9..9) en valeur Saaty. */
function fromSliderPos(pos: number): number {
  if (pos === 0) return 1;
  const intensity = Math.abs(pos);
  const direction = pos > 0 ? "right" : "left";
  return saatyFromSlider(intensity, direction);
}

export function PairwiseMatrix({ labels, matrix, onChange }: PairwiseMatrixProps) {
  const pairs = useMemo(() => {
    const list: Array<{ i: number; j: number }> = [];
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        list.push({ i, j });
      }
    }
    return list;
  }, [labels.length]);

  if (pairs.length === 0) {
    return (
      <Card className="glass-card p-6 text-sm text-muted-foreground">
        Ajoutez au moins 2 éléments pour effectuer des comparaisons.
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {pairs.map(({ i, j }, idx) => {
        const v = matrix[i]?.[j] ?? 1;
        const { intensity, direction } = toSlider(v);
        const sliderPos = direction === "equal" ? 0 : direction === "right" ? intensity : -intensity;
        const labelTxt = direction === "equal" ? "Égales" : SAATY_LABELS[intensity];
        const winner = direction === "right" ? labels[i] : direction === "left" ? labels[j] : null;

        return (
          <motion.div
            key={`${i}-${j}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
          >
            <Card className="glass-card p-4 md:p-5 border-border/50">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-center mb-4">
                <div className="text-right md:text-right">
                  <p className="text-sm text-muted-foreground">A</p>
                  <p className="font-semibold text-base md:text-lg truncate">{labels[i]}</p>
                </div>
                <ArrowLeftRight className="hidden md:block h-5 w-5 text-secondary mx-auto" />
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">B</p>
                  <p className="font-semibold text-base md:text-lg truncate">{labels[j]}</p>
                </div>
              </div>

              <Slider
                value={[sliderPos]}
                min={-9}
                max={9}
                step={1}
                onValueChange={(val) => onChange(i, j, fromSliderPos(val[0]))}
                className="my-4"
              />

              <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                <span>{labels[j]} ↑ 9</span>
                <span>= égales</span>
                <span>9 ↑ {labels[i]}</span>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                <span className="px-3 py-1 rounded-full bg-muted/40 border border-border">
                  Intensité : <span className="font-semibold text-foreground">{intensity}</span> ·{" "}
                  <span className="text-secondary">{labelTxt}</span>
                </span>
                {winner && (
                  <span className="px-3 py-1 rounded-full bg-gradient-primary text-primary-foreground font-semibold">
                    {winner} préféré
                  </span>
                )}
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
