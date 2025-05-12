import { HardDrive, Cpu, BookOpen, Code, FileText, BarChart3 } from "lucide-react"

export default function FeatureSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Key Features</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Our interactive platform helps you understand complex operating system concepts through visualization.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
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
          <div className="flex items-start gap-4 rounded-lg border p-6 shadow-sm">
            <HardDrive className="h-10 w-10 text-primary" />
            <div className="space-y-2">
              <h3 className="font-bold">Disk Scheduling Analyzer</h3>
              <p className="text-sm text-muted-foreground">
                Explore disk head movement with FCFS, SSTF, SCAN, and C-SCAN algorithms through dynamic visualizations
              </p>
            </div>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-2">
          <div className="flex items-start gap-4 rounded-lg border p-6 shadow-sm">
            <FileText className="h-10 w-10 text-primary" />
            <div className="space-y-2">
              <h3 className="font-bold">Comprehensive Notes</h3>
              <p className="text-sm text-muted-foreground">
                Detailed explanations of OS concepts with examples, diagrams, and implementations
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-lg border p-6 shadow-sm">
            <BarChart3 className="h-10 w-10 text-primary" />
            <div className="space-y-2">
              <h3 className="font-bold">Algorithm Comparison</h3>
              <p className="text-sm text-muted-foreground">
                Compare different algorithms side by side to understand their strengths and trade-offs
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
