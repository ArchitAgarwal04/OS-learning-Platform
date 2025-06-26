import Link from "next/link"
import { Cpu, Github, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full border-t py-6">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-primary" />
          <span className="font-semibold">OSimulate</span>
        </div>
        <nav className="flex gap-4 sm:gap-6">
          <Link href="/page-replacement" className="text-xs hover:underline underline-offset-4">
            Page Replacement
          </Link>
          <Link href="/cpu-scheduling" className="text-xs hover:underline underline-offset-4">
            CPU Scheduling
          </Link>
          <Link href="/disk-scheduling" className="text-xs hover:underline underline-offset-4">
            Disk Scheduling
          </Link>
          <Link href="/notes" className="text-xs hover:underline underline-offset-4">
            Notes
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="https://github.com/OSimulate/OSimulate"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}
