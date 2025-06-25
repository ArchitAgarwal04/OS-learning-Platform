"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function Hero() {
  const { user } = useAuth()
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-float"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full filter blur-3xl opacity-50 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2 animate-slide-up">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none gradient-text">
              Operating Systems, Visualized
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
              Shift from theory-heavy content to interactive, visual-first learning. Understand complex OS concepts
              through dynamic visualizations and real-life analogies.
            </p>
          </div>
          <div className="space-x-4 mt-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            {user ? (
              <>
                <Button asChild size="lg" className="group gradient-border">
                  <Link href="/dashboard">
                    Continue Learning
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/notes">Explore Notes</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="group gradient-border">
                  <Link href="/auth/signup">
                    Start Learning Visually
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
              </>
            )}
          </div>

          {/* Feature highlights */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 w-full max-w-4xl animate-slide-up stagger-animation"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50 backdrop-blur-sm">
              <div className="text-3xl font-bold text-primary">10+</div>
              <div className="text-sm text-muted-foreground">Algorithms</div>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50 backdrop-blur-sm">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Interactive</div>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50 backdrop-blur-sm">
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Accessibility</div>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50 backdrop-blur-sm">
              <div className="text-3xl font-bold text-primary">∞</div>
              <div className="text-sm text-muted-foreground">Possibilities</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
