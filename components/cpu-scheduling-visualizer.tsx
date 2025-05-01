"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronRight, ChevronLeft, Play, Pause, RotateCcw, Plus, Trash } from "lucide-react"

export function CPUSchedulingVisualizer({ algorithm = "fcfs" }) {
  const [processes, setProcesses] = useState([
    { id: "P1", arrivalTime: 0, burstTime: 5, color: "bg-blue-500" },
    { id: "P2", arrivalTime: 1, burstTime: 3, color: "bg-green-500" },
    { id: "P3", arrivalTime: 2, burstTime: 8, color: "bg-purple-500" },
    { id: "P4", arrivalTime: 3, burstTime: 2, color: "bg-yellow-500" },
  ])

  const [quantum, setQuantum] = useState(2)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000) // ms between steps
  const [schedule, setSchedule] = useState([])
  const [stats, setStats] = useState({})

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

  // Run the selected algorithm
  const runSimulation = () => {
    let result

    if (algorithm === "fcfs") {
      result = runFCFS()
    } else if (algorithm === "sjf") {
      result = runSJF()
    } else if (algorithm === "rr") {
      result = runRoundRobin()
    }

    setSchedule(result.gantt)
    setStats({
      avgWaitingTime: result.avgWaitingTime.toFixed(2),
      avgTurnaroundTime: result.avgTurnaroundTime.toFixed(2),
      waitingTime: result.waitingTime,
      turnaroundTime: result.turnaroundTime,
      completionTime: result.completionTime,
    })

    setCurrentTime(0)
  }

  // FCFS algorithm
  const runFCFS = () => {
    // Sort processes by arrival time
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime)

    const n = sortedProcesses.length
    const completionTime = new Array(n).fill(0)
    const turnaroundTime = new Array(n).fill(0)
    const waitingTime = new Array(n).fill(0)
    const gantt = []

    let currentTime = 0

    for (let i = 0; i < n; i++) {
      // If CPU is idle, move time to next arrival
      if (currentTime < sortedProcesses[i].arrivalTime) {
        gantt.push({
          id: "Idle",
          start: currentTime,
          end: sortedProcesses[i].arrivalTime,
          color: "bg-gray-300",
        })
        currentTime = sortedProcesses[i].arrivalTime
      }

      // Execute process
      gantt.push({
        id: sortedProcesses[i].id,
        start: currentTime,
        end: currentTime + sortedProcesses[i].burstTime,
        color: sortedProcesses[i].color,
      })

      // Update times
      completionTime[i] = currentTime + sortedProcesses[i].burstTime
      turnaroundTime[i] = completionTime[i] - sortedProcesses[i].arrivalTime
      waitingTime[i] = turnaroundTime[i] - sortedProcesses[i].burstTime

      currentTime = completionTime[i]
    }

    // Calculate averages
    const avgTurnaroundTime = turnaroundTime.reduce((a, b) => a + b, 0) / n
    const avgWaitingTime = waitingTime.reduce((a, b) => a + b, 0) / n

    return {
      completionTime,
      turnaroundTime,
      waitingTime,
      avgTurnaroundTime,
      avgWaitingTime,
      gantt,
    }
  }

  // SJF algorithm
  const runSJF = () => {
    // Create a copy of processes
    const processesCopy = processes.map((p) => ({
      ...p,
      remaining: p.burstTime,
    }))

    const n = processesCopy.length
    const completionTime = new Array(n).fill(0)
    const turnaroundTime = new Array(n).fill(0)
    const waitingTime = new Array(n).fill(0)
    const gantt = []

    let currentTime = 0
    let completed = 0

    while (completed !== n) {
      // Find process with minimum burst time among arrived processes
      let shortestJob = -1
      let minBurst = Number.POSITIVE_INFINITY

      for (let i = 0; i < n; i++) {
        if (
          processesCopy[i].arrivalTime <= currentTime &&
          processesCopy[i].remaining > 0 &&
          processesCopy[i].remaining < minBurst
        ) {
          minBurst = processesCopy[i].remaining
          shortestJob = i
        }
      }

      if (shortestJob === -1) {
        // No process available, move to next arrival
        const nextArrival = processesCopy
          .filter((p) => p.remaining > 0)
          .reduce((min, p) => Math.min(min, p.arrivalTime), Number.POSITIVE_INFINITY)

        gantt.push({
          id: "Idle",
          start: currentTime,
          end: nextArrival,
          color: "bg-gray-300",
        })

        currentTime = nextArrival
        continue
      }

      // Execute the shortest job
      gantt.push({
        id: processesCopy[shortestJob].id,
        start: currentTime,
        end: currentTime + processesCopy[shortestJob].remaining,
        color: processesCopy[shortestJob].color,
      })

      // Update times
      currentTime += processesCopy[shortestJob].remaining

      // Find index in original processes array
      const originalIndex = processes.findIndex((p) => p.id === processesCopy[shortestJob].id)

      completionTime[originalIndex] = currentTime
      turnaroundTime[originalIndex] = completionTime[originalIndex] - processesCopy[shortestJob].arrivalTime
      waitingTime[originalIndex] = turnaroundTime[originalIndex] - processesCopy[shortestJob].burstTime

      processesCopy[shortestJob].remaining = 0
      completed++
    }

    // Calculate averages
    const avgTurnaroundTime = turnaroundTime.reduce((a, b) => a + b, 0) / n
    const avgWaitingTime = waitingTime.reduce((a, b) => a + b, 0) / n

    return {
      completionTime,
      turnaroundTime,
      waitingTime,
      avgTurnaroundTime,
      avgWaitingTime,
      gantt,
    }
  }

  // Round Robin algorithm
  const runRoundRobin = () => {
    // Create a copy of processes
    const processesCopy = processes.map((p) => ({
      ...p,
      remaining: p.burstTime,
    }))

    const n = processesCopy.length
    const completionTime = new Array(n).fill(0)
    const turnaroundTime = new Array(n).fill(0)
    const waitingTime = new Array(n).fill(0)
    const gantt = []

    // Sort by arrival time
    processesCopy.sort((a, b) => a.arrivalTime - b.arrivalTime)

    let currentTime = 0
    let completed = 0
    const readyQueue = []

    // Add first process to ready queue
    if (processesCopy.length > 0 && processesCopy[0].arrivalTime <= currentTime) {
      readyQueue.push(processesCopy[0])
    }

    let i = 1

    while (completed !== n) {
      if (readyQueue.length === 0) {
        // No process in ready queue, move to next arrival
        const nextArrival = processesCopy
          .filter((p) => p.remaining > 0 && p.arrivalTime > currentTime)
          .reduce((min, p) => Math.min(min, p.arrivalTime), Number.POSITIVE_INFINITY)

        gantt.push({
          id: "Idle",
          start: currentTime,
          end: nextArrival,
          color: "bg-gray-300",
        })

        currentTime = nextArrival

        // Add newly arrived processes to ready queue
        while (i < n && processesCopy[i].arrivalTime <= currentTime) {
          readyQueue.push(processesCopy[i])
          i++
        }

        continue
      }

      // Get process from ready queue
      const current = readyQueue.shift()
      const executeTime = Math.min(quantum, current.remaining)

      // Execute process
      gantt.push({
        id: current.id,
        start: currentTime,
        end: currentTime + executeTime,
        color: current.color,
      })

      currentTime += executeTime
      current.remaining -= executeTime

      // Add newly arrived processes to ready queue
      while (i < n && processesCopy[i].arrivalTime <= currentTime) {
        readyQueue.push(processesCopy[i])
        i++
      }

      // If process is not completed, add back to ready queue
      if (current.remaining > 0) {
        readyQueue.push(current)
      } else {
        // Process completed
        completed++

        // Find index in original processes array
        const originalIndex = processes.findIndex((p) => p.id === current.id)

        completionTime[originalIndex] = currentTime
        turnaroundTime[originalIndex] = completionTime[originalIndex] - current.arrivalTime
        waitingTime[originalIndex] = turnaroundTime[originalIndex] - current.burstTime
      }
    }

    // Calculate averages
    const avgTurnaroundTime = turnaroundTime.reduce((a, b) => a + b, 0) / n
    const avgWaitingTime = waitingTime.reduce((a, b) => a + b, 0) / n

    return {
      completionTime,
      turnaroundTime,
      waitingTime,
      avgTurnaroundTime,
      avgWaitingTime,
      gantt,
    }
  }

  // Add a new process
  const addProcess = () => {
    const newId = `P${processes.length + 1}`
    const colorIndex = processes.length % colors.length

    setProcesses([
      ...processes,
      {
        id: newId,
        arrivalTime: 0,
        burstTime: 3,
        color: colors[colorIndex],
      },
    ])
  }

  // Remove a process
  const removeProcess = (index) => {
    if (processes.length > 1) {
      setProcesses(processes.filter((_, i) => i !== index))
    }
  }

  // Update process values
  const updateProcess = (index, field, value) => {
    const updatedProcesses = [...processes]
    updatedProcesses[index][field] = Number.parseInt(value) || 0
    setProcesses(updatedProcesses)
  }

  // Navigation functions
  const goToNextStep = () => {
    if (currentTime < getMaxTime()) {
      setCurrentTime(currentTime + 1)
    } else {
      setIsPlaying(false)
    }
  }

  const goToPrevStep = () => {
    if (currentTime > 0) {
      setCurrentTime(currentTime - 1)
    }
  }

  const resetSimulation = () => {
    setCurrentTime(0)
    setIsPlaying(false)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  // Get max time from schedule
  const getMaxTime = () => {
    return schedule.length > 0 ? Math.max(...schedule.map((s) => s.end)) : 0
  }

  // Get current running process
  const getCurrentProcess = () => {
    return schedule.find((p) => p.start <= currentTime && p.end > currentTime)?.id || "None"
  }

  // Auto-play effect
  useEffect(() => {
    let interval

    if (isPlaying && schedule.length > 0) {
      interval = setInterval(() => {
        if (currentTime < getMaxTime()) {
          setCurrentTime((prev) => prev + 1)
        } else {
          setIsPlaying(false)
        }
      }, speed)
    }

    return () => clearInterval(interval)
  }, [isPlaying, currentTime, schedule, speed])

  return (
    <div className="space-y-6">
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

        {algorithm === "rr" && (
          <div>
            <Label htmlFor="quantum">Time Quantum</Label>
            <Input
              id="quantum"
              type="number"
              min="1"
              value={quantum}
              onChange={(e) => setQuantum(Number.parseInt(e.target.value) || 1)}
              className="w-20"
            />
          </div>
        )}

        <Button onClick={runSimulation} className="w-full">
          Run Simulation
        </Button>
      </div>

      {schedule.length > 0 && (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium mb-2">Gantt Chart:</p>
            <div className="relative h-12 border rounded-md overflow-hidden">
              {schedule.map((proc) => {
                const width = ((proc.end - proc.start) / getMaxTime()) * 100
                const left = (proc.start / getMaxTime()) * 100

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
                )
              })}

              {/* Current time marker */}
              <div
                className="absolute h-full w-0.5 bg-red-500 z-10"
                style={{ left: `${(currentTime / getMaxTime()) * 100}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-xs mt-1">
              <span>0</span>
              <span>{getMaxTime()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-sm font-medium mb-2">Current Status:</p>
              <p>
                <span className="font-medium">Time:</span> {currentTime}
              </p>
              <p>
                <span className="font-medium">Running Process:</span> {getCurrentProcess()}
              </p>
            </Card>

            <Card className="p-4">
              <p className="text-sm font-medium mb-2">Statistics:</p>
              <p>
                <span className="font-medium">Avg. Waiting Time:</span> {stats.avgWaitingTime}
              </p>
              <p>
                <span className="font-medium">Avg. Turnaround Time:</span> {stats.avgTurnaroundTime}
              </p>
            </Card>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" size="icon" onClick={goToPrevStep} disabled={currentTime === 0}>
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
            <Button variant="outline" size="icon" onClick={goToNextStep} disabled={currentTime >= getMaxTime()}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
