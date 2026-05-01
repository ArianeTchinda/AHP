import { motion } from "framer-motion";
import { Activity, AlertTriangle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConsistencyGaugeProps {
  CR: number;
  label?: string;
}

export function ConsistencyGauge({ CR, label = "Cohérence (CR)" }: ConsistencyGaugeProps) {
  const safeCR = isFinite(CR) ? CR : 0;
  const percent = Math.min(100, Math.max(0, (safeCR / 0.2) * 100));
  const ok = safeCR < 0.1;
  const display = (safeCR * 100).toFixed(1);

  return (
    <div className="glass-card p-5 relative overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {ok ? (
            <ShieldCheck className="h-5 w-5 text-success" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-destructive" />
          )}
          <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
        </div>
        <Activity className={cn("h-4 w-4", ok ? "text-success" : "text-destructive")} />
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span
          className={cn(
            "text-3xl font-bold tabular-nums",
            ok ? "text-success" : "text-destructive"
          )}
        >
          {display}%
        </span>
        <span className="text-xs text-muted-foreground">
          seuil 10%
        </span>
      </div>

      <div className="relative h-2 rounded-full bg-muted/50 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full",
            ok
              ? "bg-gradient-to-r from-success to-secondary"
              : "bg-gradient-to-r from-warning to-destructive"
          )}
        />
        <div
          className="absolute top-0 bottom-0 w-px bg-foreground/40"
          style={{ left: "50%" }}
          aria-hidden
        />
      </div>

      <p className={cn("mt-3 text-xs", ok ? "text-success/90" : "text-destructive/90")}>
        {ok ? "Vos jugements sont cohérents." : "Incohérence détectée — révisez vos comparaisons."}
      </p>
    </div>
  );
}
