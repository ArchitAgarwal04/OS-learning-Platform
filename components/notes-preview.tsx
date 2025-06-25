import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, HardDrive, Cpu, Layers } from "lucide-react"
import { trackNoteView } from "@/lib/analytics"

export default function NotesPreview() {
  const topics = [
    {
      title: "Memory Management",
      description: "Virtual memory, paging, segmentation, and address translation",
      icon: <HardDrive className="h-5 w-5" />,
      href: "/notes/memory-management",
    },
    {
      title: "Paging",
      description: "Page tables, TLB, and multi-level paging structures",
      icon: <Layers className="h-5 w-5" />,
      href: "/notes/paging",
    },
    {
      title: "Page Replacement",
      description: "FIFO, LRU, Optimal, and other page replacement algorithms",
      icon: <HardDrive className="h-5 w-5" />,
      href: "/notes/page-replacement",
    },
    {
      title: "CPU Scheduling",
      description: "FCFS, SJF, Round Robin, Priority, and multilevel queue scheduling",
      icon: <Cpu className="h-5 w-5" />,
      href: "/notes/cpu-scheduling",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Documentation</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Comprehensive Notes</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Clean, documentation-style notes with diagrams and concept highlights
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {topics.map((topic, index) => (
            <Card key={index} className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-2">
                  {topic.icon}
                  <CardTitle className="text-lg">{topic.title}</CardTitle>
                </div>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="h-32 bg-muted rounded-md flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-muted-foreground/50" />
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="w-full">
                  <Link href={topic.href} className="flex items-center justify-between">
                    <span>Read Notes</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Button asChild size="lg">
            <Link href="/notes">
              Browse All Notes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
