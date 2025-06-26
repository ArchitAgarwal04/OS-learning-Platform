'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronRight, ChevronLeft, Play, Pause, RotateCcw, Plus, Trash, Cpu, Clock, Zap } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { trackVisualization } from "@/lib/analytics"

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
  const [animationSpeed, setAnimationSpeed] = useState<number>(1000)

  // Colors for processes
  const colors = [
    "bg-gradient-to-r from-blue-500 to-blue-600",
    "bg-gradient-to-r from-green-500 to-green-600",
    "bg-gradient-to-r from-purple-500 to-purple-600",
    "bg-gradient-to-r from-yellow-500 to-yellow-600",
    "bg-gradient-to-r from-red-500 to-red-600",
    "bg-gradient-to-r from-pink-500 to-pink-600",
    "bg-gradient-to-r from-indigo-500 to-indigo-600",
    "bg-gradient-to-r from-orange-500 to-orange-600",
  ]

  // Initialize default processes
  useEffect(() => {
    if (processes.length === 0) {
      const defaultProcesses: Process[] = [
        { id: "P1", arrivalTime: 0, burstTime: 4, color: colors[0] },
        { id: "P2", arrivalTime: 1, burstTime: 3, color: colors[1] },
        { id: "P3", arrivalTime: 2, burstTime: 5, color: colors[2] },
      ];
      setProcesses(defaultProcesses);
    }
  }, []);

  const updateReadyQueue = (time: number, runningProcess: ScheduleItem | null = null) => {
    const arrivedProcesses = processes
      .filter(p => {
        if (p.arrivalTime > time) return false;
        if (runningProcess?.id === p.id) return false;
        
        const lastExecution = [...schedule]
          .reverse()
          .find(s => s.id === p.id);
          
        if (lastExecution && lastExecution.end <= time) return false;
        
        return true;
      })
      .sort((a, b) => {
        if (algorithm === "sjf") {
          return a.burstTime - b.burstTime;
        }
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
          // Track visualization completion
          trackVisualization(algorithm, 'complete');
        }
      }, animationSpeed);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentTime, schedule, animationSpeed]);

  // Run the selected algorithm
  const runSimulation = () => {
    // Track the start of a new simulation
    trackVisualization(algorithm, 'start');
    
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
    const gantt: ScheduleItem[] = [];
    let currentTime = 0;

    for (let i = 0; i < sortedProcesses.length; i++) {
      if (currentTime < sortedProcesses[i].arrivalTime) {
        gantt.push({
          id: "Idle",
          start: currentTime,
          end: sortedProcesses[i].arrivalTime,
          color: "bg-gradient-to-r from-gray-300 to-gray-400",
        });
        currentTime = sortedProcesses[i].arrivalTime;
      }

      gantt.push({
        id: sortedProcesses[i].id,
        start: currentTime,
        end: currentTime + sortedProcesses[i].burstTime,
        color: sortedProcesses[i].color,
      });

      currentTime += sortedProcesses[i].burstTime;
    }

    return { schedule: gantt };
  };

  // SJF algorithm
  const runSJF = (): SimulationResult => {
    const processesCopy = processes.map<Process & { remaining: number }>((p) => ({
      ...p,
      remaining: p.burstTime,
    }));

    const gantt: ScheduleItem[] = [];
    let currentTime = 0;
    let completed = 0;

    while (completed !== processesCopy.length) {
      let shortestJob = -1;
      let minBurst = Number.POSITIVE_INFINITY;

      for (let i = 0; i < processesCopy.length; i++) {
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
          color: "bg-gradient-to-r from-gray-300 to-gray-400",
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

      currentTime += processesCopy[shortestJob].remaining;
      processesCopy[shortestJob].remaining = 0;
      completed++;
    }

    return { schedule: gantt };
  };

  // Round Robin algorithm
  const runRoundRobin = (): SimulationResult => {
    const processesCopy = processes.map<Process & { remaining: number }>((p) => ({
      ...p,
      remaining: p.burstTime,
    }));

    const gantt: ScheduleItem[] = [];
    let currentTime = 0;
    let completed = 0;

    processesCopy.sort((a, b) => a.arrivalTime - b.arrivalTime);
    const readyQueueRR: (Process & { remaining: number })[] = [];
    let i = 0;

    if (processesCopy.length > 0 && processesCopy[0].arrivalTime <= currentTime) {
      readyQueueRR.push(processesCopy[0]);
      i++;
    }

    while (completed !== processesCopy.length) {
      if (readyQueueRR.length === 0) {
        const nextArrival = processesCopy
          .filter((p) => p.remaining > 0 && p.arrivalTime > currentTime)
          .reduce((min, p) => Math.min(min, p.arrivalTime), Number.POSITIVE_INFINITY);

        gantt.push({
          id: "Idle",
          start: currentTime,
          end: nextArrival,
          color: "bg-gradient-to-r from-gray-300 to-gray-400",
        });

        currentTime = nextArrival;

        while (i < processesCopy.length && processesCopy[i].arrivalTime <= currentTime) {
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

      while (i < processesCopy.length && processesCopy[i].arrivalTime <= currentTime) {
        readyQueueRR.push(processesCopy[i]);
        i++;
      }

      if (current.remaining > 0) {
        readyQueueRR.push(current);
      } else {
        completed++;
      }
    }

    return { schedule: gantt };
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
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    
    // Track visualization interaction with Google Analytics
    if (newPlayingState) {
      trackVisualization(algorithm, 'start');
    } else {
      trackVisualization(algorithm, 'interact');
    }
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
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Process Configuration</h3>
          </div>
          <Button 
            size="sm" 
            onClick={addProcess}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Process
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Process ID</TableHead>
                <TableHead className="font-semibold">Arrival Time</TableHead>
                <TableHead className="font-semibold">Burst Time</TableHead>
                <TableHead className="font-semibold">Color Preview</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processes.map((process, index) => (
                <TableRow key={index} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{process.id}</TableCell>
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
                    <div className={`w-8 h-8 rounded-lg ${process.color} shadow-md`}></div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProcess(index)}
                      disabled={processes.length <= 1}
                      className="hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Time Quantum Input for RR */}
      {algorithm === "rr" && (
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="quantum" className="font-medium">Time Quantum:</Label>
            <Input
              id="quantum"
              type="number"
              min="1"
              value={quantum}
              onChange={(e) => setQuantum(Number.parseInt(e.target.value) || 1)}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">time units</span>
          </div>
        </Card>
      )}

      <Button 
        onClick={runSimulation} 
        className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-xl text-lg font-semibold"
      >
        <Zap className="h-5 w-5 mr-2" />
        Run {algorithm.toUpperCase()} Simulation
      </Button>

      {schedule.length > 0 && (
        <div className="space-y-6">
          {/* Enhanced Gantt Chart */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded"></div>
              <p className="text-lg font-semibold">Enhanced Gantt Chart</p>
            </div>
            
            <div className="relative h-20 border-2 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-inner">
              {schedule.map((proc, index) => {
                const width = ((proc.end - proc.start) / getMaxTime()) * 100;
                const left = (proc.start / getMaxTime()) * 100;
                const isActive = currentTime >= proc.start && currentTime < proc.end;
                const isPast = currentTime >= proc.end;

                return (
                  <div
                    key={`${proc.id}-${proc.start}-${index}`}
                    className={`absolute h-full flex items-center justify-center text-sm font-bold text-white transition-all duration-500 transform ${proc.color} ${
                      isActive ? 'scale-105 shadow-2xl ring-4 ring-yellow-400 z-10' : 
                      isPast ? 'opacity-70' : 'opacity-40'
                    }`}
                    style={{
                      width: `${width}%`,
                      left: `${left}%`,
                    }}
                  >
                    <div className="text-center">
                      <div className="text-lg">{proc.id}</div>
                      <div className="text-xs opacity-80">{proc.start}-{proc.end}</div>
                    </div>
                    {isActive && (
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                );
              })}

              {/* Current time marker */}
              <div
                className="absolute h-full w-1 bg-red-500 z-20 shadow-lg"
                style={{ left: `${(currentTime / getMaxTime()) * 100}%` }}
              >
                <div className="absolute -top-8 -left-6 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                  T: {currentTime}
                </div>
              </div>
            </div>

            <div className="flex justify-between text-sm mt-2 text-muted-foreground font-mono">
              <span>0</span>
              <span>{getMaxTime()}</span>
            </div>
          </Card>

          {/* Enhanced Ready Queue */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                <p className="text-lg font-semibold">Ready Queue</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
                <span className="text-sm font-mono font-bold">Time: {currentTime}</span>
              </div>
            </div>
            
            <div className="min-h-[4rem] p-4 border-2 border-dashed border-green-300 dark:border-green-700 rounded-xl bg-white dark:bg-gray-900 flex items-center">
              <div className="flex gap-3 flex-wrap">
                {readyQueue.length === 0 ? (
                  <div className="text-gray-500 italic flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    Queue is empty
                  </div>
                ) : (
                  readyQueue.map((process, index) => (
                    <div
                      key={`${process.id}-${index}`}
                      className={`px-4 py-3 rounded-xl text-white flex items-center gap-3 shadow-lg transform hover:scale-105 transition-all duration-200 ${process.color}`}
                    >
                      <span className="font-bold text-lg">{process.id}</span>
                      {algorithm === "sjf" && (
                        <div className="bg-black/20 px-2 py-1 rounded-full">
                          <span className="text-xs font-bold">BT: {process.burstTime}</span>
                        </div>
                      )}
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>

          {/* Enhanced Status and Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
              <p className="text-sm font-medium mb-2">Current Status</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-bold text-lg text-blue-600">{currentTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Running:</span>
                  <span className="font-bold text-lg text-blue-600">{getCurrentProcess()}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
              <p className="text-sm font-medium mb-2">Statistics</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Time:</span>
                  <span className="font-bold text-lg text-orange-600">{getMaxTime()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Progress:</span>
                  <span className="font-bold text-lg text-orange-600">
                    {((currentTime / getMaxTime()) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
              <p className="text-sm font-medium mb-2">Animation Speed</p>
              <div className="space-y-2">
                <Label htmlFor="animationSpeed" className="sr-only">Animation Speed</Label>
                <input
                  id="animationSpeed"
                  type="range"
                  min="100"
                  max="2000"
                  step="100"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                  title="Animation Speed Control"
                  aria-labelledby="animationSpeedLabel"
                />
                <div className="text-center text-sm font-mono text-purple-600">
                  {animationSpeed}ms
                </div>
              </div>
            </Card>
          </div>

          {/* Enhanced Playback Controls */}
          <div className="relative flex justify-center items-center min-h-[80px]">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={goToPrevStep} 
              disabled={currentTime === 0}
              className="absolute left-0 h-14 w-14 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <div className="flex items-center gap-4">
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
                className="h-16 w-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-200 bg-gradient-to-br from-green-500 to-blue-600 text-white border-0 hover:from-green-600 hover:to-blue-700"
              >
                {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setShowTableDialog(true)}
                className="shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0"
              >
                Show Metrics Table
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextStep}
              disabled={currentTime >= getMaxTime()}
              className="absolute right-0 h-14 w-14 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Progress Bar */}
          <Card className="p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium">Simulation Progress</span>
              <span className="font-mono">{currentTime} / {getMaxTime()}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${(currentTime / getMaxTime()) * 100}%` }}
              ></div>
            </div>
          </Card>
        </div>
      )}

      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-xl mb-4">Process Performance Metrics</DialogTitle>
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
                  <TableRow key={metrics.pid} className="hover:bg-muted/50">
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
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Average Waiting Time:</span>
                  <span className="ml-2 font-bold">
                    {processMetrics.length > 0 ? 
                      (processMetrics.reduce((sum, m) => sum + m.waitingTime, 0) / processMetrics.length).toFixed(2) 
                      : 0}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Average Turnaround Time:</span>
                  <span className="ml-2 font-bold">
                    {processMetrics.length > 0 ? 
                      (processMetrics.reduce((sum, m) => sum + m.turnaroundTime, 0) / processMetrics.length).toFixed(2) 
                      : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
