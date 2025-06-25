
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { TooltipHelper } from "@/components/tooltip-helper"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronRight, ChevronLeft, Play, Pause, RotateCcw, Clock, Zap, Target } from "lucide-react"

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
  const [speed, setSpeed] = useState(1000)
  const [results, setResults] = useState<SimulationResult[]>([])
  const [animating, setAnimating] = useState(false)
  const [showTableDialog, setShowTableDialog] = useState(false)
  const [highlightedFrame, setHighlightedFrame] = useState(-1)

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
      let fault = true

      if (frames.includes(page)) {
        fault = false
      } else {
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
      let fault = true
      let replaced = -1

      const frameIndex = frames.indexOf(page)
      if (frameIndex !== -1) {
        fault = false
        lastUsed[frameIndex] = i
      } else {
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
      let fault = true
      let replaced = -1

      if (frames.includes(page)) {
        fault = false
      } else {
        if (frames.includes(-1)) {
          const emptyIndex = frames.indexOf(-1)
          frames[emptyIndex] = page
          replaced = emptyIndex
        } else {
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
      if (results[currentStep + 1].replaced !== -1) {
        setHighlightedFrame(results[currentStep + 1].replaced)
        setTimeout(() => setHighlightedFrame(-1), 800)
      }
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
    setHighlightedFrame(-1)
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
          setCurrentStep((prev) => {
            const nextStep = prev + 1
            if (results[nextStep].replaced !== -1) {
              setHighlightedFrame(results[nextStep].replaced)
              setTimeout(() => setHighlightedFrame(-1), 800)
            }
            return nextStep
          })
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
  const hitRatio = results.length > 0 ? ((results.length - pageFaults) / results.length * 100).toFixed(1) : 0

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

      <Button onClick={runAlgorithm} className="w-full relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <span className="relative flex items-center justify-center gap-2">
          <Zap className="h-4 w-4" />
          Run {algorithm.toUpperCase()} Simulation
        </span>
      </Button>

      {results.length > 0 && (
        <div className="space-y-6 animate-fade-in">
          {/* Enhanced Reference String Display */}
          <Card className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 border-2">
            <div className="text-sm font-medium mb-4 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Page Reference Sequence
            </div>
            <div className="flex flex-wrap gap-2">
              {parseReferenceString(referenceString).map((page, index) => (
                <div
                  key={index}
                  className={`relative w-12 h-12 flex items-center justify-center rounded-xl font-semibold text-sm transition-all duration-500 transform ${
                    index === currentStep
                      ? "bg-gradient-to-br from-red-500 to-pink-600 text-white scale-125 shadow-2xl ring-4 ring-red-200 dark:ring-red-800"
                      : index < currentStep
                        ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white scale-105 shadow-lg opacity-80"
                        : "bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 text-gray-700 dark:text-gray-300 hover:scale-105"
                  }`}
                >
                  {page}
                  {index === currentStep && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Enhanced Memory Frames Display */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-2">
            <div className="text-sm font-medium mb-4 flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded"></div>
              Physical Memory Frames
            </div>
            <div className="space-y-3">
              {results[currentStep]?.frames.map((frame, index) => (
                <div
                  key={index}
                  className={`relative h-16 flex items-center justify-center rounded-xl font-bold text-lg transition-all duration-500 transform ${
                    index === highlightedFrame
                      ? "bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white scale-105 shadow-2xl animate-pulse border-4 border-red-300"
                      : frame === results[currentStep]?.page && results[currentStep]?.fault === false
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white scale-105 shadow-xl border-2 border-green-300"
                        : frame !== -1
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg border border-blue-300"
                          : "bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 border-2 border-dashed border-gray-400"
                  } ${animating ? "scale-110" : ""}`}
                >
                  <div className="flex items-center justify-between w-full px-4">
                    <span className="text-xs opacity-70">Frame {index + 1}</span>
                    <span className="text-xl">{frame !== -1 ? frame : "—"}</span>
                  </div>
                  {index === results[currentStep]?.replaced && results[currentStep]?.fault && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">!</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Enhanced Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      results[currentStep]?.fault 
                        ? "bg-red-500 shadow-lg shadow-red-300 animate-pulse" 
                        : "bg-green-500 shadow-lg shadow-green-300"
                    }`}
                  ></div>
                  <p className="text-sm font-medium">Current Status</p>
                </div>
                <p className={`font-bold text-lg ${
                  results[currentStep]?.fault ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                }`}>
                  {results[currentStep]?.fault ? "Page Fault" : "Page Hit"}
                </p>
              </div>
            </Card>

            <Card className="p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950"></div>
              <div className="relative">
                <p className="text-sm font-medium mb-2">Total Faults</p>
                <p className="font-bold text-2xl text-blue-600 dark:text-blue-400">
                  {pageFaults} / {results.length}
                </p>
              </div>
            </Card>

            <Card className="p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950"></div>
              <div className="relative">
                <p className="text-sm font-medium mb-2">Hit Ratio</p>
                <p className="font-bold text-2xl text-green-600 dark:text-green-400">{hitRatio}%</p>
              </div>
            </Card>
          </div>

          {/* Enhanced Speed Control */}
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="speed-slider" className="text-sm">Animation Speed</Label>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{speed}ms</span>
              </div>
              <Slider
                id="speed-slider"
                min={100}
                max={2000}
                step={100}
                value={[speed]}
                onValueChange={(value) => setSpeed(value[0])}
                className="w-full"
              />
            </div>
          </Card>

          {/* Enhanced Controls */}
          <div className="relative flex justify-center items-center min-h-[60px]">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevStep}
              disabled={currentStep === 0}
              className="absolute left-0 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={resetSimulation}
                className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={togglePlayPause}
                className="h-14 w-14 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setShowTableDialog(true)}
                className="shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Show Detailed Table
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextStep}
              disabled={currentStep === results.length - 1}
              className="absolute right-0 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress Indicator */}
          <Card className="p-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{currentStep + 1} / {results.length}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / results.length) * 100}%` }}
              ></div>
            </div>
          </Card>
        </div>
      )}

      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-xl mb-4">Page Reference Analysis Table</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center border px-2 font-semibold">Reference →</TableHead>
                  {results.map((result, index) => (
                    <TableHead key={index} className="text-center border px-2 w-12 font-semibold">
                      {result.page}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: frameCount }).map((_, frameIndex) => (
                  <TableRow key={frameIndex}>
                    <TableCell className="text-center border px-2 font-medium">
                      Frame {frameIndex + 1}
                    </TableCell>
                    {results.map((result, stepIndex) => (
                      <TableCell key={stepIndex} className="text-center border px-2">
                        {result.frames[frameIndex] === -1 ? "" : result.frames[frameIndex]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="text-center border px-2 font-medium">Status</TableCell>
                  {results.map((result, index) => (
                    <TableCell 
                      key={index} 
                      className={`text-center border px-2 font-bold ${
                        result.fault ? "text-red-500 bg-red-50 dark:bg-red-950" : "text-green-500 bg-green-50 dark:bg-green-950"
                      }`}
                    >
                      {result.fault ? "MISS" : "HIT"}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
