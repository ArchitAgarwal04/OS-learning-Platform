"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

export function CPUSchedulingPreview() {
  const [currentTime, setCurrentTime] = useState(0)

  // Sample FCFS scheduling data
  const processes = [
    { id: "P1", arrivalTime: 0, burstTime: 5, color: "bg-blue-500" },
    { id: "P2", arrivalTime: 1, burstTime: 3, color: "bg-green-500" },
    { id: "P3", arrivalTime: 2, burstTime: 8, color: "bg-purple-500" },
    { id: "P4", arrivalTime: 3, burstTime: 2, color: "bg-yellow-500" },
  ]

  // FCFS schedule
  const schedule = [
    { id: "P1", start: 0, end: 5 },
    { id: "P2", start: 5, end: 8 },
    { id: "P3", start: 8, end: 16 },
    { id: "P4", start: 16, end: 18 },
  ]

  const maxTime = 18

  const handleNextStep = () => {
    setCurrentTime((prev) => (prev < maxTime ? prev + 1 : 0))
  }

  const getCurrentProcess = () => {
    return schedule.find((p) => p.start <= currentTime && p.end > currentTime)?.id || "Idle"
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>CPU Scheduling</CardTitle>
          <Badge variant="outline">FCFS Preview</Badge>
        </div>
        <CardDescription>Visualize how different CPU scheduling algorithms work</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Processes:</p>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="font-medium">Process</div>
            <div className="font-medium">Arrival</div>
            <div className="font-medium">Burst</div>
            <div className="font-medium">Color</div>

            {processes.map((process) => (
              <React.Fragment key={process.id}>
                <div>{process.id}</div>
                <div>{process.arrivalTime}</div>
                <div>{process.burstTime}</div>
                <div>
                  <div className={`w-4 h-4 rounded-full ${process.color}`}></div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium mb-2">Gantt Chart:</p>
          <div className="relative h-10 border rounded-md overflow-hidden">
            {schedule.map((proc) => {
              const process = processes.find((p) => p.id === proc.id)
              const width = ((proc.end - proc.start) / maxTime) * 100
              const left = (proc.start / maxTime) * 100

              return (
                <div
                  key={`${proc.id}-${proc.start}`}
                  className={`absolute h-full flex items-center justify-center text-xs text-white ${process?.color}`}
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
              style={{ left: `${(currentTime / maxTime) * 100}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-xs mt-1">
            <span>0</span>
            <span>{maxTime}</span>
          </div>

          <div className="mt-4 text-sm">
            <span className="font-medium">Current Time: </span>
            <span>{currentTime}</span>
            <br />
            <span className="font-medium">Running Process: </span>
            <span>{getCurrentProcess()}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleNextStep}>
          Next Step
        </Button>
        <Button asChild>
          <Link href="/cpu-scheduling" className="flex items-center">
            Explore More
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
