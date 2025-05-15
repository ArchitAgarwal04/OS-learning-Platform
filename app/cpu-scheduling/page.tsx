import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CPUSchedulingVisualizer from "@/components/cpu-scheduling-visualizer"
import { CodeBlock } from "@/components/code-block"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { TooltipHelper } from "@/components/tooltip-helper"

export default function CPUSchedulingPage() {
  return (
    <div className="container py-10">
      <Breadcrumbs items={[{ label: "CPU Scheduling", href: "/cpu-scheduling", active: true }]} />

      <h1 className="text-4xl font-bold mb-6 gradient-text">CPU Scheduling Algorithms</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Visualize and understand how different CPU scheduling algorithms work in operating systems.
      </p>

      <Tabs defaultValue="fcfs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fcfs">FCFS</TabsTrigger>
          <TabsTrigger value="sjf">SJF</TabsTrigger>
          <TabsTrigger value="rr">Round Robin</TabsTrigger>
        </TabsList>

        <TabsContent value="fcfs">
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>First-Come-First-Served (FCFS)</CardTitle>
                  <TooltipHelper content="FCFS is the simplest scheduling algorithm. Processes are executed in the order they arrive in the ready queue. It's easy to implement but can lead to the convoy effect." />
                </div>
                <div className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium">Simple</div>
              </div>
              <CardDescription>Processes are executed in the order they arrive in the ready queue.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium mb-4">Algorithm Implementation</h3>
                  <CodeBlock
                    code={`function fcfs(processes) {
  // Sort processes by arrival time
  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
  
  const n = processes.length;
  const completionTime = new Array(n).fill(0);
  const turnaroundTime = new Array(n).fill(0);
  const waitingTime = new Array(n).fill(0);
  const gantt = [];
  
  let currentTime = 0;
  
  for (let i = 0; i < n; i++) {
    // If CPU is idle, move time to next arrival
    if (currentTime < processes[i].arrivalTime) {
      gantt.push({
        process: "Idle",
        start: currentTime,
        end: processes[i].arrivalTime
      });
      currentTime = processes[i].arrivalTime;
    }
    
    // Execute process
    gantt.push({
      process: processes[i].id,
      start: currentTime,
      end: currentTime + processes[i].burstTime
    });
    
    // Update times
    completionTime[i] = currentTime + processes[i].burstTime;
    turnaroundTime[i] = completionTime[i] - processes[i].arrivalTime;
    waitingTime[i] = turnaroundTime[i] - processes[i].burstTime;
    
    currentTime = completionTime[i];
  }
  
  // Calculate averages
  const avgTurnaroundTime = turnaroundTime.reduce((a, b) => a + b, 0) / n;
  const avgWaitingTime = waitingTime.reduce((a, b) => a + b, 0) / n;
  
  return {
    completionTime,
    turnaroundTime,
    waitingTime,
    avgTurnaroundTime,
    avgWaitingTime,
    gantt
  };
}`}
                    language="javascript"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Visualization</h3>
                  <CPUSchedulingVisualizer algorithm="fcfs" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sjf">
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>Shortest Job First (SJF)</CardTitle>
                  <TooltipHelper content="SJF selects the process with the smallest burst time. It provides optimal average waiting time but requires knowing the burst time in advance." />
                </div>
                <div className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                  Efficient
                </div>
              </div>
              <CardDescription>
                The process with the smallest burst time is selected for execution next.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium mb-4">Algorithm Implementation</h3>
                  <CodeBlock
                    code={`function sjf(processes) {
  // Create a copy of processes to avoid modifying the original
  const processesCopy = JSON.parse(JSON.stringify(processes));
  
  const n = processesCopy.length;
  const completionTime = new Array(n).fill(0);
  const turnaroundTime = new Array(n).fill(0);
  const waitingTime = new Array(n).fill(0);
  const gantt = [];
  
  let currentTime = 0;
  let completed = 0;
  let shortestJob = -1;
  let minBurst = Infinity;
  let check = false;
  
  // Process until all processes are completed
  while (completed !== n) {
    // Find process with minimum burst time among arrived processes
    for (let i = 0; i < n; i++) {
      if (
        processesCopy[i].arrivalTime <= currentTime && 
        processesCopy[i].remaining > 0 && 
        processesCopy[i].remaining < minBurst
      ) {
        minBurst = processesCopy[i].remaining;
        shortestJob = i;
        check = true;
      }
    }
    
    if (!check) {
      // No process available, move to next arrival
      const nextArrival = processesCopy
        .filter(p => p.remaining > 0)
        .reduce((min, p) => Math.min(min, p.arrivalTime), Infinity);
      
      gantt.push({
        process: "Idle",
        start: currentTime,
        end: nextArrival
      });
      
      currentTime = nextArrival;
      continue;
    }
    
    // Execute the shortest job
    gantt.push({
      process: processesCopy[shortestJob].id,
      start: currentTime,
      end: currentTime + processesCopy[shortestJob].remaining
    });
    
    // Update times
    currentTime += processesCopy[shortestJob].remaining;
    processesCopy[shortestJob].remaining = 0;
    completed++;
    
    completionTime[shortestJob] = currentTime;
    turnaroundTime[shortestJob] = completionTime[shortestJob] - processesCopy[shortestJob].arrivalTime;
    waitingTime[shortestJob] = turnaroundTime[shortestJob] - processesCopy[shortestJob].burstTime;
    
    // Reset for next iteration
    minBurst = Infinity;
    check = false;
  }
  
  // Calculate averages
  const avgTurnaroundTime = turnaroundTime.reduce((a, b) => a + b, 0) / n;
  const avgWaitingTime = waitingTime.reduce((a, b) => a + b, 0) / n;
  
  return {
    completionTime,
    turnaroundTime,
    waitingTime,
    avgTurnaroundTime,
    avgWaitingTime,
    gantt
  };
}`}
                    language="javascript"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Visualization</h3>
                  <CPUSchedulingVisualizer algorithm="sjf" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rr">
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>Round Robin (RR)</CardTitle>
                  <TooltipHelper content="Round Robin assigns a fixed time slice to each process in a cyclic way. It provides good response time for interactive systems but has higher context switching overhead." />
                </div>
                <div className="px-2 py-1 rounded-full bg-purple-500/10 text-purple-500 text-xs font-medium">Fair</div>
              </div>
              <CardDescription>Each process is assigned a fixed time slice in a cyclic way.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium mb-4">Algorithm Implementation</h3>
                  <CodeBlock
                    code={`function roundRobin(processes, quantum) {
  // Create a copy of processes to avoid modifying the original
  const processesCopy = JSON.parse(JSON.stringify(processes));
  processesCopy.forEach(p => p.remaining = p.burstTime);
  
  const n = processesCopy.length;
  const completionTime = new Array(n).fill(0);
  const turnaroundTime = new Array(n).fill(0);
  const waitingTime = new Array(n).fill(0);
  const gantt = [];
  
  // Sort by arrival time
  processesCopy.sort((a, b) => a.arrivalTime - b.arrivalTime);
  
  let currentTime = 0;
  let completed = 0;
  const readyQueue = [];
  let index = 0;
  
  // Add first process to ready queue
  if (processesCopy.length > 0) {
    readyQueue.push(0);
    index = 1;
  }
  
  while (completed !== n) {
    if (readyQueue.length === 0) {
      // No process in ready queue, move to next arrival
      const nextArrival = processesCopy
        .filter(p => p.remaining > 0 && p.arrivalTime > currentTime)
        .reduce((min, p) => Math.min(min, p.arrivalTime), Infinity);
      
      gantt.push({
        process: "Idle",
        start: currentTime,
        end: nextArrival
      });
      
      currentTime = nextArrival;
      
      // Add newly arrived processes to ready queue
      while (index < n && processesCopy[index].arrivalTime <= currentTime) {
        readyQueue.push(index);
        index++;
      }
      
      continue;
    }
    
    // Get process from ready queue
    const current = readyQueue.shift();
    const executeTime = Math.min(quantum, processesCopy[current].remaining);
    
    // Execute process
    gantt.push({
      process: processesCopy[current].id,
      start: currentTime,
      end: currentTime + executeTime
    });
    
    currentTime += executeTime;
    processesCopy[current].remaining -= executeTime;
    
    // Add newly arrived processes to ready queue
    while (index < n && processesCopy[index].arrivalTime <= currentTime) {
      readyQueue.push(index);
      index++;
    }
    
    // If process is not completed, add back to ready queue
    if (processesCopy[current].remaining > 0) {
      readyQueue.push(current);
    } else {
      // Process completed
      completed++;
      completionTime[current] = currentTime;
      turnaroundTime[current] = completionTime[current] - processesCopy[current].arrivalTime;
      waitingTime[current] = turnaroundTime[current] - processesCopy[current].burstTime;
    }
  }
  
  // Calculate averages
  const avgTurnaroundTime = turnaroundTime.reduce((a, b) => a + b, 0) / n;
  const avgWaitingTime = waitingTime.reduce((a, b) => a + b, 0) / n;
  
  return {
    completionTime,
    turnaroundTime,
    waitingTime,
    avgTurnaroundTime,
    avgWaitingTime,
    gantt
  };
}`}
                    language="javascript"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Visualization</h3>
                  <CPUSchedulingVisualizer algorithm="rr" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
