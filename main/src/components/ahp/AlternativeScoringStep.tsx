import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PairwiseMatrix } from "./PairwiseMatrix";
import { ConsistencyGauge } from "./ConsistencyGauge";
import { useAHP } from "@/hooks/useAHP";

interface AlternativeScoringStepProps {
  ahp: ReturnType<typeof useAHP>;
}

export function AlternativeScoringStep({ ahp }: AlternativeScoringStepProps) {
  return (
    <Card className="glass-card p-4 md:p-6">
      <div className="mb-5">
        <h2 className="text-xl md:text-2xl font-bold">Notation des alternatives</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Pour chaque critère, comparez les alternatives deux à deux.
        </p>
      </div>

      <Tabs defaultValue="0" className="w-full">
        <TabsList className="w-full overflow-x-auto flex h-auto bg-muted/30 p-1 rounded-xl">
          {ahp.criteria.map((c, i) => (
            <TabsTrigger
              key={i}
              value={String(i)}
              className="flex-1 min-w-fit data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground"
            >
              {c}
            </TabsTrigger>
          ))}
        </TabsList>

        {ahp.criteria.map((c, i) => (
          <TabsContent key={i} value={String(i)} className="mt-5 space-y-4">
            <ConsistencyGauge
              CR={ahp.altResults[i]?.CR ?? 0}
              label={`Cohérence — ${c}`}
            />
            <PairwiseMatrix
              labels={ahp.alternatives}
              matrix={ahp.altMatrices[i]}
              onChange={(a, b, v) => ahp.updateAltCell(i, a, b, v)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}
