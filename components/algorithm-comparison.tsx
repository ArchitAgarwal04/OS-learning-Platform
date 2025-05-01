"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TooltipHelper } from "@/components/tooltip-helper"
import { ArrowRight, BarChart3 } from "lucide-react"

export function AlgorithmComparison() {
  const [referenceString, setReferenceString] = useState("7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1")
  const [frameCount, setFrameCount] = useState(3)
  const [results, setResults] = useState<any>(null)

  // Parse reference string into array of numbers
  const parseReferenceString = (str: string) => {
    return str.trim().split(/\s+/).map(Number)
  }

  // Run all algorithms and compare
  const runComparison = () => {
    const pages = parseReferenceString(referenceString)
    const frames = Number.parseInt(frameCount.toString())

    // Run each algorithm
    const fifoResult = simulateFIFO(pages, frames)
    const lruResult = simulateLRU(pages, frames)
    const optimalResult = simulateOptimal(pages, frames)

    setResults({
      fifo: {
        pageFaults: fifoResult.pageFaults,
        hitRatio: fifoResult.hitRatio,
      },
      lru: {
        pageFaults: lruResult.pageFaults,
        hitRatio: lruResult.hitRatio,
      },
      optimal: {
        pageFaults: optimalResult.pageFaults,
        hitRatio: optimalResult.hitRatio,
      },
    })
  }

  // FIFO algorithm
  const simulateFIFO = (pages: number[], frameCount: number) => {
    const frames = new Array(frameCount).fill(-1)
    let pointer = 0
    let pageFaults = 0

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]

      // Check if page is already in a frame
      if (!frames.includes(page)) {
        // Page fault - replace page at current pointer
        frames[pointer] = page
        pointer = (pointer + 1) % frameCount
        pageFaults++
      }
    }

    return {
      pageFaults,
      hitRatio: (pages.length - pageFaults) / pages.length,
    }
  }

  // LRU algorithm
  const simulateLRU = (pages: number[], frameCount: number) => {
    const frames = new Array(frameCount).fill(-1)
    const lastUsed = new Array(frameCount).fill(-1)
    let pageFaults = 0

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]

      // Check if page is already in a frame
      const frameIndex = frames.indexOf(page)
      if (frameIndex !== -1) {
        lastUsed[frameIndex] = i
      } else {
        // Find least recently used frame
        let lruIndex = 0
        for (let j = 1; j < frameCount; j++) {
          if (lastUsed[j] < lastUsed[lruIndex]) {
            lruIndex = j
          }
        }

        frames[lruIndex] = page
        lastUsed[lruIndex] = i
        pageFaults++
      }
    }

    return {
      pageFaults,
      hitRatio: (pages.length - pageFaults) / pages.length,
    }
  }

  // Optimal algorithm
  const simulateOptimal = (pages: number[], frameCount: number) => {
    const frames = new Array(frameCount).fill(-1)
    let pageFaults = 0

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]

      // Check if page is already in a frame
      if (!frames.includes(page)) {
        // If there's an empty frame
        if (frames.includes(-1)) {
          const emptyIndex = frames.indexOf(-1)
          frames[emptyIndex] = page
        } else {
          // Find page that won't be used for the longest time
          const nextUse = frames.map((frame) => {
            const nextIndex = pages.indexOf(frame, i + 1)
            return nextIndex === -1 ? Number.POSITIVE_INFINITY : nextIndex
          })

          const replaceIndex = nextUse.indexOf(Math.max(...nextUse))
          frames[replaceIndex] = page
        }

        pageFaults++
      }
    }

    return {
      pageFaults,
      hitRatio: (pages.length - pageFaults) / pages.length,
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Algorithm Comparison</CardTitle>
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <CardDescription>Compare the performance of different page replacement algorithms</CardDescription>
      </CardHeader>
      <CardContent>
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

          <Button onClick={runComparison} className="w-full">
            Run Comparison
          </Button>

          {results && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium">Results</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">FIFO</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Page Faults:</span> {results.fifo.pageFaults}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Hit Ratio:</span> {results.fifo.hitRatio.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">LRU</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Page Faults:</span> {results.lru.pageFaults}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Hit Ratio:</span> {results.lru.hitRatio.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Optimal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Page Faults:</span> {results.optimal.pageFaults}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Hit Ratio:</span> {results.optimal.hitRatio.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="relative pt-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-2 text-xs text-muted-foreground">Performance Analysis</span>
                </div>
              </div>

              <div className="relative h-40 w-full">
                <div className="absolute bottom-0 left-0 right-0 flex h-full">
                  <div className="flex flex-col items-center justify-end w-1/3 px-2">
                    <div
                      className="w-full bg-blue-500 rounded-t-md transition-all duration-500"
                      style={{
                        height: `${(results.fifo.pageFaults / parseReferenceString(referenceString).length) * 100}%`,
                      }}
                    ></div>
                    <span className="mt-2 text-xs">FIFO</span>
                  </div>
                  <div className="flex flex-col items-center justify-end w-1/3 px-2">
                    <div
                      className="w-full bg-green-500 rounded-t-md transition-all duration-500"
                      style={{
                        height: `${(results.lru.pageFaults / parseReferenceString(referenceString).length) * 100}%`,
                      }}
                    ></div>
                    <span className="mt-2 text-xs">LRU</span>
                  </div>
                  <div className="flex flex-col items-center justify-end w-1/3 px-2">
                    <div
                      className="w-full bg-purple-500 rounded-t-md transition-all duration-500"
                      style={{
                        height: `${(results.optimal.pageFaults / parseReferenceString(referenceString).length) * 100}%`,
                      }}
                    ></div>
                    <span className="mt-2 text-xs">Optimal</span>
                  </div>
                </div>
                <div className="absolute left-0 right-0 top-0 flex justify-between text-xs text-muted-foreground">
                  <span>Page Fault Rate</span>
                  <span>Lower is better</span>
                </div>
              </div>

              <div className="flex justify-center">
                <Button variant="outline" size="sm" asChild>
                  <a href="/page-replacement" className="flex items-center">
                    View Detailed Visualizations
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
