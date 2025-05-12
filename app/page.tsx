import Hero from "@/components/hero"
import FeatureSection from "@/components/feature-section"
import { PageReplacementPreview } from "@/components/page-replacement-preview"
import { CPUSchedulingPreview } from "@/components/cpu-scheduling-preview"
import { DiskSchedulingPreview } from "@/components/disk-scheduling-preview"
import NotesPreview from "@/components/notes-preview"
import { AlgorithmComparison } from "@/components/algorithm-comparison"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <FeatureSection />

      <section className="py-16 px-4 md:px-6 lg:px-8 bg-muted/50">
        <div className="container mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              <span>Interactive Learning</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl gradient-text">
              Featured Visualizations
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              Explore our interactive visualizations to understand complex OS concepts
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <PageReplacementPreview />
            <CPUSchedulingPreview />
            <DiskSchedulingPreview />
          </div>

          <div className="mt-12 text-center">
            <Button asChild size="lg">
              <Link href="/comparison" className="flex items-center">
                Compare All Algorithms
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto">
          <AlgorithmComparison />
        </div>
      </section>

      <NotesPreview />
    </div>
  )
}
