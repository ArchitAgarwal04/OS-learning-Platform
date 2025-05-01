import { HardDrive, Cpu, BookOpen, Code } from "lucide-react"

export default function FeatureSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
              Interactive Learning
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Visualize Complex OS Concepts</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Transform abstract operating system concepts into intuitive visual experiences
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
          <div className="grid gap-6">
            <div className="flex items-start gap-4 rounded-lg border p-6 shadow-sm">
              <HardDrive className="h-10 w-10 text-primary" />
              <div className="space-y-2">
                <h3 className="font-bold">Page Replacement Visualizer</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize FIFO, LRU, Optimal, and other page replacement algorithms with step-by-step animations
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg border p-6 shadow-sm">
              <Cpu className="h-10 w-10 text-primary" />
              <div className="space-y-2">
                <h3 className="font-bold">CPU Scheduling Simulator</h3>
                <p className="text-sm text-muted-foreground">
                  Interactive Gantt charts for FCFS, SJF, Round Robin, and other scheduling algorithms
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-6">
            <div className="flex items-start gap-4 rounded-lg border p-6 shadow-sm">
              <Code className="h-10 w-10 text-primary" />
              <div className="space-y-2">
                <h3 className="font-bold">Algorithm Implementation</h3>
                <p className="text-sm text-muted-foreground">
                  See the code behind each algorithm with syntax highlighting and explanations
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg border p-6 shadow-sm">
              <BookOpen className="h-10 w-10 text-primary" />
              <div className="space-y-2">
                <h3 className="font-bold">Comprehensive Notes</h3>
                <p className="text-sm text-muted-foreground">
                  Clean, documentation-style notes with diagrams and concept highlights
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
