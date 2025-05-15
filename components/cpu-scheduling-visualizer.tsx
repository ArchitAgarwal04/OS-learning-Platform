'use client'

'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronRight, ChevronLeft, Play, Pause, RotateCcw, Plus, Trash } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type Process = {
  id: string
  arrivalTime: number
  burstTime: number
  color?: string
}

type ScheduleItem = {
  id: string
  start: number
  end: number
  color?: string
}

type ProcessMetrics = {
  pid: string
  arrivalTime: number
  burstTime: number
  completionTime: number
  turnaroundTime: number
  waitingTime: number
}

type SimulationResult = {
  schedule: ScheduleItem[]
}

export default function CPUSchedulingVisualizer() {
  const [processes, setProcesses] = useState<Process[]>([])
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [algorithm, setAlgorithm] = useState<string>("fcfs")
  const [quantum, setQuantum] = useState<number>(2)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [readyQueue, setReadyQueue] = useState<Process[]>([])
  const [showTableDialog, setShowTableDialog] = useState<boolean>(false)

  // Initialize default processes
  useEffect(() => {
    if (processes.length === 0) {
      const defaultProcesses: Process[] = [
        { id: "P1", arrivalTime: 0, burstTime: 4, color: "bg-blue-500" },
        { id: "P2", arrivalTime: 1, burstTime: 3, color: "bg-green-500" },
        { id: "P3", arrivalTime: 2, burstTime: 5, color: "bg-purple-500" },
      ];
      setProcesses(defaultProcesses);
    }
  }, []); // Run only once on mount

  // Colors for processes
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

  // Initialize default processes
  useEffect(() => {
    const defaultProcesses = [
      { id: "P1", arrivalTime: 0, burstTime: 4, color: colors[0] },
      { id: "P2", arrivalTime: 1, burstTime: 3, color: colors[1] },
      { id: "P3", arrivalTime: 2, burstTime: 5, color: colors[2] },
    ];
    setProcesses(defaultProcesses);
  }, []);

  const updateReadyQueue = (time: number, runningProcess: ScheduleItem | null = null) => {
    // Get processes that have arrived but haven't completed
    const arrivedProcesses = processes
      .filter(p => {
        // Check if process has arrived
        if (p.arrivalTime > time) return false;
        
        // Skip currently running process
        if (runningProcess?.id === p.id) return false;
        
        // Check if process has completed by finding its last execution in the schedule
        const lastExecution = [...schedule]
          .reverse()
          .find(s => s.id === p.id);
          
        // If we found a last execution and it's completed (end time <= current time)
        // then don't include this process in ready queue
        if (lastExecution && lastExecution.end <= time) return false;
        
        // Process hasn't completed yet and should be in ready queue
        return true;
      })
      .sort((a, b) => {
        if (algorithm === "sjf") {
          // For SJF, sort by burst time
          return a.burstTime - b.burstTime;
        }
        // For FCFS and RR, sort by arrival time
        return a.arrivalTime - b.arrivalTime;
      });
    
    setReadyQueue(arrivedProcesses);
  };

  // Auto-play effect
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isPlaying && schedule.length > 0) {
      interval = setInterval(() => {
        if (currentTime < getMaxTime()) {
          setCurrentTime((prev) => {
            const newTime = prev + 1;
            const running = schedule.find(s => s.start <= newTime && s.end > newTime) || null;
            updateReadyQueue(newTime, running);
            return newTime;
          });
        } else {
          setIsPlaying(false);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentTime, schedule]);

  // Run the selected algorithm
  const runSimulation = () => {
    let result: SimulationResult | undefined;

    if (algorithm === "fcfs") {
      result = runFCFS();
    } else if (algorithm === "sjf") {
      result = runSJF();
    } else if (algorithm === "rr") {
      result = runRoundRobin();
    }

    if (result) {
      setSchedule(result.schedule);
      setCurrentTime(0);
      updateReadyQueue(0);
    }
  };

  // FCFS algorithm
  const runFCFS = (): SimulationResult => {
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    const n = sortedProcesses.length;
    const completionTime = new Array(n).fill(0);
    const turnaroundTime = new Array(n).fill(0);
    const waitingTime = new Array(n).fill(0);
    const gantt: ScheduleItem[] = [];
    let currentTime = 0;

    for (let i = 0; i < n; i++) {
      if (currentTime < sortedProcesses[i].arrivalTime) {
        gantt.push({
          id: "Idle",
          start: currentTime,
          end: sortedProcesses[i].arrivalTime,
          color: "bg-gray-300",
        });
        currentTime = sortedProcesses[i].arrivalTime;
      }

      gantt.push({
        id: sortedProcesses[i].id,
        start: currentTime,
        end: currentTime + sortedProcesses[i].burstTime,
        color: sortedProcesses[i].color,
      });

      completionTime[i] = currentTime + sortedProcesses[i].burstTime;
      turnaroundTime[i] = completionTime[i] - sortedProcesses[i].arrivalTime;
      waitingTime[i] = turnaroundTime[i] - sortedProcesses[i].burstTime;
      currentTime = completionTime[i];
    }

    return {
      schedule: gantt,
    };
  };

  // SJF algorithm
  const runSJF = (): SimulationResult => {
    const processesCopy = processes.map<Process & { remaining: number }>((p) => ({
      ...p,
      remaining: p.burstTime,
    }));

    const n = processesCopy.length;
    const completionTime = new Array(n).fill(0);
    const turnaroundTime = new Array(n).fill(0);
    const waitingTime = new Array(n).fill(0);
    const gantt: ScheduleItem[] = [];
    let currentTime = 0;
    let completed = 0;

    while (completed !== n) {
      let shortestJob = -1;
      let minBurst = Number.POSITIVE_INFINITY;

      for (let i = 0; i < n; i++) {
        if (
          processesCopy[i].arrivalTime <= currentTime &&
          processesCopy[i].remaining > 0 &&
          processesCopy[i].remaining < minBurst
        ) {
          minBurst = processesCopy[i].remaining;
          shortestJob = i;
        }
      }

      if (shortestJob === -1) {
        const nextArrival = processesCopy
          .filter((p) => p.remaining > 0)
          .reduce((min, p) => Math.min(min, p.arrivalTime), Number.POSITIVE_INFINITY);

        gantt.push({
          id: "Idle",
          start: currentTime,
          end: nextArrival,
          color: "bg-gray-300",
        });

        currentTime = nextArrival;
        continue;
      }

      gantt.push({
        id: processesCopy[shortestJob].id,
        start: currentTime,
        end: currentTime + processesCopy[shortestJob].remaining,
        color: processesCopy[shortestJob].color,
      });

      const originalIndex = processes.findIndex(
        (p) => p.id === processesCopy[shortestJob].id
      );

      completionTime[originalIndex] = currentTime + processesCopy[shortestJob].remaining;
      turnaroundTime[originalIndex] =
        completionTime[originalIndex] - processesCopy[shortestJob].arrivalTime;
      waitingTime[originalIndex] =
        turnaroundTime[originalIndex] - processesCopy[shortestJob].burstTime;

      currentTime += processesCopy[shortestJob].remaining;
      processesCopy[shortestJob].remaining = 0;
      completed++;
    }

    return {
      schedule: gantt,
    };
  };

  // Round Robin algorithm
  const runRoundRobin = (): SimulationResult => {
    const processesCopy = processes.map<Process & { remaining: number }>((p) => ({
      ...p,
      remaining: p.burstTime,
    }));

    const n = processesCopy.length;
    const completionTime = new Array(n).fill(0);
    const turnaroundTime = new Array(n).fill(0);
    const waitingTime = new Array(n).fill(0);
    const gantt: ScheduleItem[] = [];
    let currentTime = 0;
    let completed = 0;

    // Sort by arrival time
    processesCopy.sort((a, b) => a.arrivalTime - b.arrivalTime);
    const readyQueueRR: (Process & { remaining: number })[] = [];
    let i = 0;

    // Add first process to ready queue
    if (processesCopy.length > 0 && processesCopy[0].arrivalTime <= currentTime) {
      readyQueueRR.push(processesCopy[0]);
      i++;
    }

    while (completed !== n) {
      if (readyQueueRR.length === 0) {
        const nextArrival = processesCopy
          .filter((p) => p.remaining > 0 && p.arrivalTime > currentTime)
          .reduce((min, p) => Math.min(min, p.arrivalTime), Number.POSITIVE_INFINITY);

        gantt.push({
          id: "Idle",
          start: currentTime,
          end: nextArrival,
          color: "bg-gray-300",
        });

        currentTime = nextArrival;

        while (i < n && processesCopy[i].arrivalTime <= currentTime) {
          readyQueueRR.push(processesCopy[i]);
          i++;
        }

        continue;
      }

      const current = readyQueueRR.shift()!;
      const executeTime = Math.min(quantum, current.remaining);

      gantt.push({
        id: current.id,
        start: currentTime,
        end: currentTime + executeTime,
        color: current.color,
      });

      currentTime += executeTime;
      current.remaining -= executeTime;

      while (i < n && processesCopy[i].arrivalTime <= currentTime) {
        readyQueueRR.push(processesCopy[i]);
        i++;
      }

      if (current.remaining > 0) {
        readyQueueRR.push(current);
      } else {
        completed++;
        const originalIndex = processes.findIndex((p) => p.id === current.id);
        completionTime[originalIndex] = currentTime;
        turnaroundTime[originalIndex] = completionTime[originalIndex] - current.arrivalTime;
        waitingTime[originalIndex] = turnaroundTime[originalIndex] - current.burstTime;
      }
    }

    return {
      schedule: gantt,
    };
  };

  // Process management functions
  const addProcess = () => {
    const newId = `P${processes.length + 1}`;
    const colorIndex = processes.length % colors.length;

    setProcesses([
      ...processes,
      {
        id: newId,
        arrivalTime: 0,
        burstTime: 3,
        color: colors[colorIndex],
      },
    ]);
  };

  const removeProcess = (index: number) => {
    if (processes.length > 1) {
      setProcesses(processes.filter((_, i) => i !== index));
    }
  };

  const updateProcess = (index: number, field: keyof Pick<Process, 'arrivalTime' | 'burstTime'>, value: string) => {
    const updatedProcesses = [...processes];
    const parsedValue = Number.parseInt(value) || 0;
    updatedProcesses[index] = {
      ...updatedProcesses[index],
      [field]: parsedValue
    };
    setProcesses(updatedProcesses);
  };

  // Utility functions
  const getMaxTime = (): number => {
    return schedule.length > 0 ? Math.max(...schedule.map((s) => s.end)) : 0;
  };

  const getCurrentProcess = (): string => {
    return schedule.find((p) => p.start <= currentTime && p.end > currentTime)?.id || "None";
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Navigation functions
  const goToNextStep = () => {
    if (currentTime < getMaxTime()) {
      setCurrentTime(prev => {
        const newTime = prev + 1;
        const running = schedule.find(s => s.start <= newTime && s.end > newTime) || null;
        updateReadyQueue(newTime, running);
        return newTime;
      });
    } else {
      setIsPlaying(false);
    }
  };

  const goToPrevStep = () => {
    if (currentTime > 0) {
      setCurrentTime(prev => {
        const newTime = prev - 1;
        const running = schedule.find(s => s.start <= newTime && s.end > newTime) || null;
        updateReadyQueue(newTime, running);
        return newTime;
      });
    }
  };

  const resetSimulation = () => {
    setCurrentTime(0);
    setIsPlaying(false);
    updateReadyQueue(0);
  };

  const calculateProcessMetrics = (processId: string): ProcessMetrics | null => {
    const process = processes.find(p => p.id === processId)
    if (!process) return null

    const executions = schedule.filter(s => s.id === processId)
    if (!executions.length) return null

    const completionTime = Math.max(...executions.map(e => e.end))
    const turnaroundTime = completionTime - process.arrivalTime
    const burstTime = process.burstTime
    const waitingTime = turnaroundTime - burstTime

    return {
      pid: processId,
      arrivalTime: process.arrivalTime,
      burstTime,
      completionTime,
      turnaroundTime,
      waitingTime
    }
  }

  const processMetrics: ProcessMetrics[] = processes
    .map(p => calculateProcessMetrics(p.id))
    .filter((metrics): metrics is ProcessMetrics => metrics !== null)

  return (
    <div className="space-y-6">
      {/* Process Management Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Processes</h3>
          <Button size="sm" onClick={addProcess}>
            <Plus className="h-4 w-4 mr-2" /> Add Process
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Process ID</TableHead>
                <TableHead>Arrival Time</TableHead>
                <TableHead>Burst Time</TableHead>
                <TableHead>Color</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processes.map((process, index) => (
                <TableRow key={index}>
                  <TableCell>{process.id}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={process.arrivalTime}
                      onChange={(e) => updateProcess(index, "arrivalTime", e.target.value)}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={process.burstTime}
                      onChange={(e) => updateProcess(index, "burstTime", e.target.value)}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <div className={`w-6 h-6 rounded-full ${process.color}`}></div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProcess(index)}
                      disabled={processes.length <= 1}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Time Quantum Input for RR */}
      {algorithm === "rr" && (
        <div className="flex items-center gap-2">
          <Label htmlFor="quantum">Time Quantum</Label>
          <Input
            id="quantum"
            type="number"
            min="1"
            value={quantum}
            onChange={(e) => setQuantum(Number.parseInt(e.target.value) || 1)}
            className="w-24"
          />
        </div>
      )}

      <Button onClick={runSimulation} className="w-full">
        Run Simulation
      </Button>

      {schedule.length > 0 && (
        <div className="space-y-6">
          {/* Gantt Chart */}
          <Card className="p-4">
            <p className="text-sm font-medium mb-3">Gantt Chart</p>
            <div className="relative h-12 border rounded-md overflow-hidden bg-muted/30">
              {schedule.map((proc) => {
                const width = ((proc.end - proc.start) / getMaxTime()) * 100;
                const left = (proc.start / getMaxTime()) * 100;

                return (
                  <div
                    key={`${proc.id}-${proc.start}`}
                    className={`absolute h-full flex items-center justify-center text-xs text-white ${proc.color}`}
                    style={{
                      width: `${width}%`,
                      left: `${left}%`,
                      opacity: currentTime >= proc.start ? 1 : 0.3,
                    }}
                  >
                    {proc.id}
                  </div>
                );
              })}

              {/* Current time marker */}
              <div
                className="absolute h-full w-0.5 bg-red-500 z-10"
                style={{ left: `${(currentTime / getMaxTime()) * 100}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-xs mt-1 text-muted-foreground">
              <span>0</span>
              <span>{getMaxTime()}</span>
            </div>
          </Card>

          {/* Ready Queue */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Ready Queue</p>
              <span className="text-xs text-muted-foreground">
                Time: {currentTime}
              </span>
            </div>
            <div className="min-h-[3rem] p-2 border rounded-md bg-muted/30 flex items-center">
              <div className="flex gap-2 flex-wrap">
                {readyQueue.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Queue is empty</p>
                ) : (
                  readyQueue.map((process, index) => (
                    <div
                      key={`${process.id}-${index}`}
                      className={`px-3 py-1.5 rounded text-sm text-white flex items-center gap-2 ${process.color}`}
                    >
                      <span>{process.id}</span>
                      {algorithm === "sjf" && (
                        <span className="text-xs bg-black/20 px-1.5 py-0.5 rounded">
                          BT: {process.burstTime}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>

          {/* Status and Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-sm font-medium mb-2">Current Status</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{currentTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Running Process:</span>
                  <span className="font-medium">{getCurrentProcess()}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <p className="text-sm font-medium mb-2">Statistics</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg. Waiting Time:</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg. Turnaround Time:</span>
                  <span className="font-medium">0</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Playback Controls */}
          <div className="relative flex justify-center items-center min-h-[40px]">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={goToPrevStep} 
              disabled={currentTime === 0}
              className="absolute left-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={resetSimulation}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={togglePlayPause}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="outline" onClick={() => setShowTableDialog(true)}>
                Show Table
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={goToNextStep} 
              disabled={currentTime >= getMaxTime()}
              className="absolute right-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-xl mb-4">Process Metrics</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">PID</TableHead>
                  <TableHead className="font-semibold text-right">Arrival Time</TableHead>
                  <TableHead className="font-semibold text-right">Burst Time</TableHead>
                  <TableHead className="font-semibold text-right">Completion Time</TableHead>
                  <TableHead className="font-semibold text-right">Turnaround Time</TableHead>
                  <TableHead className="font-semibold text-right">Waiting Time</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {processMetrics.map((metrics) => (
                <TableRow key={metrics.pid}>
                  <TableCell className="font-medium">{metrics.pid}</TableCell>
                  <TableCell className="text-right">{metrics.arrivalTime}</TableCell>
                  <TableCell className="text-right">{metrics.burstTime}</TableCell>
                  <TableCell className="text-right">{metrics.completionTime}</TableCell>
                  <TableCell className="text-right">{metrics.turnaroundTime}</TableCell>
                  <TableCell className="text-right">{metrics.waitingTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
