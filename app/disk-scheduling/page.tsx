"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DiskSchedulingVisualizer } from "@/components/disk-scheduling-visualizer"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { TooltipHelper } from "@/components/tooltip-helper"
import { CodeBlock } from "@/components/code-block"

export default function DiskSchedulingPage() {
  return (
    <div className="container py-10">
      <Breadcrumbs items={[{ label: "Disk Scheduling", href: "/disk-scheduling", active: true }]} />

      <h1 className="text-4xl font-bold mb-6 gradient-text">Disk Scheduling Algorithms</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Visualize and understand how different disk scheduling algorithms work in operating systems.
      </p>

      <Tabs defaultValue="fcfs" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fcfs">FCFS</TabsTrigger>
          <TabsTrigger value="sstf">SSTF</TabsTrigger>
          <TabsTrigger value="scan">SCAN</TabsTrigger>
          <TabsTrigger value="cscan">C-SCAN</TabsTrigger>
        </TabsList>

        <TabsContent value="fcfs">
          <div className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>First Come First Serve (FCFS)</CardTitle>
                  <TooltipHelper content="FCFS processes disk access requests in the order they arrive, without any optimization." />
                </div>
                <CardDescription>
                  The simplest disk scheduling algorithm that serves requests in arrival order.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Implementation</h3>
                  <CodeBlock 
                    language="typescript" 
                    code={`function fcfs(requests: number[], initialPosition: number) {
  let currentPosition = initialPosition;
  let totalSeekTime = 0;
  const movements = [];

  for (const request of requests) {
    // Calculate seek time for current request
    const seekTime = Math.abs(request - currentPosition);
    totalSeekTime += seekTime;
    
    // Record the movement
    movements.push({ from: currentPosition, to: request });
    
    // Update current position
    currentPosition = request;
  }

  return { movements, totalSeekTime };
}`} 
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Visualization</h3>
                  <DiskSchedulingVisualizer algorithm="fcfs" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sstf">
          <div className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Shortest Seek Time First (SSTF)</CardTitle>
                  <TooltipHelper content="SSTF selects the request with the minimum seek time from the current head position." />
                </div>
                <CardDescription>
                  Optimizes total seek time by choosing the closest track at each step.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Implementation</h3>
                  <CodeBlock 
                    language="typescript" 
                    code={`function sstf(requests: number[], initialPosition: number) {
  let currentPosition = initialPosition;
  let totalSeekTime = 0;
  const movements = [];
  const remainingRequests = [...requests];

  while (remainingRequests.length > 0) {
    // Find the closest request to current position
    let nextIndex = 0;
    let minSeekTime = Math.abs(remainingRequests[0] - currentPosition);

    for (let i = 1; i < remainingRequests.length; i++) {
      const seekTime = Math.abs(remainingRequests[i] - currentPosition);
      if (seekTime < minSeekTime) {
        minSeekTime = seekTime;
        nextIndex = i;
      }
    }

    // Record movement and update total seek time
    const nextPosition = remainingRequests[nextIndex];
    movements.push({ from: currentPosition, to: nextPosition });
    totalSeekTime += minSeekTime;

    // Update current position and remove serviced request
    currentPosition = nextPosition;
    remainingRequests.splice(nextIndex, 1);
  }

  return { movements, totalSeekTime };
}`} 
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Visualization</h3>
                  <DiskSchedulingVisualizer algorithm="sstf" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scan">
          <div className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>SCAN (Elevator Algorithm)</CardTitle>
                  <TooltipHelper content="SCAN moves the disk head in one direction servicing requests until it reaches the end, then reverses direction." />
                </div>
                <CardDescription>
                  Services requests like an elevator, moving in one direction until the end before reversing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Implementation</h3>
                  <CodeBlock 
                    language="typescript" 
                    code={`function scan(requests: number[], initialPosition: number, direction: 'up' | 'down', maxTrack: number) {
  let currentPosition = initialPosition;
  let totalSeekTime = 0;
  const movements = [];
  const remainingRequests = [...requests].sort((a, b) => a - b);

  if (direction === 'up') {
    // Service requests while moving up
    while (remainingRequests.length > 0 && Math.max(...remainingRequests) >= currentPosition) {
      const nextRequest = remainingRequests.find(r => r >= currentPosition);
      if (nextRequest !== undefined) {
        const seekTime = Math.abs(nextRequest - currentPosition);
        movements.push({ from: currentPosition, to: nextRequest });
        totalSeekTime += seekTime;
        currentPosition = nextRequest;
        remainingRequests.splice(remainingRequests.indexOf(nextRequest), 1);
      }
    }

    // Move to the end if there are remaining requests
    if (remainingRequests.length > 0) {
      movements.push({ from: currentPosition, to: maxTrack });
      totalSeekTime += maxTrack - currentPosition;
      currentPosition = maxTrack;

      // Service remaining requests while moving down
      for (const request of remainingRequests.reverse()) {
        movements.push({ from: currentPosition, to: request });
        totalSeekTime += currentPosition - request;
        currentPosition = request;
      }
    }
  }

  return { movements, totalSeekTime };
}`} 
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Visualization</h3>
                  <DiskSchedulingVisualizer algorithm="scan" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cscan">
          <div className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>C-SCAN (Circular SCAN)</CardTitle>
                  <TooltipHelper content="C-SCAN moves in one direction only, returning to the beginning when it reaches the end." />
                </div>
                <CardDescription>
                  A variant of SCAN that provides more uniform waiting time by moving in one direction only.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Implementation</h3>
                  <CodeBlock 
                    language="typescript" 
                    code={`function cscan(requests: number[], initialPosition: number, maxTrack: number) {
  let currentPosition = initialPosition;
  let totalSeekTime = 0;
  const movements = [];
  const remainingRequests = [...requests].sort((a, b) => a - b);

  // Service requests while moving up
  while (remainingRequests.length > 0 && Math.max(...remainingRequests) >= currentPosition) {
    const nextRequest = remainingRequests.find(r => r >= currentPosition);
    if (nextRequest !== undefined) {
      const seekTime = Math.abs(nextRequest - currentPosition);
      movements.push({ from: currentPosition, to: nextRequest });
      totalSeekTime += seekTime;
      currentPosition = nextRequest;
      remainingRequests.splice(remainingRequests.indexOf(nextRequest), 1);
    }
  }

  // If there are remaining requests, move to max track, then to 0, then service remaining
  if (remainingRequests.length > 0) {
    // Move to end
    movements.push({ from: currentPosition, to: maxTrack });
    totalSeekTime += maxTrack - currentPosition;
    
    // Move back to beginning (seek time not counted as head moves instantly)
    movements.push({ from: maxTrack, to: 0 });
    currentPosition = 0;

    // Service remaining requests
    for (const request of remainingRequests) {
      movements.push({ from: currentPosition, to: request });
      totalSeekTime += request - currentPosition;
      currentPosition = request;
    }
  }

  return { movements, totalSeekTime };
}`} 
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Visualization</h3>
                  <DiskSchedulingVisualizer algorithm="cscan" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  )
}