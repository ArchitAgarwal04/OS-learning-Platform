"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TooltipHelper } from "@/components/tooltip-helper"
import { ArrowRight, BarChart3 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Process {
  id: number
  arrivalTime: number
  burstTime: number
  completionTime?: number
  turnaroundTime?: number
  waitingTime?: number
}

interface DiskRequest {
  from: number
  to: number
  seekTime: number
}

interface DiskResult {
  seekSequence: DiskRequest[]
  totalSeekTime: number
}

export function AlgorithmComparison() {
  const [referenceString, setReferenceString] = useState("7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1")
  const [frameCount, setFrameCount] = useState(3)
  const [pageResults, setPageResults] = useState<any>(null)
  const [cpuResults, setCpuResults] = useState<any>(null)

  // CPU Scheduling state
  const [processes, setProcesses] = useState<Process[]>([
    { id: 1, arrivalTime: 0, burstTime: 6 },
    { id: 2, arrivalTime: 2, burstTime: 4 },
    { id: 3, arrivalTime: 4, burstTime: 8 },
  ])
  const [quantum, setQuantum] = useState(2)

  // Disk Scheduling state
  const [requestSequence, setRequestSequence] = useState("98 183 37 122 14 124 65 67")
  const [initialPosition, setInitialPosition] = useState(50)
  const [fcfsResult, setFcfsResult] = useState<DiskResult>({ seekSequence: [], totalSeekTime: 0 })
  const [sstfResult, setSstfResult] = useState<DiskResult>({ seekSequence: [], totalSeekTime: 0 })
  const [scanResult, setScanResult] = useState<DiskResult>({ seekSequence: [], totalSeekTime: 0 })
  const [cscanResult, setCscanResult] = useState<DiskResult>({ seekSequence: [], totalSeekTime: 0 })

  // Process management functions
  const addProcess = () => {
    const newId = Math.max(...processes.map(p => p.id), 0) + 1
    setProcesses([...processes, { id: newId, arrivalTime: 0, burstTime: 1 }])
  }

  const removeProcess = (id: number) => {
    if (processes.length > 1) {
      setProcesses(processes.filter(p => p.id !== id))
    }
  }

  const updateProcess = (id: number, field: keyof Process, value: number) => {
    setProcesses(processes.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ))
  }

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

    setPageResults({
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

  // CPU Scheduling Algorithms
  const simulateCPUFCFS = (procs: Process[]): Process[] => {
    const sorted = [...procs].sort((a, b) => a.arrivalTime - b.arrivalTime)
    let currentTime = 0

    return sorted.map((proc) => {
      currentTime = Math.max(currentTime, proc.arrivalTime)
      const startTime = currentTime
      currentTime += proc.burstTime

      return {
        ...proc,
        completionTime: currentTime,
        turnaroundTime: currentTime - proc.arrivalTime,
        waitingTime: startTime - proc.arrivalTime,
      }
    })
  }

  const simulateSJF = (procs: Process[]): Process[] => {
    const result: Process[] = []
    const remaining = [...procs]
    let currentTime = 0

    while (remaining.length > 0) {
      const available = remaining.filter((p) => p.arrivalTime <= currentTime)

      if (available.length === 0) {
        currentTime = Math.min(...remaining.map((p) => p.arrivalTime))
        continue
      }

      const shortest = available.reduce((prev, curr) =>
        curr.burstTime < prev.burstTime ? curr : prev
      )

      const index = remaining.findIndex((p) => p.id === shortest.id)
      remaining.splice(index, 1)

      result.push({
        ...shortest,
        completionTime: currentTime + shortest.burstTime,
        turnaroundTime: currentTime + shortest.burstTime - shortest.arrivalTime,
        waitingTime: currentTime - shortest.arrivalTime,
      })

      currentTime += shortest.burstTime
    }

    return result
  }

  const simulateRR = (procs: Process[], timeQuantum: number): Process[] => {
    const result = procs.map((p) => ({ ...p }))
    const remainingTime = new Map(procs.map((p) => [p.id, p.burstTime]))
    let currentTime = 0
    let queue: Process[] = []

    while (remainingTime.size > 0) {
      // Add newly arrived processes to queue
      const newArrivals = result.filter(
        (p) =>
          p.arrivalTime <= currentTime &&
          remainingTime.has(p.id) &&
          !queue.includes(p)
      )
      queue.push(...newArrivals)

      if (queue.length === 0) {
        currentTime = Math.min(
          ...Array.from(remainingTime.keys())
            .map((id) => result.find((p) => p.id === id)!)
            .map((p) => p.arrivalTime)
        )
        continue
      }

      const current = queue.shift()!
      const remaining = remainingTime.get(current.id)!

      if (remaining <= timeQuantum) {
        currentTime += remaining
        remainingTime.delete(current.id)

        const proc = result.find((p) => p.id === current.id)!
        proc.completionTime = currentTime
        proc.turnaroundTime = currentTime - proc.arrivalTime
        proc.waitingTime = proc.turnaroundTime - proc.burstTime
      } else {
        currentTime += timeQuantum
        remainingTime.set(current.id, remaining - timeQuantum)

        // Add newly arrived processes before re-adding current process
        const newArrivals = result.filter(
          (p) =>
            p.arrivalTime <= currentTime &&
            remainingTime.has(p.id) &&
            !queue.includes(p) &&
            p.id !== current.id
        )
        queue.push(...newArrivals, current)
      }
    }

    return result
  }

  const runCPUComparison = () => {
    const fcfsResults = simulateCPUFCFS(processes)
    const sjfResults = simulateSJF(processes)
    const rrResults = simulateRR(processes, quantum)

    const calculateAverage = (arr: number[]) =>
      arr.reduce((a, b) => a + b, 0) / arr.length

    setCpuResults({
      fcfs: {
        avgWaitingTime: calculateAverage(fcfsResults.map((p) => p.waitingTime!)),
        avgTurnaroundTime: calculateAverage(
          fcfsResults.map((p) => p.turnaroundTime!)
        ),
        processes: fcfsResults,
      },
      sjf: {
        avgWaitingTime: calculateAverage(sjfResults.map((p) => p.waitingTime!)),
        avgTurnaroundTime: calculateAverage(
          sjfResults.map((p) => p.turnaroundTime!)
        ),
        processes: sjfResults,
      },
      rr: {
        avgWaitingTime: calculateAverage(rrResults.map((p) => p.waitingTime!)),
        avgTurnaroundTime: calculateAverage(
          rrResults.map((p) => p.turnaroundTime!)
        ),
        processes: rrResults,
      },
    })
  }

  // Disk Scheduling comparison function
  const runDiskComparison = () => {
    const requests = requestSequence.split(" ").map(Number)
    const initPos = Number(initialPosition)

    const fcfs = simulateDiskFCFS(requests, initPos)
    const sstf = simulateSSFT(requests, initPos)
    const scan = simulateSCAN(requests, initPos)
    const cscan = simulateCSCAN(requests, initPos)

    setFcfsResult(fcfs)
    setSstfResult(sstf)
    setScanResult(scan)
    setCscanResult(cscan)
  }

  // Disk scheduling algorithm implementations
  const simulateDiskFCFS = (requests: number[], initialPosition: number): DiskResult => {
    const seekSequence: DiskRequest[] = []
    let totalSeekTime = 0
    let currentPosition = initialPosition

    for (const request of requests) {
      seekSequence.push({
        from: currentPosition,
        to: request,
        seekTime: Math.abs(request - currentPosition)
      })
      totalSeekTime += Math.abs(request - currentPosition)
      currentPosition = request
    }

    return { seekSequence, totalSeekTime }
  }

  const simulateSSFT = (requests: number[], initialPosition: number): DiskResult => {
    const seekSequence: DiskRequest[] = []
    let totalSeekTime = 0
    let currentPosition = initialPosition
    const remaining = [...requests]

    while (remaining.length > 0) {
      let minSeekTime = Infinity
      let nextIndex = -1

      remaining.forEach((request, index) => {
        const seekTime = Math.abs(request - currentPosition)
        if (seekTime < minSeekTime) {
          minSeekTime = seekTime
          nextIndex = index
        }
      })

      seekSequence.push({
        from: currentPosition,
        to: remaining[nextIndex],
        seekTime: minSeekTime
      })
      totalSeekTime += minSeekTime
      currentPosition = remaining[nextIndex]
      remaining.splice(nextIndex, 1)
    }

    return { seekSequence, totalSeekTime }
  }

  const simulateSCAN = (requests: number[], initialPosition: number): DiskResult => {
    const seekSequence: DiskRequest[] = []
    let totalSeekTime = 0
    let currentPosition = initialPosition
    const sortedRequests = [...new Set(requests)].sort((a, b) => a - b)
    
    const startIndex = sortedRequests.findIndex(r => r >= currentPosition)
    const firstPart = sortedRequests.slice(startIndex)
    const secondPart = sortedRequests.slice(0, startIndex).reverse()

    for (const request of [...firstPart, ...secondPart]) {
      seekSequence.push({
        from: currentPosition,
        to: request,
        seekTime: Math.abs(request - currentPosition)
      })
      totalSeekTime += Math.abs(request - currentPosition)
      currentPosition = request
    }

    return { seekSequence, totalSeekTime }
  }

  const simulateCSCAN = (requests: number[], initialPosition: number): DiskResult => {
    const seekSequence: DiskRequest[] = []
    let totalSeekTime = 0
    let currentPosition = initialPosition
    const sortedRequests = [...new Set(requests)].sort((a, b) => a - b)
    
    const startIndex = sortedRequests.findIndex(r => r >= currentPosition)
    const firstPart = sortedRequests.slice(startIndex)
    const secondPart = sortedRequests.slice(0, startIndex)

    for (const request of [...firstPart, ...secondPart]) {
      seekSequence.push({
        from: currentPosition,
        to: request,
        seekTime: Math.abs(request - currentPosition)
      })
      totalSeekTime += Math.abs(request - currentPosition)
      currentPosition = request
    }

    return { seekSequence, totalSeekTime }
  }

  useEffect(() => {
    if (requestSequence && initialPosition) {
      runDiskComparison()
    }
  }, [requestSequence, initialPosition])

  // Helper function to generate SVG path for head movement visualization
  function generatePath(seekSequence: DiskRequest[]) {
    if (!seekSequence || seekSequence.length === 0) return ""
    
    return seekSequence.map((seq, i) => {
      const x1 = (seq.from / 200) * 100
      const x2 = (seq.to / 200) * 100
      const y = 50 // Center of the visualization
      return `${i === 0 ? "M" : "L"} ${x1} ${y} L ${x2} ${y}`
    }).join(" ")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Algorithm Comparison</CardTitle>
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <CardDescription>Compare the performance of different OS algorithms</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="page-replacement" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="page-replacement">Page Replacement</TabsTrigger>
            <TabsTrigger value="cpu-scheduling">CPU Scheduling</TabsTrigger>
            <TabsTrigger value="disk-scheduling">Disk Scheduling</TabsTrigger>
          </TabsList>

          <TabsContent value="page-replacement">
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
                    onChange={(e) =>
                      setFrameCount(Number.parseInt(e.target.value))
                    }
                    className="mt-1.5"
                  />
                </div>
              </div>

              <Button onClick={runComparison} className="w-full">
                Run Comparison
              </Button>

              {pageResults && (
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
                            <span className="font-medium">Page Faults:</span>{" "}
                            {pageResults.fifo.pageFaults}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Hit Ratio:</span>{" "}
                            {pageResults.fifo.hitRatio.toFixed(2)}
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
                            <span className="font-medium">Page Faults:</span>{" "}
                            {pageResults.lru.pageFaults}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Hit Ratio:</span>{" "}
                            {pageResults.lru.hitRatio.toFixed(2)}
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
                            <span className="font-medium">Page Faults:</span>{" "}
                            {pageResults.optimal.pageFaults}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Hit Ratio:</span>{" "}
                            {pageResults.optimal.hitRatio.toFixed(2)}
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
                      <span className="bg-background px-2 text-xs text-muted-foreground">
                        Performance Analysis
                      </span>
                    </div>
                  </div>

                  <div className="relative h-40 w-full">
                    <div className="absolute bottom-0 left-0 right-0 flex h-full">
                      <div className="flex flex-col items-center justify-end w-1/3 px-2">
                        <div
                          className="w-full bg-blue-500 rounded-t-md transition-all duration-500"
                          style={{
                            height: `${
                              (pageResults.fifo.pageFaults /
                                parseReferenceString(referenceString).length) *
                              100
                            }%`,
                          }}
                        ></div>
                        <span className="mt-2 text-xs">FIFO</span>
                      </div>
                      <div className="flex flex-col items-center justify-end w-1/3 px-2">
                        <div
                          className="w-full bg-green-500 rounded-t-md transition-all duration-500"
                          style={{
                            height: `${
                              (pageResults.lru.pageFaults /
                                parseReferenceString(referenceString).length) *
                              100
                            }%`,
                          }}
                        ></div>
                        <span className="mt-2 text-xs">LRU</span>
                      </div>
                      <div className="flex flex-col items-center justify-end w-1/3 px-2">
                        <div
                          className="w-full bg-purple-500 rounded-t-md transition-all duration-500"
                          style={{
                            height: `${
                              (pageResults.optimal.pageFaults /
                                parseReferenceString(referenceString).length) *
                              100
                            }%`,
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
          </TabsContent>

          <TabsContent value="cpu-scheduling">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="process-info">Process Information</Label>
                  <Card className="mt-2">
                    <ScrollArea className="h-[300px] rounded-md p-4">
                      {processes.map((process, index) => (
                        <div key={process.id} className="mb-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Process {process.id}</h4>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeProcess(process.id)}
                              disabled={processes.length <= 1}
                            >
                              Remove
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor={`arrival-${process.id}`}>Arrival Time</Label>
                              <Input
                                id={`arrival-${process.id}`}
                                type="number"
                                min="0"
                                value={process.arrivalTime}
                                onChange={(e) =>
                                  updateProcess(
                                    process.id,
                                    "arrivalTime",
                                    parseInt(e.target.value)
                                  )
                                }
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`burst-${process.id}`}>Burst Time</Label>
                              <Input
                                id={`burst-${process.id}`}
                                type="number"
                                min="1"
                                value={process.burstTime}
                                onChange={(e) =>
                                  updateProcess(
                                    process.id,
                                    "burstTime",
                                    parseInt(e.target.value)
                                  )
                                }
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </Card>
                  <Button onClick={addProcess} variant="outline" className="mt-2 w-full">
                    Add Process
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="quantum">Time Quantum (Round Robin)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="quantum"
                        type="number"
                        min="1"
                        value={quantum}
                        onChange={(e) => setQuantum(parseInt(e.target.value))}
                        className="mt-1"
                      />
                      <TooltipHelper content="Time slice allocated to each process in Round Robin scheduling" />
                    </div>
                  </div>
                  <Button onClick={runCPUComparison} className="w-full">
                    Run Comparison
                  </Button>
                </div>
              </div>

              {cpuResults && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-muted/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-between">
                          FCFS
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500">Simple</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <Label className="text-sm">Average Waiting Time</Label>
                            <p className="text-2xl font-bold">{cpuResults.fcfs.avgWaitingTime.toFixed(2)}</p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-sm">Average Turnaround Time</Label>
                            <p className="text-2xl font-bold">{cpuResults.fcfs.avgTurnaroundTime.toFixed(2)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-between">
                          SJF
                          <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">Optimal</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <Label className="text-sm">Average Waiting Time</Label>
                            <p className="text-2xl font-bold">{cpuResults.sjf.avgWaitingTime.toFixed(2)}</p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-sm">Average Turnaround Time</Label>
                            <p className="text-2xl font-bold">{cpuResults.sjf.avgTurnaroundTime.toFixed(2)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-between">
                          Round Robin
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-500">Fair</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <Label className="text-sm">Average Waiting Time</Label>
                            <p className="text-2xl font-bold">{cpuResults.rr.avgWaitingTime.toFixed(2)}</p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-sm">Average Turnaround Time</Label>
                            <p className="text-2xl font-bold">{cpuResults.rr.avgTurnaroundTime.toFixed(2)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Performance Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative h-60">
                        <div className="absolute inset-0 flex items-end justify-around px-4">
                          <div className="space-y-2 text-center w-1/3">
                            <div className="relative w-full">
                              <div
                                className="w-full bg-blue-500 rounded-t-md transition-all duration-500"
                                style={{
                                  height: `${(cpuResults.fcfs.avgWaitingTime /
                                    Math.max(
                                      cpuResults.fcfs.avgWaitingTime,
                                      cpuResults.sjf.avgWaitingTime,
                                      cpuResults.rr.avgWaitingTime
                                    )) *
                                    200}px`,
                                }}
                              >
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm">
                                  {cpuResults.fcfs.avgWaitingTime.toFixed(1)}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm font-medium">FCFS</span>
                          </div>
                          <div className="space-y-2 text-center w-1/3">
                            <div className="relative w-full">
                              <div
                                className="w-full bg-green-500 rounded-t-md transition-all duration-500"
                                style={{
                                  height: `${(cpuResults.sjf.avgWaitingTime /
                                    Math.max(
                                      cpuResults.fcfs.avgWaitingTime,
                                      cpuResults.sjf.avgWaitingTime,
                                      cpuResults.rr.avgWaitingTime
                                    )) *
                                    200}px`,
                                }}
                              >
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm">
                                  {cpuResults.sjf.avgWaitingTime.toFixed(1)}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm font-medium">SJF</span>
                          </div>
                          <div className="space-y-2 text-center w-1/3">
                            <div className="relative w-full">
                              <div
                                className="w-full bg-purple-500 rounded-t-md transition-all duration-500"
                                style={{
                                  height: `${(cpuResults.rr.avgWaitingTime /
                                    Math.max(
                                      cpuResults.fcfs.avgWaitingTime,
                                      cpuResults.sjf.avgWaitingTime,
                                      cpuResults.rr.avgWaitingTime
                                    )) *
                                    200}px`,
                                }}
                              >
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm">
                                  {cpuResults.rr.avgWaitingTime.toFixed(1)}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm font-medium">RR</span>
                          </div>
                        </div>
                        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground">
                          {[0, 25, 50, 75, 100].map((tick) => (
                            <div key={tick} className="relative h-0">
                              <span className="absolute right-full pr-2">{tick}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4 text-center text-sm text-muted-foreground">
                        Average Waiting Time (Lower is Better)
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-center">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/cpu-scheduling" className="flex items-center">
                        View Detailed Visualizations
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="disk-scheduling">
            <div className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="request-sequence">Request Sequence</Label>
                    <TooltipHelper content="A sequence of disk track numbers that need to be accessed. Separate numbers with spaces." />
                  </div>
                  <Input
                    id="request-sequence"
                    value={requestSequence}
                    onChange={(e) => setRequestSequence(e.target.value)}
                    placeholder="e.g. 98 183 37 122 14 124 65 67"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="initial-position">Initial Head Position</Label>
                    <TooltipHelper content="The starting position of the disk head" />
                  </div>
                  <Input
                    id="initial-position"
                    type="number"
                    value={initialPosition}
                    onChange={(e) => setInitialPosition(parseInt(e.target.value))}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      <div>
                        <h4 className="text-sm font-medium mb-3">Total Seek Time Comparison</h4>
                        <div className="relative pt-1">
                          <div className="grid grid-cols-4 gap-4">
                            {[
                              { name: "FCFS", value: fcfsResult.totalSeekTime },
                              { name: "SSTF", value: sstfResult.totalSeekTime },
                              { name: "SCAN", value: scanResult.totalSeekTime },
                              { name: "C-SCAN", value: cscanResult.totalSeekTime },
                            ].map((algorithm) => (
                              <div key={algorithm.name} className="text-center">
                                <div className="text-2xl font-bold">{algorithm.value}</div>
                                <div className="text-xs text-muted-foreground mt-1">{algorithm.name}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-3">Head Movement Visualization</h4>
                        <div className="h-48 relative">
                          {/* Track visualization */}
                          <div className="absolute inset-x-0 top-1/2 h-1 bg-muted" />
                          
                          {/* Request points */}
                          {requestSequence.split(" ").map((req, i) => {
                            const position = (Number(req) / 200) * 100
                            return (
                              <div
                                key={i}
                                className="absolute top-1/2 w-2 h-2 rounded-full bg-muted-foreground"
                                style={{ left: `${position}%`, transform: "translate(-50%, -50%)" }}
                              />
                            )
                          })}

                          {/* Algorithm paths */}
                          {[fcfsResult, sstfResult, scanResult, cscanResult].map((result, i) => (
                            <svg
                              key={i}
                              className="absolute inset-0"
                              style={{
                                opacity: 0.5,
                                strokeWidth: 2,
                                stroke: ["#3b82f6", "#10b981", "#6366f1", "#8b5cf6"][i],
                                fill: "none",
                              }}
                            >
                              <path d={generatePath(result.seekSequence)} />
                            </svg>
                          ))}
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                          {["FCFS", "SSTF", "SCAN", "C-SCAN"].map((name, i) => (
                            <div key={name} className="flex items-center gap-1">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: ["#3b82f6", "#10b981", "#6366f1", "#8b5cf6"][i] }}
                              />
                              <span className="text-xs">{name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-center">
                  <Button variant="outline" size="sm" asChild>
                    <a href="/disk-scheduling" className="flex items-center">
                      View Detailed Visualizations
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
