"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DiskSchedulingVisualizer } from "@/components/disk-scheduling-visualizer"
import { CodeBlock } from "@/components/code-block"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { TooltipHelper } from "@/components/tooltip-helper"

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
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>First Come First Serve (FCFS)</CardTitle>
                  <TooltipHelper content="FCFS serves disk requests in the order they arrive, without any optimization for seek time." />
                </div>
                <div className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium">Simple</div>
              </div>
              <CardDescription>Processes disk requests in the order they are received.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium mb-4">Algorithm Implementation</h3>
                  <CodeBlock
                    code={`function fcfs(requests, initialPosition) {
  const seekSequence = [];
  let totalSeekTime = 0;
  let currentPosition = initialPosition;

  for (const request of requests) {
    seekSequence.push({
      from: currentPosition,
      to: request,
      seekTime: Math.abs(request - currentPosition)
    });
    
    totalSeekTime += Math.abs(request - currentPosition);
    currentPosition = request;
  }

  return {
    seekSequence,
    totalSeekTime,
    averageSeekTime: totalSeekTime / requests.length
  };
}`}
                    language="javascript"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Visualization</h3>
                  <DiskSchedulingVisualizer algorithm="fcfs" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sstf">
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>Shortest Seek Time First (SSTF)</CardTitle>
                  <TooltipHelper content="SSTF selects the request with minimum seek time from the current head position. It provides better performance than FCFS but may cause starvation." />
                </div>
                <div className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">Efficient</div>
              </div>
              <CardDescription>Processes the request closest to the current head position.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium mb-4">Algorithm Implementation</h3>
                  <CodeBlock
                    code={`function sstf(requests, initialPosition) {
  const seekSequence = [];
  let totalSeekTime = 0;
  let currentPosition = initialPosition;
  const remaining = [...requests];

  while (remaining.length > 0) {
    // Find request with minimum seek time
    let minSeekTime = Infinity;
    let nextIndex = -1;

    remaining.forEach((request, index) => {
      const seekTime = Math.abs(request - currentPosition);
      if (seekTime < minSeekTime) {
        minSeekTime = seekTime;
        nextIndex = index;
      }
    });

    seekSequence.push({
      from: currentPosition,
      to: remaining[nextIndex],
      seekTime: minSeekTime
    });

    totalSeekTime += minSeekTime;
    currentPosition = remaining[nextIndex];
    remaining.splice(nextIndex, 1);
  }

  return {
    seekSequence,
    totalSeekTime,
    averageSeekTime: totalSeekTime / requests.length
  };
}`}
                    language="javascript"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Visualization</h3>
                  <DiskSchedulingVisualizer algorithm="sstf" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scan">
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>SCAN (Elevator Algorithm)</CardTitle>
                  <TooltipHelper content="SCAN moves the disk head in one direction servicing requests until it reaches the end, then reverses direction. Also known as the elevator algorithm." />
                </div>
                <div className="px-2 py-1 rounded-full bg-purple-500/10 text-purple-500 text-xs font-medium">Fair</div>
              </div>
              <CardDescription>Services requests in one direction until reaching the end, then reverses.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium mb-4">Algorithm Implementation</h3>
                  <CodeBlock
                    code={`function scan(requests, initialPosition, direction) {
  const seekSequence = [];
  let totalSeekTime = 0;
  let currentPosition = initialPosition;
  const sortedRequests = [...new Set(requests)].sort((a, b) => a - b);
  
  // Find the next request in the current direction
  const startIndex = direction 
    ? sortedRequests.findIndex(r => r >= currentPosition)
    : sortedRequests.findIndex(r => r >= currentPosition) - 1;

  // Process requests in the current direction
  const firstPart = direction 
    ? sortedRequests.slice(startIndex)
    : sortedRequests.slice(0, startIndex + 1).reverse();

  // Process remaining requests in the opposite direction
  const secondPart = direction
    ? sortedRequests.slice(0, startIndex).reverse()
    : sortedRequests.slice(startIndex + 1);

  const sequence = [...firstPart, ...secondPart];

  for (const request of sequence) {
    seekSequence.push({
      from: currentPosition,
      to: request,
      seekTime: Math.abs(request - currentPosition)
    });
    totalSeekTime += Math.abs(request - currentPosition);
    currentPosition = request;
  }

  return {
    seekSequence,
    totalSeekTime,
    averageSeekTime: totalSeekTime / requests.length
  };
}`}
                    language="javascript"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Visualization</h3>
                  <DiskSchedulingVisualizer algorithm="scan" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cscan">
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>C-SCAN (Circular SCAN)</CardTitle>
                  <TooltipHelper content="C-SCAN moves the disk head in one direction only, moving from one end to the other. After reaching the end, it quickly returns to the beginning without servicing requests." />
                </div>
                <div className="px-2 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-medium">Uniform</div>
              </div>
              <CardDescription>Provides more uniform waiting time by scanning in one direction only.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium mb-4">Algorithm Implementation</h3>
                  <CodeBlock
                    code={`function cscan(requests, initialPosition) {
  const seekSequence = [];
  let totalSeekTime = 0;
  let currentPosition = initialPosition;
  const sortedRequests = [...new Set(requests)].sort((a, b) => a - b);
  
  // Find starting point
  const startIndex = sortedRequests.findIndex(r => r >= currentPosition);
  
  // Process requests in one direction (increasing)
  const firstPart = sortedRequests.slice(startIndex);
  // Return to beginning and process remaining
  const secondPart = sortedRequests.slice(0, startIndex);

  const sequence = [...firstPart, ...secondPart];

  for (const request of sequence) {
    seekSequence.push({
      from: currentPosition,
      to: request,
      seekTime: Math.abs(request - currentPosition)
    });
    totalSeekTime += Math.abs(request - currentPosition);
    currentPosition = request;
  }

  return {
    seekSequence,
    totalSeekTime,
    averageSeekTime: totalSeekTime / requests.length
  };
}`}
                    language="javascript"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Visualization</h3>
                  <DiskSchedulingVisualizer algorithm="cscan" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}