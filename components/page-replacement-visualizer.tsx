"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { TooltipHelper } from "@/components/tooltip-helper"
import { ChevronRight, ChevronLeft, Play, Pause, RotateCcw, Clock } from "lucide-react"

interface SimulationResult {
  page: number;
  frames: number[];
  fault: boolean;
  replaced: number;
}

export function PageReplacementVisualizer({ algorithm = "fifo" }: { algorithm: "fifo" | "lru" | "optimal" }) {
  const [referenceString, setReferenceString] = useState("7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1")
  const [frameCount, setFrameCount] = useState(3)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000) // ms between steps
  const [results, setResults] = useState<SimulationResult[]>([])
  const [animating, setAnimating] = useState(false)

  // Parse reference string into array of numbers
  const parseReferenceString = (str: string): number[] => {
    return str.trim().split(/\s+/).map(Number)
  }

  // Run the selected algorithm
  const runAlgorithm = () => {
    const pages = parseReferenceString(referenceString)
    let simulationResults: SimulationResult[] = []

    // Initialize frames
    const frames = new Array(frameCount).fill(-1)

    if (algorithm === "fifo") {
      simulationResults = runFIFO(pages, frames)
    } else if (algorithm === "lru") {
      simulationResults = runLRU(pages, frames)
    } else if (algorithm === "optimal") {
      simulationResults = runOptimal(pages, frames)
    }

    setResults(simulationResults)
    setCurrentStep(0)
    setIsPlaying(false)
  }

  // FIFO algorithm
  const runFIFO = (pages: number[], frames: number[]): SimulationResult[] => {
    const results: SimulationResult[] = []
    let pointer = 0

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      const framesCopy = [...frames]
      let fault = true

      // Check if page is already in a frame
      if (frames.includes(page)) {
        fault = false
      } else {
        // Page fault - replace page at current pointer
        frames[pointer] = page
        pointer = (pointer + 1) % frames.length
      }

      results.push({
        page,
        frames: [...frames],
        fault,
        replaced: fault ? (pointer === 0 ? frames.length - 1 : pointer - 1) : -1,
      })
    }

    return results
  }

  // LRU algorithm
  const runLRU = (pages: number[], frames: number[]): SimulationResult[] => {
    const results: SimulationResult[] = []
    const lastUsed = new Array(frames.length).fill(-1)

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      const framesCopy = [...frames]
      let fault = true
      let replaced = -1

      // Check if page is already in a frame
      const frameIndex = frames.indexOf(page)
      if (frameIndex !== -1) {
        fault = false
        lastUsed[frameIndex] = i
      } else {
        // Find least recently used frame
        let lruIndex = 0
        for (let j = 1; j < frames.length; j++) {
          if (lastUsed[j] < lastUsed[lruIndex]) {
            lruIndex = j
          }
        }

        replaced = lruIndex
        frames[lruIndex] = page
        lastUsed[lruIndex] = i
      }

      results.push({
        page,
        frames: [...frames],
        fault,
        replaced,
      })
    }

    return results
  }

  // Optimal algorithm
  const runOptimal = (pages: number[], frames: number[]): SimulationResult[] => {
    const results: SimulationResult[] = []

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      const framesCopy = [...frames]
      let fault = true
      let replaced = -1

      // Check if page is already in a frame
      if (frames.includes(page)) {
        fault = false
      } else {
        // If there's an empty frame
        if (frames.includes(-1)) {
          const emptyIndex = frames.indexOf(-1)
          frames[emptyIndex] = page
          replaced = emptyIndex
        } else {
          // Find page that won't be used for the longest time
          const nextUse = frames.map((frame) => {
            const nextIndex = pages.indexOf(frame, i + 1)
            return nextIndex === -1 ? Number.POSITIVE_INFINITY : nextIndex
          })

          const replaceIndex = nextUse.indexOf(Math.max(...nextUse))
          replaced = replaceIndex
          frames[replaceIndex] = page
        }
      }

      results.push({
        page,
        frames: [...frames],
        fault,
        replaced,
      })
    }

    return results
  }

  // Navigation functions
  const goToNextStep = () => {
    if (currentStep < results.length - 1) {
      setAnimating(true)
      setCurrentStep(currentStep + 1)
      setTimeout(() => setAnimating(false), 300)
    } else {
      setIsPlaying(false)
    }
  }

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setAnimating(true)
      setCurrentStep(currentStep - 1)
      setTimeout(() => setAnimating(false), 300)
    }
  }

  const resetSimulation = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  // Auto-play effect
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined

    if (isPlaying && results.length > 0) {
      interval = setInterval(() => {
        if (currentStep < results.length - 1) {
          setAnimating(true)
          setCurrentStep((prev) => prev + 1)
          setTimeout(() => setAnimating(false), 300)
        } else {
          setIsPlaying(false)
        }
      }, speed)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, currentStep, results.length, speed])

  // Calculate statistics
  const pageFaults = results.filter((r) => r.fault).length
  const hitRatio = results.length > 0 ? ((results.length - pageFaults) / results.length).toFixed(2) : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="flex items-center gap-2">
            <Label htmlFor="reference-string">Reference String</Label>
            <TooltipHelper content="A sequence of page numbers that are requested by the process. Separate numbers with spaces." />
          </div>
          <Input
            id="reference-string"
            value={referenceString}
            onChange={(e) => setReferenceString(e.target.value)}
            placeholder="e.g. 7 0 1 2 0 3 0 4 2 3"
            className="mt-1.5"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <Label htmlFor="frame-count">Number of Frames</Label>
            <TooltipHelper content="The number of page frames available in physical memory." />
          </div>
          <Input
            id="frame-count"
            type="number"
            min="1"
            max="10"
            value={frameCount}
            onChange={(e) => setFrameCount(Number.parseInt(e.target.value))}
            className="mt-1.5"
          />
        </div>
      </div>

      <Button onClick={runAlgorithm} className="w-full gradient-border">
        Run Simulation
      </Button>

      {results.length > 0 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-wrap gap-2">
            {parseReferenceString(referenceString).map((page, index) => (
              <div
                key={index}
                className={`w-8 h-8 flex items-center justify-center rounded-md border transition-all duration-300 ${
                  index === currentStep
                    ? "bg-primary text-primary-foreground scale-110 shadow-md"
                    : index < currentStep
                      ? "bg-muted opacity-70"
                      : "bg-muted"
                }`}
              >
                {page}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Memory Frames:</p>
            {results[currentStep]?.frames.map((frame, index) => (
              <div
                key={index}
                className={`h-10 flex items-center justify-center rounded-md border transition-all duration-300 ${
                  index === results[currentStep]?.replaced
                    ? "border-red-500 dark:border-red-400 border-2 animate-pulse-subtle"
                    : frame === results[currentStep]?.page
                      ? "border-primary border-2 shadow-md"
                      : ""
                } ${animating ? "scale-105" : ""}`}
              >
                {frame !== -1 ? frame : ""}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 glass">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${results[currentStep]?.fault ? "bg-red-500" : "bg-green-500"}`}
                ></div>
                <p className="text-sm font-medium">Status:</p>
              </div>
              <p
                className={
                  results[currentStep]?.fault ? "text-red-500 dark:text-red-400" : "text-green-500 dark:text-green-400"
                }
              >
                {results[currentStep]?.fault ? "Page Fault" : "Page Hit"}
              </p>
            </Card>
            <Card className="p-4 glass">
              <p className="text-sm font-medium">Statistics:</p>
              <div className="flex justify-between items-center">
                <p>
                  Faults: {pageFaults} / {results.length}
                </p>
                <p>Hit Ratio: {hitRatio}</p>
              </div>
            </Card>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="speed-slider" className="text-sm">
                  Animation Speed
                </Label>
              </div>
              <span className="text-xs text-muted-foreground">{speed}ms</span>
            </div>
            <Slider
              id="speed-slider"
              min={100}
              max={2000}
              step={100}
              value={[speed]}
              onValueChange={(value) => setSpeed(value[0])}
            />
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
            <Button variant="outline" size="icon" onClick={goToNextStep} disabled={currentStep === results.length - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
