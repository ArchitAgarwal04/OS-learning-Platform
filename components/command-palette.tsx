"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  const pages = [
    {
      heading: "Visualizers",
      items: [
        {
          title: "Page Replacement",
          href: "/page-replacement",
          description: "FIFO, LRU, and Optimal page replacement algorithms",
          keywords: "page replacement memory management frames",
        },
        {
          title: "CPU Scheduling",
          href: "/cpu-scheduling",
          description: "FCFS, SJF, and Round Robin scheduling algorithms",
          keywords: "cpu scheduling process fcfs sjf rr round robin",
        },
        {
          title: "Disk Scheduling",
          href: "/disk-scheduling",
          description: "FCFS, SSTF, SCAN, and C-SCAN disk scheduling algorithms",
          keywords: "disk scheduling io head seek track cylinder elevator",
        },
      ],
    },
    {
      heading: "Notes",
      items: [
        {
          title: "Memory Management",
          href: "/notes/memory-management",
          description: "Virtual memory, paging, and memory allocation",
        },
        {
          title: "CPU Scheduling",
          href: "/notes/cpu-scheduling",
          description: "Process scheduling algorithms and concepts",
        },
        {
          title: "Page Replacement",
          href: "/notes/page-replacement",
          description: "Page replacement algorithms and page faults",
        },
        {
          title: "Disk Scheduling",
          href: "/notes/disk-scheduling",
          description: "Disk scheduling algorithms and seek optimization",
        },
      ],
    },
    {
      heading: "Tools",
      items: [
        {
          title: "Algorithm Comparison",
          href: "/comparison",
          description: "Compare different algorithms side by side",
        },
      ],
    },
  ]

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">Search documentation...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem onSelect={() => runCommand(() => router.push("/"))}>Home</CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/page-replacement"))}>
              Page Replacement
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/cpu-scheduling"))}>CPU Scheduling</CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/disk-scheduling"))}>Disk Scheduling</CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/notes"))}>Notes</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Notes">
            <CommandItem onSelect={() => runCommand(() => router.push("/notes/cpu-scheduling"))}>
              CPU Scheduling Notes
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/notes/deadlocks"))}>Deadlocks Notes</CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/notes/file-management"))}>
              File Management Notes
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/notes/memory-management"))}>
              Memory Management Notes
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/notes/page-replacement"))}>
              Page Replacement Notes
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/notes/disk-scheduling"))}>
              Disk Scheduling Notes
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/notes/process-management"))}>
              Process Management Notes
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Algorithms">
            <CommandItem onSelect={() => runCommand(() => router.push("/page-replacement?tab=fifo"))}>
              FIFO Algorithm
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/page-replacement?tab=lru"))}>
              LRU Algorithm
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/page-replacement?tab=optimal"))}>
              Optimal Algorithm
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/cpu-scheduling?tab=fcfs"))}>
              FCFS Algorithm
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/cpu-scheduling?tab=sjf"))}>
              SJF Algorithm
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/cpu-scheduling?tab=rr"))}>
              Round Robin Algorithm
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
