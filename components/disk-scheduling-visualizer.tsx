"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, Play, Pause, RotateCcw } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface DiskRequest {
  trackNumber: number
  color?: string
}

const MAX_TRACK = 199

export function DiskSchedulingVisualizer({ algorithm = "fcfs" }) {
  const [referenceString, setReferenceString] = useState("98 183 37 122 14 124 65 67")
  const [requests, setRequests] = useState<DiskRequest[]>([])
  const [initialHeadPosition, setInitialHeadPosition] = useState(53)
  const [currentHeadPosition, setCurrentHeadPosition] = useState(53)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const [schedule, setSchedule] = useState<{ from: number; to: number }[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSeekTime, setTotalSeekTime] = useState(0)

  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-orange-500",
  ]

  // Parse reference string into requests
  const parseReferenceString = () => {
    const numbers = referenceString.split(/\s+/).map(num => parseInt(num.trim())).filter(num => !isNaN(num))
    const newRequests: DiskRequest[] = numbers.map((num, index) => ({
      trackNumber: Math.min(Math.max(0, num), MAX_TRACK),
      color: colors[index % colors.length]
    }))
    setRequests(newRequests)
  }

  // Update reference string
  const updateReferenceString = (value: string) => {
    setReferenceString(value)
  }

  // Effect to parse reference string on change
  useEffect(() => {
    parseReferenceString()
  }, [referenceString])

  // Run the selected algorithm
  const runSimulation = () => {
    let result: { from: number; to: number }[] = []
    let current = initialHeadPosition
    let total = 0

    if (algorithm === "fcfs") {
      result = requests.map((req) => {
        const move = { from: current, to: req.trackNumber }
        total += Math.abs(req.trackNumber - current)
        current = req.trackNumber
        return move
      })
    } else if (algorithm === "sstf") {
      const remaining = [...requests]
      
      while (remaining.length > 0) {
        const closest = remaining.reduce((prev, curr) => {
          const prevDist = Math.abs(prev.trackNumber - current)
          const currDist = Math.abs(curr.trackNumber - current)
          return currDist < prevDist ? curr : prev
        })
        
        result.push({ from: current, to: closest.trackNumber })
        total += Math.abs(closest.trackNumber - current)
        current = closest.trackNumber
        remaining.splice(remaining.indexOf(closest), 1)
      }
    } else if (algorithm === "scan") {
      const remaining = [...requests]
      let direction = 1
      
      if (current > MAX_TRACK / 2) {
        direction = -1
      }
      
      while (remaining.length > 0) {
        let nextRequest = direction === 1
          ? remaining.filter(r => r.trackNumber >= current).sort((a, b) => a.trackNumber - b.trackNumber)[0]
          : remaining.filter(r => r.trackNumber <= current).sort((a, b) => b.trackNumber - a.trackNumber)[0]
        
        if (!nextRequest) {
          if (direction === 1) {
            if (remaining.some(r => r.trackNumber < current)) {
              result.push({ from: current, to: MAX_TRACK })
              total += Math.abs(MAX_TRACK - current)
              current = MAX_TRACK
              direction = -1
            }
          } else {
            if (remaining.some(r => r.trackNumber > current)) {
              result.push({ from: current, to: 0 })
              total += Math.abs(current)
              current = 0
              direction = 1
            }
          }
          continue
        }
        
        result.push({ from: current, to: nextRequest.trackNumber })
        total += Math.abs(nextRequest.trackNumber - current)
        current = nextRequest.trackNumber
        remaining.splice(remaining.indexOf(nextRequest), 1)
      }
    }

    setSchedule(result)
    setTotalSeekTime(total)
    setCurrentHeadPosition(initialHeadPosition)
    setCurrentStep(0)
    setIsPlaying(false)
  }

  const goToNextStep = () => {
    if (currentStep < schedule.length) {
      setCurrentStep(currentStep + 1)
      setCurrentHeadPosition(schedule[currentStep]?.to || currentHeadPosition)
    }
  }

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setCurrentHeadPosition(schedule[currentStep - 1]?.to || initialHeadPosition)
    }
  }

  const resetSimulation = () => {
    setCurrentStep(0)
    setCurrentHeadPosition(initialHeadPosition)
    setIsPlaying(false)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying && currentStep < schedule.length) {
      interval = setInterval(() => {
        goToNextStep()
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isPlaying, currentStep, schedule.length])

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="referenceString">Reference String (space-separated track numbers)</Label>
          <Textarea
            id="referenceString"
            placeholder="Enter track numbers separated by spaces (e.g., 98 183 37 122)"
            value={referenceString}
            onChange={(e) => updateReferenceString(e.target.value)}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Track numbers will be clamped between 0 and {MAX_TRACK}
          </p>
        </div>

        <div>
          <Label htmlFor="initialHead">Initial Head Position</Label>
          <Input
            id="initialHead"
            type="number"
            min={0}
            max={MAX_TRACK}
            value={initialHeadPosition}
            onChange={(e) => setInitialHeadPosition(parseInt(e.target.value) || 0)}
            className="mt-1"
          />
        </div>

        <Button onClick={runSimulation} className="w-full">
          Run Simulation
        </Button>
      </div>

      {schedule.length > 0 && (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium mb-2">Disk Movement Path:</p>
            <div className="relative h-80 border rounded-md overflow-hidden bg-gray-100 dark:bg-gray-900 p-4">
              <div className="absolute left-2 top-0 bottom-0 w-12 flex flex-col justify-between text-xs">
                {Array.from({ length: 11 }).map((_, i) => (
                  <span key={i}>{Math.round((MAX_TRACK / 10) * (10 - i))}</span>
                ))}
              </div>

              <div className="absolute left-16 right-4 top-0 bottom-0">
                <div className="absolute inset-0">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-full h-px bg-gray-200 dark:bg-gray-800"
                      style={{ top: `${(i * 100) / 10}%` }}
                    />
                  ))}
                </div>

                <svg className="absolute inset-0" preserveAspectRatio="none">
                  {schedule.slice(0, currentStep).map((move, i) => {
                    const startX = (i / (schedule.length - 1)) * 100
                    const endX = ((i + 1) / (schedule.length - 1)) * 100
                    const startY = 100 - (move.from / MAX_TRACK) * 100
                    const endY = 100 - (move.to / MAX_TRACK) * 100

                    return (
                      <line
                        key={i}
                        x1={`${startX}%`}
                        y1={`${startY}%`}
                        x2={`${endX}%`}
                        y2={`${endY}%`}
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-red-500"
                      />
                    )
                  })}
                </svg>

                {requests.map((req, index) => (
                  <div
                    key={index}
                    className={`absolute w-3 h-3 rounded-full ${req.color} transition-opacity -translate-x-1.5`}
                    style={{
                      top: `${100 - (req.trackNumber / MAX_TRACK) * 100}%`,
                      left: `${(index / (requests.length - 1)) * 100}%`,
                      opacity: req.trackNumber === currentHeadPosition ? 0.5 : 1,
                    }}
                  />
                ))}

                <div
                  className="absolute w-4 h-4 bg-red-500 rounded-full -translate-x-2 -translate-y-2"
                  style={{
                    top: `${100 - (currentHeadPosition / MAX_TRACK) * 100}%`,
                    left: `${(currentStep / Math.max(1, schedule.length - 1)) * 100}%`,
                  }}
                />
              </div>

              <div className="absolute left-16 right-4 -bottom-6 flex justify-between text-xs">
                <span>0</span>
                <span>Time</span>
                <span>{schedule.length}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-sm font-medium mb-2">Current Status:</p>
              <p>
                <span className="font-medium">Head Position:</span> {currentHeadPosition}
              </p>
              <p>
                <span className="font-medium">Total Seek Time:</span> {totalSeekTime} tracks
              </p>
              <p>
                <span className="font-medium">Step:</span> {currentStep} of {schedule.length}
              </p>
            </Card>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" size="icon" onClick={goToPrevStep} disabled={currentStep === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={resetSimulation}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={togglePlayPause}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
            <Button variant="outline" size="icon" onClick={goToNextStep} disabled={currentStep >= schedule.length}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}