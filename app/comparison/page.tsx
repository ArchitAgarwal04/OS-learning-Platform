import { AlgorithmComparison } from "@/components/algorithm-comparison"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default function ComparisonPage() {
  return (
    <div className="container py-10">
      <Breadcrumbs items={[{ label: "Comparison", href: "/comparison", active: true }]} />

      <h1 className="text-4xl font-bold mb-6 gradient-text">Algorithm Comparison</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Compare the performance of different algorithms side by side to understand their strengths and weaknesses.
      </p>

      <div className="grid gap-8">
        <AlgorithmComparison />
      </div>
    </div>
  )
}
