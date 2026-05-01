import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  id: number;
  title: string;
  subtitle: string;
}

interface StepperProps {
  steps: Step[];
  current: number;
  onSelect: (index: number) => void;
}

export function Stepper({ steps, current, onSelect }: StepperProps) {
  return (
    <nav aria-label="Progression" className="w-full">
      <ol className="flex items-start justify-between gap-2 md:gap-4">
        {steps.map((step, idx) => {
          const isDone = idx < current;
          const isActive = idx === current;
          return (
            <li key={step.id} className="flex-1 min-w-0">
              <button
                type="button"
                onClick={() => onSelect(idx)}
                disabled={idx > current}
                className={cn(
                  "group w-full text-left transition-all duration-300",
                  idx > current && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isActive ? 1.05 : 1,
                    }}
                    className={cn(
                      "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all",
                      isActive &&
                        "bg-gradient-primary text-primary-foreground border-transparent shadow-elegant animate-pulse-glow",
                      isDone && "bg-success/20 text-success border-success/40",
                      !isActive && !isDone && "bg-muted/40 text-muted-foreground border-border"
                    )}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : step.id}
                  </motion.div>
                  <div className="hidden md:block min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{step.subtitle}</p>
                  </div>
                </div>
                <div
                  className={cn(
                    "mt-3 h-0.5 w-full rounded-full transition-all duration-500",
                    isDone || isActive ? "bg-gradient-primary" : "bg-border"
                  )}
                />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
