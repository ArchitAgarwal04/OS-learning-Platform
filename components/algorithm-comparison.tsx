"use client"

import { useState, useEffect, useCallback } from "react"
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
  from: number;
  to: number;
}

interface DiskResult {
  seekSequence: DiskRequest[];
  totalSeekTime: number;
  avgSeekTime: number;
  maxSeekTime: number;
  minSeekTime: number;
  totalHeadMovement: number;
}

interface DiskMetrics {
  averageSeekTime: number;
  totalSeekTime: number;
  maxSeekTime: number;
  minSeekTime: number;
  totalHeadMovement: number;
}

const generateDiskPath = (seekSequence: DiskRequest[]) => {
  if (!seekSequence.length) return '';
  
  // Scale the values to fit in our SVG viewBox
  const scaleY = (value: number) => 100 - (value / 199) * 100;
  
  // Generate path starting from the first point
  let path = `M 0 ${scaleY(seekSequence[0].from)}`;
  
  // Add line segments for each subsequent point
  seekSequence.forEach((req, index) => {
    const x = (index / (seekSequence.length - 1)) * 100;
    path += ` L ${x} ${scaleY(req.to)}`;
  });
  
  return path;
};

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
  const [initialPosition, setInitialPosition] = useState(53)
  const [fcfsResult, setFcfsResult] = useState<DiskResult>({
    seekSequence: [],
    totalSeekTime: 0,
    avgSeekTime: 0,
    maxSeekTime: 0,
    minSeekTime: 0,
    totalHeadMovement: 0
  })
  const [sstfResult, setSstfResult] = useState<DiskResult>({
    seekSequence: [],
    totalSeekTime: 0,
    avgSeekTime: 0,
    maxSeekTime: 0,
    minSeekTime: 0,
    totalHeadMovement: 0
  })
  const [scanResult, setScanResult] = useState<DiskResult>({
    seekSequence: [],
    totalSeekTime: 0,
    avgSeekTime: 0,
    maxSeekTime: 0,
    minSeekTime: 0,
    totalHeadMovement: 0
  })
  const [cscanResult, setCscanResult] = useState<DiskResult>({
    seekSequence: [],
    totalSeekTime: 0,
    avgSeekTime: 0,
    maxSeekTime: 0,
    minSeekTime: 0,
    totalHeadMovement: 0
  })

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

  // Disk scheduling algorithms
  const simulateDiskFCFS = (requests: number[], initialPosition: number): DiskResult => {
    const seekSequence: DiskRequest[] = [];
    let currentPosition = initialPosition;
    let totalSeekTime = 0;
    const seekTimes: number[] = [];

    requests.forEach((request) => {
      const seekTime = Math.abs(request - currentPosition);
      seekTimes.push(seekTime);
      totalSeekTime += seekTime;

      seekSequence.push({
        from: currentPosition,
        to: request
      });

      currentPosition = request;
    });

    return {
      seekSequence,
      totalSeekTime,
      avgSeekTime: totalSeekTime / requests.length,
      maxSeekTime: seekTimes.length > 0 ? Math.max(...seekTimes) : 0,
      minSeekTime: seekTimes.length > 0 ? Math.min(...seekTimes) : 0,
      totalHeadMovement: totalSeekTime
    };
  };

  const simulateSSFT = (requests: number[], initialPosition: number): DiskResult => {
    const seekSequence: DiskRequest[] = [];
    let currentPosition = initialPosition;
    let totalSeekTime = 0;
    const seekTimes: number[] = [];
    const remaining = [...requests];

    while (remaining.length > 0) {
      // Find request with shortest seek time from current position
      const nextRequestIndex = remaining.reduce((minIdx, request, idx) => {
        const seekTime = Math.abs(request - currentPosition);
        const minSeekTime = Math.abs(remaining[minIdx] - currentPosition);
        return seekTime < minSeekTime ? idx : minIdx;
      }, 0);

      const seekTime = Math.abs(remaining[nextRequestIndex] - currentPosition);
      seekTimes.push(seekTime);
      totalSeekTime += seekTime;

      seekSequence.push({
        from: currentPosition,
        to: remaining[nextRequestIndex]
      });

      currentPosition = remaining[nextRequestIndex];
      remaining.splice(nextRequestIndex, 1);
    }

    return {
      seekSequence,
      totalSeekTime,
      avgSeekTime: totalSeekTime / seekSequence.length,
      maxSeekTime: seekTimes.length > 0 ? Math.max(...seekTimes) : 0,
      minSeekTime: seekTimes.length > 0 ? Math.min(...seekTimes) : 0,
      totalHeadMovement: totalSeekTime
    };
  };

  const simulateSCAN = (requests: number[], initialPosition: number): DiskResult => {
    const seekSequence: DiskRequest[] = [];
    let currentPosition = initialPosition;
    let totalSeekTime = 0;
    const seekTimes: number[] = [];
    const maxTrack = 199;
    
    // Include current position in sorted set
    const allPositions = [...new Set([...requests, initialPosition])].sort((a, b) => a - b);
    const currentIndex = allPositions.indexOf(initialPosition);
    
    const moveHead = (to: number) => {
      const seekTime = Math.abs(to - currentPosition);
      seekSequence.push({ from: currentPosition, to });
      seekTimes.push(seekTime);
      totalSeekTime += seekTime;
      currentPosition = to;
    };
    
    // Move right first
    for (let i = currentIndex + 1; i < allPositions.length; i++) {
      moveHead(allPositions[i]);
    }
    
    if (currentPosition < maxTrack) {
      moveHead(maxTrack);
    }
    
    // Move left to serve remaining requests
    for (let i = currentIndex - 1; i >= 0; i--) {
      moveHead(allPositions[i]);
    }

    return {
      seekSequence,
      totalSeekTime,
      avgSeekTime: totalSeekTime / seekSequence.length,
      maxSeekTime: seekTimes.length > 0 ? Math.max(...seekTimes) : 0,
      minSeekTime: seekTimes.length > 0 ? Math.min(...seekTimes) : 0,
      totalHeadMovement: totalSeekTime
    };
  };

  const simulateCSCAN = (requests: number[], initialPosition: number): DiskResult => {
    const seekSequence: DiskRequest[] = [];
    let currentPosition = initialPosition;
    let totalSeekTime = 0;
    const seekTimes: number[] = [];
    const maxTrack = 199;
    
    const allPositions = [...new Set([...requests, initialPosition])].sort((a, b) => a - b);
    const currentIndex = allPositions.indexOf(initialPosition);
    
    const moveHead = (to: number) => {
      const seekTime = Math.abs(to - currentPosition);
      seekSequence.push({ from: currentPosition, to });
      seekTimes.push(seekTime);
      totalSeekTime += seekTime;
      currentPosition = to;
    };
    
    // Move right
    for (let i = currentIndex + 1; i < allPositions.length; i++) {
      moveHead(allPositions[i]);
    }
    
    if (currentPosition < maxTrack) {
      moveHead(maxTrack);
    }
    
    // Jump to beginning
    const jumpToZero = { from: currentPosition, to: 0 };
    const jumpTime = currentPosition;
    seekSequence.push(jumpToZero);
    seekTimes.push(jumpTime);
    totalSeekTime += jumpTime;
    currentPosition = 0;
    
    // Serve remaining requests
    for (let i = 0; i < currentIndex; i++) {
      moveHead(allPositions[i]);
    }
    
    return {
      seekSequence,
      totalSeekTime,
      avgSeekTime: totalSeekTime / seekSequence.length,
      maxSeekTime: seekTimes.length > 0 ? Math.max(...seekTimes) : 0,
      minSeekTime: seekTimes.length > 0 ? Math.min(...seekTimes) : 0,
      totalHeadMovement: totalSeekTime
    };
  };

  // Run disk scheduling comparison
  const runDiskComparison = useCallback(() => {
    const requests = requestSequence
      .split(/[\s,]+/)
      .map(Number)
      .filter(n => !isNaN(n) && n >= 0 && n <= 199);

    if (requests.length === 0) {
      return;
    }

    setFcfsResult(simulateDiskFCFS(requests, initialPosition));
    setSstfResult(simulateSSFT(requests, initialPosition));
    setScanResult(simulateSCAN(requests, initialPosition));
    setCscanResult(simulateCSCAN(requests, initialPosition));
  }, [requestSequence, initialPosition]);

  useEffect(() => {
    if (requestSequence && initialPosition) {
      runDiskComparison()
    }
  }, [requestSequence, initialPosition])

  // Helper function to calculate metrics
  function calculateMetrics(seekSequence: DiskRequest[]) {
    if (seekSequence.length === 0) return { avgSeekTime: 0, maxSeekTime: 0, minSeekTime: 0 }
    
    const seekTimes = seekSequence.map(req => Math.abs(req.to - req.from))
    return {
      avgSeekTime: seekTimes.reduce((a, b) => a + b, 0) / seekTimes.length,
      maxSeekTime: Math.max(...seekTimes),
      minSeekTime: Math.min(...seekTimes)
    }
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="request-sequence">Request Sequence</Label>
                    <TooltipHelper content="A sequence of disk track numbers that need to be accessed. Separate numbers with spaces. Valid range: 0-199" />
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
                    <TooltipHelper content="The starting position of the disk head (0-199)" />
                  </div>
                  <Input
                    id="initial-position"
                    type="number"
                    min="0"
                    max="199"
                    value={initialPosition}
                    onChange={(e) => setInitialPosition(Number(e.target.value))}
                    placeholder="50"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <Button onClick={runDiskComparison} className="w-full">
                Run Comparison
              </Button>

              {fcfsResult.seekSequence.length > 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-muted/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-between">
                          FCFS (First Come First Serve)
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500">Simple</span>
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Serves requests in the order they arrive
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="relative w-full h-[100px]">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <path
                                d={generateDiskPath(fcfsResult.seekSequence)}
                                stroke="hsl(var(--primary))"
                                strokeWidth="2"
                                fill="none"
                              />
                            </svg>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Total Movement:</span> {fcfsResult.totalHeadMovement} tracks</p>
                            <p><span className="font-medium">Avg Seek Time:</span> {fcfsResult.avgSeekTime.toFixed(2)} tracks</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-between">
                          SSTF (Shortest Seek Time First)
                          <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">Efficient</span>
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Serves the closest request from current position
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="relative w-full h-[100px]">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <path
                                d={generateDiskPath(sstfResult.seekSequence)}
                                stroke="hsl(var(--primary))"
                                strokeWidth="2"
                                fill="none"
                              />
                            </svg>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Total Movement:</span> {sstfResult.totalHeadMovement} tracks</p>
                            <p><span className="font-medium">Avg Seek Time:</span> {sstfResult.avgSeekTime.toFixed(2)} tracks</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-between">
                          SCAN (Elevator)
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-500">Fair</span>
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Moves in one direction until end, then reverses
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="relative w-full h-[100px]">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <path
                                d={generateDiskPath(scanResult.seekSequence)}
                                stroke="hsl(var(--primary))"
                                strokeWidth="2"
                                fill="none"
                              />
                            </svg>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Total Movement:</span> {scanResult.totalHeadMovement} tracks</p>
                            <p><span className="font-medium">Avg Seek Time:</span> {scanResult.avgSeekTime.toFixed(2)} tracks</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-between">
                          C-SCAN (Circular SCAN)
                          <span className="text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-500">Uniform</span>
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Moves in one direction, jumps back to start
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="relative w-full h-[100px]">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <path
                                d={generateDiskPath(cscanResult.seekSequence)}
                                stroke="hsl(var(--primary))"
                                strokeWidth="2"
                                fill="none"
                              />
                            </svg>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Total Movement:</span> {cscanResult.totalHeadMovement} tracks</p>
                            <p><span className="font-medium">Avg Seek Time:</span> {cscanResult.avgSeekTime.toFixed(2)} tracks</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Performance Comparison</CardTitle>
                      <CardDescription>Compare metrics across algorithms</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="relative h-40">
                          <div className="absolute inset-0 flex items-end justify-around gap-4">
                            {[
                              { name: 'FCFS', result: fcfsResult, color: 'bg-blue-500' },
                              { name: 'SSTF', result: sstfResult, color: 'bg-green-500' },
                              { name: 'SCAN', result: scanResult, color: 'bg-purple-500' },
                              { name: 'C-SCAN', result: cscanResult, color: 'bg-orange-500' }
                            ].map((algo) => (
                              <div key={algo.name} className="flex flex-col items-center w-1/5">
                                <div
                                  className={`w-full ${algo.color} rounded-t-md transition-all duration-500`}
                                  style={{
                                    height: `${(algo.result.totalHeadMovement / 400) * 100}%`
                                  }}
                                ></div>
                                <span className="mt-2 text-xs">{algo.name}</span>
                              </div>
                            ))}
                          </div>
                          <div className="absolute left-0 right-0 top-0 flex justify-between text-xs text-muted-foreground">
                            <span>Total Head Movement</span>
                            <span>Lower is better</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <Card className="p-4">
                            <h4 className="font-medium mb-2">Key Characteristics</h4>
                            <ul className="space-y-2 text-sm">
                              <li><span className="font-medium">FCFS:</span> Simple but may cause excessive head movement</li>
                              <li><span className="font-medium">SSTF:</span> Minimizes total head movement but may cause starvation</li>
                              <li><span className="font-medium">SCAN:</span> Prevents starvation, good for heavy loads</li>
                              <li><span className="font-medium">C-SCAN:</span> More uniform waiting time than SCAN</li>
                            </ul>
                          </Card>
                          <Card className="p-4">
                            <h4 className="font-medium mb-2">Best Use Cases</h4>
                            <ul className="space-y-2 text-sm">
                              <li><span className="font-medium">FCFS:</span> Light load, sequential access patterns</li>
                              <li><span className="font-medium">SSTF:</span> Random access patterns, low load</li>
                              <li><span className="font-medium">SCAN:</span> Heavy load, varied request patterns</li>
                              <li><span className="font-medium">C-SCAN:</span> Heavy load, uniform service requirements</li>
                            </ul>
                          </Card>
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
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
