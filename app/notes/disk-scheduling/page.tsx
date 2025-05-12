"use client"

import { Breadcrumbs } from "@/components/breadcrumbs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DiskSchedulingNotes() {
  return (
    <div className="container py-10">
      <Breadcrumbs
        items={[
          { label: "Notes", href: "/notes" },
          { label: "Disk Scheduling", href: "/notes/disk-scheduling", active: true },
        ]}
      />

      <h1 className="text-4xl font-bold mb-6 gradient-text">Disk Scheduling Algorithms</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Understanding disk scheduling algorithms and their impact on I/O performance.
      </p>

      <div className="space-y-8">
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Introduction to Disk Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Disk scheduling is an essential operating system function that manages I/O requests to the disk. The main goal is to minimize seek time, maximize throughput, and ensure fairness.
              </p>
              <h3 className="text-xl font-semibold mt-4">Key Concepts</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Seek Time: Time taken to move disk arm to the required track</li>
                <li>Rotational Latency: Time waiting for the disk to rotate to the desired sector</li>
                <li>Transfer Time: Time to transfer data between disk and memory</li>
                <li>Disk Access Time: Total time = Seek Time + Rotational Latency + Transfer Time</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>FCFS (First Come First Serve)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                FCFS is the simplest disk scheduling algorithm that serves requests in the order they arrive.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Simple to implement</li>
                <li>Fair to all requests</li>
                <li>High seek time for random requests</li>
                <li>May cause starvation of nearby requests</li>
              </ul>
              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">Example Implementation</h4>
                <CodeBlock
                  code={`function fcfs(requests, initialPosition) {
  let totalSeekTime = 0;
  let currentPosition = initialPosition;

  for (const request of requests) {
    // Calculate seek time for current request
    const seekTime = Math.abs(request - currentPosition);
    totalSeekTime += seekTime;
    
    // Move head to new position
    currentPosition = request;
  }

  return totalSeekTime;
}`}
                  language="javascript"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>SSTF (Shortest Seek Time First)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                SSTF selects the request that requires the least head movement from the current position.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Better average seek time than FCFS</li>
                <li>May cause starvation of requests</li>
                <li>Not necessarily optimal</li>
                <li>Favors middle tracks</li>
              </ul>
              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">Example Implementation</h4>
                <CodeBlock
                  code={`function sstf(requests, initialPosition) {
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

    // Process the selected request
    totalSeekTime += minSeekTime;
    currentPosition = remaining[nextIndex];
    remaining.splice(nextIndex, 1);
  }

  return totalSeekTime;
}`}
                  language="javascript"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>SCAN (Elevator Algorithm)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                SCAN moves the disk arm in one direction servicing requests until it reaches the end, then reverses direction.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Better performance than FCFS and SSTF</li>
                <li>No indefinite postponement</li>
                <li>Predictable behavior</li>
                <li>Not optimal for heavily loaded systems</li>
              </ul>
              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">Example Implementation</h4>
                <CodeBlock
                  code={`function scan(requests, initialPosition, direction) {
  const tracks = 200; // Assuming 200 tracks
  let totalSeekTime = 0;
  let currentPosition = initialPosition;
  
  // Sort requests
  const sortedRequests = [...new Set(requests)].sort((a, b) => a - b);
  
  if (direction === 'up') {
    // Service requests while moving up
    for (const request of sortedRequests) {
      if (request >= currentPosition) {
        totalSeekTime += Math.abs(request - currentPosition);
        currentPosition = request;
      }
    }
    
    // Move to the end and reverse
    if (currentPosition < tracks - 1) {
      totalSeekTime += (tracks - 1 - currentPosition);
      currentPosition = tracks - 1;
    }
    
    // Service remaining requests while moving down
    for (let i = sortedRequests.length - 1; i >= 0; i--) {
      if (sortedRequests[i] < initialPosition) {
        totalSeekTime += Math.abs(currentPosition - sortedRequests[i]);
        currentPosition = sortedRequests[i];
      }
    }
  }
  
  return totalSeekTime;
}`}
                  language="javascript"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>C-SCAN (Circular SCAN)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                C-SCAN moves in one direction only, returning to the beginning of the disk when it reaches the end.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>More uniform wait time than SCAN</li>
                <li>Better for systems with frequent requests</li>
                <li>Provides more uniform service</li>
                <li>Higher seek time than SCAN</li>
              </ul>
              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">Example Implementation</h4>
                <CodeBlock
                  code={`function cscan(requests, initialPosition) {
  const tracks = 200; // Assuming 200 tracks
  let totalSeekTime = 0;
  let currentPosition = initialPosition;
  
  // Sort requests
  const sortedRequests = [...new Set(requests)].sort((a, b) => a - b);
  
  // Find next request
  const startIndex = sortedRequests.findIndex(r => r >= currentPosition);
  
  // Service requests while moving up
  for (let i = startIndex; i < sortedRequests.length; i++) {
    totalSeekTime += Math.abs(sortedRequests[i] - currentPosition);
    currentPosition = sortedRequests[i];
  }
  
  // Move to the beginning
  if (startIndex > 0) {
    totalSeekTime += (tracks - 1 - currentPosition); // Move to end
    totalSeekTime += (tracks - 1); // Move to beginning
    currentPosition = 0;
    
    // Service remaining requests
    for (let i = 0; i < startIndex; i++) {
      totalSeekTime += Math.abs(sortedRequests[i] - currentPosition);
      currentPosition = sortedRequests[i];
    }
  }
  
  return totalSeekTime;
}`}
                  language="javascript"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Comparison of Algorithms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">Algorithm</th>
                      <th className="px-4 py-2 text-left">Advantages</th>
                      <th className="px-4 py-2 text-left">Disadvantages</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-2">FCFS</td>
                      <td className="px-4 py-2">
                        <ul className="list-disc pl-4">
                          <li>Simple implementation</li>
                          <li>Fair to all requests</li>
                        </ul>
                      </td>
                      <td className="px-4 py-2">
                        <ul className="list-disc pl-4">
                          <li>High seek time</li>
                          <li>Not optimal</li>
                        </ul>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2">SSTF</td>
                      <td className="px-4 py-2">
                        <ul className="list-disc pl-4">
                          <li>Better average seek time</li>
                          <li>Good for light loads</li>
                        </ul>
                      </td>
                      <td className="px-4 py-2">
                        <ul className="list-disc pl-4">
                          <li>Starvation possible</li>
                          <li>Not optimal</li>
                        </ul>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2">SCAN</td>
                      <td className="px-4 py-2">
                        <ul className="list-disc pl-4">
                          <li>No starvation</li>
                          <li>Lower variance in wait time</li>
                        </ul>
                      </td>
                      <td className="px-4 py-2">
                        <ul className="list-disc pl-4">
                          <li>Long wait for end sectors</li>
                          <li>Direction overhead</li>
                        </ul>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">C-SCAN</td>
                      <td className="px-4 py-2">
                        <ul className="list-disc pl-4">
                          <li>More uniform waiting time</li>
                          <li>Better for heavy loads</li>
                        </ul>
                      </td>
                      <td className="px-4 py-2">
                        <ul className="list-disc pl-4">
                          <li>Longer seek times</li>
                          <li>Higher overhead</li>
                        </ul>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}