"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

export function PageReplacementPreview() {
  const [currentStep, setCurrentStep] = useState(0)

  // Sample FIFO visualization data
  const referenceString = [1, 3, 0, 3, 5, 6, 3]
  const frames = 3
  const steps = [
    { frames: [1, "-", "-"], pageFault: true },
    { frames: [1, 3, "-"], pageFault: true },
    { frames: [1, 3, 0], pageFault: true },
    { frames: [1, 3, 0], pageFault: false },
    { frames: [5, 3, 0], pageFault: true },
    { frames: [5, 6, 0], pageFault: true },
    { frames: [5, 6, 3], pageFault: true },
  ]

  const handleNextStep = () => {
    setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : 0))
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Page Replacement</CardTitle>
          <Badge variant="outline">FIFO Preview</Badge>
        </div>
        <CardDescription>Visualize how different page replacement algorithms work</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Reference String:</p>
          <div className="flex flex-wrap gap-2">
            {referenceString.map((page, index) => (
              <div
                key={index}
                className={`w-8 h-8 flex items-center justify-center rounded-md border ${
                  index === currentStep ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {page}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium mb-2">Memory Frames:</p>
          <div className="space-y-2">
            {steps[currentStep].frames.map((frame, index) => (
              <div
                key={index}
                className={`h-10 flex items-center justify-center rounded-md border ${
                  frame === referenceString[currentStep] ? "border-primary border-2" : ""
                }`}
              >
                {frame !== "-" ? frame : ""}
              </div>
            ))}
          </div>

          <div className="mt-4 text-sm">
            <span className="font-medium">Status: </span>
            {steps[currentStep].pageFault ? (
              <span className="text-red-500 dark:text-red-400">Page Fault</span>
            ) : (
              <span className="text-green-500 dark:text-green-400">Page Hit</span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleNextStep}>
          Next Step
        </Button>
        <Button asChild>
          <Link href="/page-replacement" className="flex items-center">
            Explore More
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
