import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Target, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SetupStepProps {
  criteria: string[];
  alternatives: string[];
  onCriteriaChange: (next: string[]) => void;
  onAlternativesChange: (next: string[]) => void;
}

function ItemList({
  title,
  icon,
  items,
  onChange,
  min,
  max,
  placeholder,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  onChange: (next: string[]) => void;
  min: number;
  max: number;
  placeholder: string;
}) {
  const update = (idx: number, value: string) => {
    const next = [...items];
    next[idx] = value;
    onChange(next);
  };
  const add = () => items.length < max && onChange([...items, `${placeholder} ${items.length + 1}`]);
  const remove = (idx: number) =>
    items.length > min && onChange(items.filter((_, i) => i !== idx));

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-elegant">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-xs text-muted-foreground">
              {items.length} élément{items.length > 1 ? "s" : ""} · min {min}, max {max}
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={add}
          disabled={items.length >= max}
          className="bg-gradient-primary hover:opacity-90 border-0"
        >
          <Plus className="h-4 w-4 mr-1" /> Ajouter
        </Button>
      </div>

      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {items.map((item, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-2"
            >
              <Label className="text-xs text-muted-foreground w-6 text-center">{idx + 1}</Label>
              <Input
                value={item}
                onChange={(e) => update(idx, e.target.value)}
                className="bg-muted/30 border-border/50 focus-visible:ring-primary"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => remove(idx)}
                disabled={items.length <= min}
                className="text-muted-foreground hover:text-destructive shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </Card>
  );
}

export function SetupStep({
  criteria,
  alternatives,
  onCriteriaChange,
  onAlternativesChange,
}: SetupStepProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <ItemList
        title="Critères"
        icon={<Target className="h-5 w-5" />}
        items={criteria}
        onChange={onCriteriaChange}
        min={2}
        max={6}
        placeholder="Critère"
      />
      <ItemList
        title="Alternatives"
        icon={<Layers className="h-5 w-5" />}
        items={alternatives}
        onChange={onAlternativesChange}
        min={2}
        max={6}
        placeholder="Option"
      />
    </div>
  );
}
