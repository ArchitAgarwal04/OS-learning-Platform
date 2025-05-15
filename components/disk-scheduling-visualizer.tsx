"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Play, Pause, RotateCcw } from "lucide-react"

interface DiskRequest {
  trackNumber: number
}

interface Step {
  from: number
  to: number
  time: number
}

interface DiskSchedulingVisualizerProps {
  algorithm: "fcfs" | "sstf" | "scan" | "cscan"
}

export function DiskSchedulingVisualizer({ algorithm }: DiskSchedulingVisualizerProps) {
  const [trackSize, setTrackSize] = useState(50)
  const [startingTrack, setStartingTrack] = useState(10)
  const [spinDirection, setSpinDirection] = useState("left-to-right")
  const [seekPositions, setSeekPositions] = useState("16, 1, 15, 18, 1, 3, 6, 10")
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [schedule, setSchedule] = useState<Step[]>([])
  const [totalSeekTime, setTotalSeekTime] = useState(0)

  // Visualization dimensions
  const margin = { left: 60, right: 40, top: 30, bottom: 40 }
  const width = 800  // Increased from 500
  const height = 400 // Increased from 300

  const generateRandomPositions = () => {
    const count = 8
    const positions = Array.from({ length: count }, () => 
      Math.floor(Math.random() * trackSize)
    )
    setSeekPositions(positions.join(", "))
  }

  // Calculate total seek time
  const calculateSeekTime = (steps: Step[]) => {
    return steps.reduce((total, step) => total + Math.abs(step.to - step.from), 0)
  }

  // Implement different scheduling algorithms
  const fcfs = (requests: number[]) => {
    let result: Step[] = []
    let current = startingTrack
    let time = 0

    requests.forEach(req => {
      result.push({ from: current, to: req, time: time++ })
      current = req
    })

    return result
  }

  const sstf = (requests: number[]) => {
    let result: Step[] = []
    let current = startingTrack
    let remaining = [...requests]
    let time = 0

    while (remaining.length > 0) {
      const closest = remaining.reduce((prev, curr) => 
        Math.abs(curr - current) < Math.abs(prev - current) ? curr : prev
      )
      result.push({ from: current, to: closest, time: time++ })
      current = closest
      remaining.splice(remaining.indexOf(closest), 1)
    }

    return result
  }

  const scan = (requests: number[]) => {
    let result: Step[] = []
    let current = startingTrack
    let time = 0
    let direction = spinDirection === "left-to-right" ? 1 : -1
    let remaining = [...requests].sort((a, b) => a - b)

    if (direction === 1) {
      // Move up
      while (remaining.length > 0 && Math.max(...remaining) >= current) {
        const next = remaining.find(r => r >= current)
        if (next !== undefined) {
          result.push({ from: current, to: next, time: time++ })
          current = next
          remaining.splice(remaining.indexOf(next), 1)
        }
      }
      // Move down
      if (remaining.length > 0) {
        result.push({ from: current, to: trackSize - 1, time: time++ })
        current = trackSize - 1
        remaining.reverse().forEach(req => {
          result.push({ from: current, to: req, time: time++ })
          current = req
        })
      }
    } else {
      // Similar logic for right-to-left
      while (remaining.length > 0 && Math.min(...remaining) <= current) {
        const next = remaining.findLast(r => r <= current)
        if (next !== undefined) {
          result.push({ from: current, to: next, time: time++ })
          current = next
          remaining.splice(remaining.indexOf(next), 1)
        }
      }
      if (remaining.length > 0) {
        result.push({ from: current, to: 0, time: time++ })
        current = 0
        remaining.forEach(req => {
          result.push({ from: current, to: req, time: time++ })
          current = req
        })
      }
    }

    return result
  }

  const runSimulation = () => {
    const requests = seekPositions.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n))
    let result: Step[] = []

    switch (algorithm) {
      case "fcfs":
        result = fcfs(requests)
        break
      case "sstf":
        result = sstf(requests)
        break
      case "scan":
        result = scan(requests)
        break
      default:
        result = fcfs(requests)
    }

    setSchedule(result)
    setTotalSeekTime(calculateSeekTime(result))
    setCurrentStep(0)
    setIsPlaying(true)
    setIsPaused(false)
  }

  // Animation effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying && !isPaused && currentStep < schedule.length) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < schedule.length - 1) return prev + 1
          setIsPlaying(false)
          return prev
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isPlaying, isPaused, currentStep, schedule.length])

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 max-w-[1200px] mx-auto">
      {/* Left Panel - Controls */}
      <Card className="w-full lg:w-[300px] p-4">
        <div className="space-y-4">
          <div>
            <Label>Track size</Label>
            <Input
              type="number"
              min={10}
              value={trackSize}
              onChange={(e) => setTrackSize(parseInt(e.target.value) || 10)}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Starting track</Label>
            <Input
              type="number"
              min={0}
              max={trackSize-1}
              value={startingTrack}
              onChange={(e) => setStartingTrack(parseInt(e.target.value) || 0)}
              className="mt-1"
            />
          </div>

          {/* Only show spin direction for SCAN algorithm */}
          {algorithm === "scan" && (
            <div>
              <Label>Spin direction</Label>
              <RadioGroup
                value={spinDirection}
                onValueChange={setSpinDirection}
                className="mt-2 space-y-2"
              >
                <div className="flex items-center">
                  <RadioGroupItem value="left-to-right" id="left" />
                  <Label htmlFor="left" className="ml-2">Left to right</Label>
                </div>
                <div className="flex items-center">
                  <RadioGroupItem value="right-to-left" id="right" />
                  <Label htmlFor="right" className="ml-2">Right to left</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div>
            <Label>Seek Positions</Label>
            <Input
              value={seekPositions}
              onChange={(e) => setSeekPositions(e.target.value)}
              className="mt-1 font-mono text-sm"
              placeholder="Enter comma-separated numbers"
            />
            <div className="flex gap-2 mt-2">
              <Button className="flex-1" onClick={runSimulation}>
                Apply
              </Button>
              <Button variant="outline" className="flex-1" onClick={generateRandomPositions}>
                Random
              </Button>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={isPlaying && !isPaused ? "secondary" : "outline"}
                onClick={() => {
                  setIsPlaying(true)
                  setIsPaused(false)
                }}
                className="w-full"
              >
                {isPlaying && !isPaused ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span className="ml-2">{isPlaying && !isPaused ? "Pause" : "Start"}</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentStep(0)
                  setIsPlaying(false)
                  setIsPaused(false)
                }}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="ml-2">Reset</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Right Panel - Visualization */}
      <div className="flex-1 space-y-4">
        <Card className="p-6">
          <div className="font-medium text-lg mb-6">Disk Movement Visualization</div>
          <div className="overflow-x-auto">
            <svg width={width} height={height} className="bg-background mx-auto shadow-sm rounded-lg">
              {/* Background grid lines */}
              {Array.from({ length: 11 }).map((_, i) => (
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
              {Array.from({ length: 6 }).map((_, i) => (
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

              {/* Time labels */}
              {[0, schedule.length/2, schedule.length].map((val, i) => (
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
              {[0, trackSize/4, trackSize/2, (trackSize*3)/4, trackSize].map((val, i) => (
                <g key={`track-${i}`}>
                  <line
                    x1={margin.left - 5}
                    y1={margin.top + 30 + ((height - margin.top - margin.bottom - 30) * val) / trackSize}
                    x2={margin.left}
                    y2={margin.top + 30 + ((height - margin.top - margin.bottom - 30) * val) / trackSize}
                    className="stroke-foreground"
                    strokeWidth={2}
                  />
                  <text
                    x={margin.left - 10}
                    y={margin.top + 30 + ((height - margin.top - margin.bottom - 30) * val) / trackSize}
                    className="text-xs fill-foreground"
                    dominantBaseline="middle"
                    textAnchor="end"
                  >
                    Track: {Math.round(val)}
                  </text>
                </g>
              ))}

              {/* Movement path and markers */}
              {schedule.length > 0 && (
                <g>
                  {/* Path */}
                  <path
                    d={schedule
                      .slice(0, currentStep + 1)
                      .map((move, i) => {
                        const x1 = margin.left + ((width - margin.left - margin.right) * move.time) / Math.max(schedule.length - 1, 1)
                        const x2 = margin.left + ((width - margin.left - margin.right) * (move.time + 1)) / Math.max(schedule.length - 1, 1)
                        const y1 = margin.top + 30 + ((height - margin.top - margin.bottom - 30) * move.from / trackSize)
                        const y2 = margin.top + 30 + ((height - margin.top - margin.bottom - 30) * move.to / trackSize)
                        return `${i === 0 ? 'M' : 'L'} ${x1} ${y1} L ${x2} ${y2}`
                      })
                      .join(" ")}
                    className="stroke-destructive"
                    strokeWidth={2}
                    fill="none"
                  />

                  {/* Starting point */}
                  <circle
                    cx={margin.left}
                    cy={margin.top + 30 + ((height - margin.top - margin.bottom - 30) * startingTrack / trackSize)}
                    r={4}
                    className="fill-destructive"
                  />
                  <text
                    x={margin.left + 15}
                    y={margin.top + 30 + ((height - margin.top - margin.bottom - 30) * startingTrack / trackSize)}
                    className="text-xs font-medium fill-destructive"
                    dominantBaseline="middle"
                  >
                    Start: {startingTrack}
                  </text>

                  {/* Movement points */}
                  {schedule.slice(0, currentStep + 1).map((move, i) => {
                    const x = margin.left + ((width - margin.left - margin.right) * (move.time + 1)) / Math.max(schedule.length - 1, 1)
                    const y = margin.top + 30 + ((height - margin.top - margin.bottom - 30) * move.to / trackSize)
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
                          {move.to}
                        </text>
                      </g>
                    )
                  })}
                </g>
              )}
            </svg>
          </div>
        </Card>

        <Card className="p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Algorithm: </span>
              {algorithm.toUpperCase()}
            </div>
            <div>
              <span className="font-medium">Current Position: </span>
              {currentStep < schedule.length ? schedule[currentStep].to : startingTrack}
            </div>
            <div>
              <span className="font-medium">Total Seek Time: </span>
              {totalSeekTime} tracks
            </div>
            <div>
              <span className="font-medium">Progress: </span>
              {currentStep} / {schedule.length} steps
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}