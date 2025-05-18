"use client"

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"
import { CommandPalette } from "./command-palette"
import { Menu, X, Cpu, HardDrive, BookOpen, Home, ChevronDown, BarChart3, Layers, FileText } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [scrolled])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
          : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Cpu className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl hidden md:inline-block">OSimulate</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1 h-9 px-2">
                <span className="text-sm font-medium">Visualizers</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/page-replacement" className="flex items-center gap-2 cursor-pointer">
                    <HardDrive className="h-4 w-4" />
                    <span>Page Replacement</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/cpu-scheduling" className="flex items-center gap-2 cursor-pointer">
                    <Cpu className="h-4 w-4" />
                    <span>CPU Scheduling</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/disk-scheduling" className="flex items-center gap-2 cursor-pointer">
                    <HardDrive className="h-4 w-4" />
                    <span>Disk Scheduling</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/comparison" className="flex items-center gap-2 cursor-pointer">
                    <BarChart3 className="h-4 w-4" />
                    <span>Algorithm Comparison</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1 h-9 px-2">
                <span className="text-sm font-medium">Notes</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/notes/memory-management" className="flex items-center gap-2 cursor-pointer">
                    <Layers className="h-4 w-4" />
                    <span>Memory Management</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/notes/cpu-scheduling" className="flex items-center gap-2 cursor-pointer">
                    <Cpu className="h-4 w-4" />
                    <span>CPU Scheduling</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/notes/page-replacement" className="flex items-center gap-2 cursor-pointer">
                    <HardDrive className="h-4 w-4" />
                    <span>Page Replacement</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/notes/disk-scheduling" className="flex items-center gap-2 cursor-pointer">
                    <HardDrive className="h-4 w-4" />
                    <span>Disk Scheduling</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/notes" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="h-4 w-4" />
                    <span>All Notes</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <CommandPalette />
          </div>
          <ModeToggle />
          <Button asChild className="hidden md:inline-flex">
            <Link href="/dashboard">Start Learning</Link>
          </Button>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 flex flex-col gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 p-2 hover:bg-muted rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link
              href="/page-replacement"
              className="flex items-center gap-2 p-2 hover:bg-muted rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              <HardDrive className="h-5 w-5" />
              <span>Page Replacement</span>
            </Link>
            <Link
              href="/cpu-scheduling"
              className="flex items-center gap-2 p-2 hover:bg-muted rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              <Cpu className="h-5 w-5" />
              <span>CPU Scheduling</span>
            </Link>
            <Link
              href="/disk-scheduling"
              className="flex items-center gap-2 p-2 hover:bg-muted rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              <HardDrive className="h-5 w-5" />
              <span>Disk Scheduling</span>
            </Link>
            <Link
              href="/comparison"
              className="flex items-center gap-2 p-2 hover:bg-muted rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Algorithm Comparison</span>
            </Link>
            <Link
              href="/notes"
              className="flex items-center gap-2 p-2 hover:bg-muted rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              <BookOpen className="h-5 w-5" />
              <span>Notes</span>
            </Link>
            <Button asChild className="mt-2">
              <Link href="/page-replacement" onClick={() => setIsMenuOpen(false)}>
                Start Learning
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
