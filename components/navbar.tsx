"use client"

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"
import { CommandPalette } from "./command-palette"
import { Menu, X, Cpu, HardDrive, BookOpen, Home, ChevronDown, BarChart3, Layers, FileText, LogOut, User, Crown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, signOut } = useAuth()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleSignOut = async () => {
    await signOut()
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
                    <span>Comparison</span>
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
          {/* Premium Link - COMMENTED OUT FOR TESTING */}
          {/* 
          <Link href="/payment" className="text-sm font-medium hover:text-primary transition-colors">
            Premium
          </Link>
          */}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <CommandPalette />
          </div>
          <ModeToggle />
           {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="outline" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}

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
            {/* Premium Link - COMMENTED OUT FOR TESTING */}
            {/*
            <Link
              href="/payment"
              className="flex items-center gap-2 p-2 hover:bg-muted rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              <Crown className="h-5 w-5" />
              <span>Premium</span>
            </Link>
            */}
             {user ? (
              <button
                onClick={() => {
                  handleSignOut()
                  setIsMenuOpen(false)
                }}
                className="flex items-center gap-2 p-2 hover:bg-muted rounded-md transition-colors text-left w-full"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <Button variant="outline" asChild>
                  <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}