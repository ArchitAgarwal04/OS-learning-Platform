import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, HardDrive, Cpu, Layers, FileText, Database, Network } from "lucide-react"

export default function NotesPage() {
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
    {
      title: "Disk Scheduling",
      description: "FCFS, SSTF, SCAN, C-SCAN disk scheduling algorithms",
      icon: <HardDrive className="h-5 w-5" />,
      href: "/notes/disk-scheduling",
    },
    {
      title: "Process Management",
      description: "Process states, PCB, context switching, and process creation",
      icon: <FileText className="h-5 w-5" />,
      href: "/notes/process-management",
    },
    {
      title: "File Systems",
      description: "File allocation methods, directory structures, and file operations",
      icon: <Database className="h-5 w-5" />,
      href: "/notes/file-systems",
    },
    {
      title: "Deadlocks",
      description: "Deadlock prevention, avoidance, detection, and recovery",
      icon: <Network className="h-5 w-5" />,
      href: "/notes/deadlocks",
    },
    {
      title: "Synchronization",
      description: "Semaphores, mutexes, monitors, and critical sections",
      icon: <Network className="h-5 w-5" />,
      href: "/notes/synchronization",
    },
  ]

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-6">OS Concept Notes</h1>
      <p className="text-lg text-muted-foreground mb-12">
        Comprehensive notes on operating system concepts with diagrams and examples.
      </p>

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
                <FileText className="h-10 w-10 text-muted-foreground/50" />
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
    </div>
  )
}
