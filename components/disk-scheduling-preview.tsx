"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

export function DiskSchedulingPreview() {
  const [currentStep, setCurrentStep] = useState(0)
  const initialPosition = 53
  const requests = [98, 183, 37, 122, 14, 124, 65, 67]
  
  // Pre-calculated steps for SCAN algorithm preview
  const steps = [
    { position: initialPosition, request: 65, direction: "up" },
    { position: 65, request: 67, direction: "up" },
    { position: 67, request: 98, direction: "up" },
    { position: 98, request: 122, direction: "up" },
    { position: 122, request: 124, direction: "up" },
    { position: 124, request: 183, direction: "up" },
    { position: 183, request: 37, direction: "down" },
    { position: 37, request: 14, direction: "down" },
  ]

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setCurrentStep(0)
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Disk Scheduling</CardTitle>
          <Badge variant="outline">SCAN Preview</Badge>
        </div>
        <CardDescription>Visualize how different disk scheduling algorithms work</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Request Queue:</p>
          <div className="flex flex-wrap gap-2">
            {requests.map((request, index) => (
              <div
                key={index}
                className={`w-8 h-8 flex items-center justify-center rounded-md border ${
                  request === steps[currentStep].request ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {request}
              </div>
            ))}
          </div>
        </div>

        <div className="relative h-32 mb-4">
          <div className="absolute inset-x-0 top-1/2 h-1 bg-muted" />
          
          {/* Track positions */}
          {[0, 50, 100, 150, 199].map((position) => (
            <div
              key={position}
              className="absolute top-1/2 text-xs text-muted-foreground"
              style={{ left: `${(position / 199) * 100}%`, transform: "translate(-50%, 1rem)" }}
            >
              {position}
            </div>
          ))}

          {/* Head position */}
          <div
            className="absolute top-1/2 w-3 h-3 bg-primary rounded-full transition-all duration-500"
            style={{
              left: `${(steps[currentStep].position / 199) * 100}%`,
              transform: "translate(-50%, -50%)"
            }}
          />
        </div>

        <div className="text-sm">
          <p>
            <span className="font-medium">Current Position: </span>
            {steps[currentStep].position}
          </p>
          <p>
            <span className="font-medium">Direction: </span>
            {steps[currentStep].direction}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleNextStep}>
          Next Step
        </Button>
        <Button asChild>
          <Link href="/disk-scheduling" className="flex items-center">
            Explore More
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}