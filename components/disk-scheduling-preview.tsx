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
  
  // Calculate track positions based on unique positions from requests and initial position
  const trackPositions = Array.from(new Set([
    0, // Always show 0
    initialPosition,
    ...requests,
    199 // Always show max position
  ])).sort((a, b) => a - b)

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

  // Visualization dimensions - make them more responsive
  const margin = { left: 50, right: 30, top: 30, bottom: 30 }
  const width = 700  // Reduced width
  const height = 300 // Reduced height
  const timeScale = 5 // Time units per step

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Disk Scheduling</CardTitle>
            <Badge variant="outline">SCAN Preview</Badge>
          </div>
        </div>
        <CardDescription>
          Visualize and understand disk arm movement patterns in operating systems
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col">
        <div className="mb-4 shrink-0">
          <p className="text-sm font-medium mb-2">Request Queue:</p>
          <div className="flex flex-wrap gap-2">
            {requests.map((request, index) => (
              <div
                key={index}
                className={`w-7 h-7 flex items-center justify-center rounded-md border text-sm ${
                  request === steps[currentStep].request 
                    ? "bg-destructive text-destructive-foreground" 
                    : "bg-muted"
                }`}
              >
                {request}
              </div>
            ))}
          </div>
        </div>

        {/* Drawing area */}
        <div className="relative flex-1 min-h-0 w-full flex items-center justify-center">
          <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
            className="bg-background shadow-sm rounded-lg"
          >
            {/* Background grid lines */}
            {[...Array(11)].map((_, i) => (
              <line
                key={`grid-x-${i}`}
                x1={margin.left + (i * (width - margin.left - margin.right)) / 10}
                y1={margin.top + 30}
                x2={margin.left + (i * (width - margin.left - margin.right)) / 10}
                y2={height - margin.bottom}
                className="stroke-border"
                strokeWidth={1}
              />
            ))}

            {/* Time axis grid lines */}
            {[...Array(6)].map((_, i) => (
              <line
                key={`grid-y-${i}`}
                x1={margin.left}
                y1={margin.top + 30 + (i * (height - margin.top - margin.bottom - 30)) / 5}
                x2={width - margin.right}
                y2={margin.top + 30 + (i * (height - margin.top - margin.bottom - 30)) / 5}
                className="stroke-border"
                strokeWidth={1}
              />
            ))}

            {/* Time axis (horizontal) */}
            <line
              x1={margin.left}
              y1={margin.top + 15}
              x2={width - margin.right}
              y2={margin.top + 15}
              className="stroke-foreground"
              strokeWidth={2}
            />

            {/* Track axis (vertical) */}
            <line
              x1={margin.left}
              y1={margin.top + 30}
              x2={margin.left}
              y2={height - margin.bottom}
              className="stroke-foreground"
              strokeWidth={2}
            />

            {/* Y-axis labels (track positions) */}
            {[0, 50, 100, 150, 199].map((pos) => (
              <text
                key={pos}
                x={margin.left - 10}
                y={margin.top + ((height - margin.top - margin.bottom) * (1 - pos / 199))}
                textAnchor="end"
                className="text-xs fill-gray-500"
                dy=".35em"
              >
                {pos}
              </text>
            ))}

            {/* X-axis labels (time) */}
            {[...Array(11)].map((_, i) => (
              <text
                key={i}
                x={margin.left + (i * (width - margin.left - margin.right) / 10)}
                y={height - margin.bottom + 20}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {i * 5}
              </text>
            ))}

            {/* Time labels */}
            {[0, steps.length/2, steps.length].map((val, i) => (
              <text
                key={`time-${i}`}
                x={margin.left + ((width - margin.left - margin.right) * i) / 2}
                y={margin.top}
                className="text-xs fill-muted-foreground"
                textAnchor="middle"
              >
                Time: {Math.round(val)}
              </text>
            ))}

            {/* Track labels */}
            {[0, 50, 100, 150, 199].map((val, i) => (
              <g key={`track-${i}`}>
                <line
                  x1={margin.left - 5}
                  y1={margin.top + 30 + ((height - margin.top - margin.bottom - 30) * val) / 199}
                  x2={margin.left}
                  y2={margin.top + 30 + ((height - margin.top - margin.bottom - 30) * val) / 199}
                  className="stroke-foreground"
                  strokeWidth={2}
                />
                <text
                  x={margin.left - 10}
                  y={margin.top + 30 + ((height - margin.top - margin.bottom - 30) * val) / 199}
                  className="text-xs fill-foreground"
                  dominantBaseline="middle"
                  textAnchor="end"
                >
                  Track: {val}
                </text>
              </g>
            ))}

            {/* Starting point */}
            <circle
              cx={margin.left}
              cy={margin.top + 30 + ((height - margin.top - margin.bottom - 30) * initialPosition / 199)}
              r={4}
              className="fill-destructive"
            />
            <text
              x={margin.left + 15}
              y={margin.top + 30 + ((height - margin.top - margin.bottom - 30) * initialPosition / 199)}
              className="text-xs font-medium fill-destructive"
              dominantBaseline="middle"
            >
              Start: {initialPosition}
            </text>

            {/* Movement path */}
            <path
              d={steps
                .slice(0, currentStep + 1)
                .map((step, i) => {
                  const x1 = margin.left + ((width - margin.left - margin.right) * i) / (steps.length - 1)
                  const x2 = margin.left + ((width - margin.left - margin.right) * (i + 1)) / (steps.length - 1)
                  const y1 = margin.top + 30 + ((height - margin.top - margin.bottom - 30) * (i === 0 ? initialPosition : steps[i - 1].request) / 199)
                  const y2 = margin.top + 30 + ((height - margin.top - margin.bottom - 30) * step.request / 199)
                  return `${i === 0 ? 'M' : 'L'} ${x1} ${y1} L ${x2} ${y2}`
                })
                .join(' ')}
              className="stroke-destructive"
              strokeWidth={2}
              fill="none"
            />

            {/* Movement points */}
            {steps.slice(0, currentStep + 1).map((step, i) => {
              const x = margin.left + ((width - margin.left - margin.right) * (i + 1)) / (steps.length - 1)
              const y = margin.top + 30 + ((height - margin.top - margin.bottom - 30) * step.request / 199)
              return (
                <g key={`marker-${i}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r={4}
                    className="fill-destructive"
                  />
                  <text
                    x={x + 15}
                    y={y}
                    className="text-xs font-medium fill-destructive"
                    dominantBaseline="middle"
                  >
                    {step.request}
                  </text>
                </g>
              )
            })}

            {/* Labels */}
            <text x={margin.left} y={margin.top - 5} className="text-sm font-medium fill-gray-700">
              Track Position
            </text>
            <text 
              x={width - margin.right} 
              y={height - margin.bottom + 35} 
              textAnchor="end" 
              className="text-sm font-medium fill-gray-700"
            >
              Time
            </text>
          </svg>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm shrink-0">
          <div>
            <span className="font-medium">Algorithm: </span>
            SCAN
          </div>
          <div>
            <span className="font-medium">Current Position: </span>
            {currentStep > 0 ? steps[currentStep].request : initialPosition}
          </div>
          <div>
            <span className="font-medium">Direction: </span>
            {steps[currentStep].direction}
          </div>
          <div>
            <span className="font-medium">Progress: </span>
            {currentStep} / {steps.length} steps
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between shrink-0">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleNextStep}
          >
            Next Step
          </Button>
        </div>
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