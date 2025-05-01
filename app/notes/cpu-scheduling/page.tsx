"use client"

import { Breadcrumbs } from "@/components/breadcrumbs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CPUSchedulingNotes() {
  return (
    <div className="container py-10">
      <Breadcrumbs
        items={[
          { label: "Notes", href: "/notes" },
          { label: "CPU Scheduling", href: "/notes/cpu-scheduling", active: true },
        ]}
      />

      <h1 className="text-4xl font-bold mb-6 gradient-text">CPU Scheduling</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Understanding CPU scheduling algorithms, their implementations, and their impact on system performance.
      </p>

      <div className="space-y-8">
        <section>
          <Card>
            <CardHeader>
              <CardTitle>CPU Scheduling Concepts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                CPU scheduling is the basis of multiprogrammed operating systems. By switching between processes,
                the operating system can make the computer more productive. The objective of multiprogramming
                is to have some process running at all times to maximize CPU utilization.
              </p>
              <h3 className="text-xl font-semibold mt-4">Key Terms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>CPU Burst</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Period of time during which a process is executing on the CPU</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>I/O Burst</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Period of time during which a process is waiting for I/O operations</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Turnaround Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Time from process submission to completion</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Waiting Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Total time spent waiting in the ready queue</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Scheduling Algorithms</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="fcfs">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="fcfs">FCFS</TabsTrigger>
                  <TabsTrigger value="sjf">SJF</TabsTrigger>
                  <TabsTrigger value="rr">Round Robin</TabsTrigger>
                  <TabsTrigger value="priority">Priority</TabsTrigger>
                </TabsList>

                <TabsContent value="fcfs">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">First-Come, First-Served (FCFS)</h3>
                    <p>
                      The simplest CPU scheduling algorithm. Processes are executed in the order they arrive.
                      FCFS is non-preemptive and can lead to the convoy effect where short processes wait
                      for a long process to complete.
                    </p>
                    <Tabs defaultValue="python" className="w-full">
                      <TabsList>
                        <TabsTrigger value="python">Python</TabsTrigger>
                        <TabsTrigger value="cpp">C++</TabsTrigger>
                        <TabsTrigger value="c">C</TabsTrigger>
                      </TabsList>

                      <TabsContent value="python">
                        <div className="space-y-4">
                          <h4 className="text-lg font-medium">Python Implementation</h4>
                          <CodeBlock
                            code={`def fcfs(processes):
    n = len(processes)
    completion_time = [0] * n
    turnaround_time = [0] * n
    waiting_time = [0] * n
    current_time = 0
    
    for i in range(n):
        if current_time < processes[i]['arrival_time']:
            current_time = processes[i]['arrival_time']
            
        completion_time[i] = current_time + processes[i]['burst_time']
        turnaround_time[i] = completion_time[i] - processes[i]['arrival_time']
        waiting_time[i] = turnaround_time[i] - processes[i]['burst_time']
        current_time = completion_time[i]
    
    return {
        'completion_time': completion_time,
        'turnaround_time': turnaround_time,
        'waiting_time': waiting_time,
        'avg_turnaround': sum(turnaround_time) / n,
        'avg_waiting': sum(waiting_time) / n
    }`}
                            language="python"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="cpp">
                        <div className="space-y-4">
                          <h4 className="text-lg font-medium">C++ Implementation</h4>
                          <CodeBlock
                            code={`#include <iostream>
#include <vector>
using namespace std;

struct Process {
    int id;
    int arrival_time;
    int burst_time;
};

struct FCFSResult {
    vector<int> completion_time;
    vector<int> turnaround_time;
    vector<int> waiting_time;
    float avg_turnaround;
    float avg_waiting;
};

FCFSResult fcfs(vector<Process>& processes) {
    int n = processes.size();
    FCFSResult result;
    result.completion_time.resize(n);
    result.turnaround_time.resize(n);
    result.waiting_time.resize(n);
    
    int current_time = 0;
    float total_turnaround = 0, total_waiting = 0;
    
    for (int i = 0; i < n; i++) {
        if (current_time < processes[i].arrival_time) {
            current_time = processes[i].arrival_time;
        }
        
        result.completion_time[i] = current_time + 
                                  processes[i].burst_time;
        result.turnaround_time[i] = result.completion_time[i] - 
                                   processes[i].arrival_time;
        result.waiting_time[i] = result.turnaround_time[i] - 
                                processes[i].burst_time;
        
        total_turnaround += result.turnaround_time[i];
        total_waiting += result.waiting_time[i];
        current_time = result.completion_time[i];
    }
    
    result.avg_turnaround = total_turnaround / n;
    result.avg_waiting = total_waiting / n;
    return result;
}`}
                            language="cpp"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="c">
                        <div className="space-y-4">
                          <h4 className="text-lg font-medium">C Implementation</h4>
                          <CodeBlock
                            code={`#include <stdio.h>

typedef struct {
    int id;
    int arrival_time;
    int burst_time;
} Process;

void fcfs(Process processes[], int n) {
    // Sort by arrival time (assuming already sorted)
    int completion_time[n];
    int turnaround_time[n];
    int waiting_time[n];
    int current_time = 0;
    float avg_turnaround = 0, avg_waiting = 0;
    
    for (int i = 0; i < n; i++) {
        if (current_time < processes[i].arrival_time) {
            current_time = processes[i].arrival_time;
        }
        
        completion_time[i] = current_time + 
                           processes[i].burst_time;
        turnaround_time[i] = completion_time[i] - 
                            processes[i].arrival_time;
        waiting_time[i] = turnaround_time[i] - 
                         processes[i].burst_time;
        
        avg_turnaround += turnaround_time[i];
        avg_waiting += waiting_time[i];
        current_time = completion_time[i];
    }
    
    avg_turnaround /= n;
    avg_waiting /= n;
    
    // Print results
    printf("Process\\tCompletion\\tTurnaround\\tWaiting\\n");
    for (int i = 0; i < n; i++) {
        printf("P%d\\t%d\\t\\t%d\\t\\t%d\\n", 
               processes[i].id,
               completion_time[i],
               turnaround_time[i],
               waiting_time[i]);
    }
    printf("Average Turnaround Time: %.2f\\n", avg_turnaround);
    printf("Average Waiting Time: %.2f\\n", avg_waiting);
}`}
                            language="c"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </TabsContent>

                <TabsContent value="sjf">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Shortest Job First (SJF)</h3>
                    <p>
                      Associates with each process the length of its next CPU burst. When the CPU is available,
                      it is assigned to the process that has the smallest next CPU burst. SJF is optimal but
                      difficult to implement since predicting the length of the next CPU burst is difficult.
                    </p>
                    <Tabs defaultValue="python" className="w-full">
                      <TabsList>
                        <TabsTrigger value="python">Python</TabsTrigger>
                        <TabsTrigger value="cpp">C++</TabsTrigger>
                        <TabsTrigger value="c">C</TabsTrigger>
                      </TabsList>

                      <TabsContent value="python">
                        <div className="space-y-4">
                          <h4 className="text-lg font-medium">Python Implementation</h4>
                          <CodeBlock
                            code={`def sjf(processes):
    n = len(processes)
    completion_time = [0] * n
    turnaround_time = [0] * n
    waiting_time = [0] * n
    
    # Create copy with remaining time
    remaining = [{
        'id': p['id'],
        'arrival_time': p['arrival_time'],
        'burst_time': p['burst_time'],
        'remaining': p['burst_time']
    } for p in processes]
    
    current_time = 0
    completed = 0
    
    while completed != n:
        shortest_job = -1
        min_burst = float('inf')
        
        # Find shortest job among arrived processes
        for i in range(n):
            if (remaining[i]['arrival_time'] <= current_time and
                remaining[i]['remaining'] > 0 and
                remaining[i]['remaining'] < min_burst):
                shortest_job = i
                min_burst = remaining[i]['remaining']
        
        if shortest_job == -1:
            current_time += 1
            continue
            
        # Execute process
        remaining[shortest_job]['remaining'] = 0
        completion_time[shortest_job] = current_time + min_burst
        turnaround_time[shortest_job] = (completion_time[shortest_job] - 
                                       processes[shortest_job]['arrival_time'])
        waiting_time[shortest_job] = (turnaround_time[shortest_job] - 
                                    processes[shortest_job]['burst_time'])
        
        current_time = completion_time[shortest_job]
        completed += 1
    
    return {
        'completion_time': completion_time,
        'turnaround_time': turnaround_time,
        'waiting_time': waiting_time,
        'avg_turnaround': sum(turnaround_time) / n,
        'avg_waiting': sum(waiting_time) / n
    }`}
                            language="python"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="cpp">
                        <div className="space-y-4">
                          <h4 className="text-lg font-medium">C++ Implementation</h4>
                          <CodeBlock
                            code={`#include <iostream>
#include <vector>
#include <climits>
using namespace std;

struct Process {
    int id;
    int arrival_time;
    int burst_time;
    int remaining_time;
};

struct SJFResult {
    vector<int> completion_time;
    vector<int> turnaround_time;
    vector<int> waiting_time;
    float avg_turnaround;
    float avg_waiting;
};

SJFResult sjf(vector<Process>& processes) {
    int n = processes.size();
    SJFResult result;
    result.completion_time.resize(n);
    result.turnaround_time.resize(n);
    result.waiting_time.resize(n);
    
    // Initialize remaining time
    for (auto& p : processes) {
        p.remaining_time = p.burst_time;
    }
    
    int current_time = 0;
    int completed = 0;
    float total_turnaround = 0, total_waiting = 0;
    
    while (completed != n) {
        int shortest_job = -1;
        int min_burst = INT_MAX;
        
        // Find shortest job among arrived processes
        for (int i = 0; i < n; i++) {
            if (processes[i].arrival_time <= current_time && 
                processes[i].remaining_time > 0 &&
                processes[i].remaining_time < min_burst) {
                shortest_job = i;
                min_burst = processes[i].remaining_time;
            }
        }
        
        if (shortest_job == -1) {
            current_time++;
            continue;
        }
        
        // Execute process
        processes[shortest_job].remaining_time = 0;
        result.completion_time[shortest_job] = current_time + min_burst;
        result.turnaround_time[shortest_job] = 
            result.completion_time[shortest_job] - 
            processes[shortest_job].arrival_time;
        result.waiting_time[shortest_job] = 
            result.turnaround_time[shortest_job] - 
            processes[shortest_job].burst_time;
        
        total_turnaround += result.turnaround_time[shortest_job];
        total_waiting += result.waiting_time[shortest_job];
        
        current_time = result.completion_time[shortest_job];
        completed++;
    }
    
    result.avg_turnaround = total_turnaround / n;
    result.avg_waiting = total_waiting / n;
    return result;
}`}
                            language="cpp"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="c">
                        <div className="space-y-4">
                          <h4 className="text-lg font-medium">C Implementation</h4>
                          <CodeBlock
                            code={`#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int id;
    int arrival_time;
    int burst_time;
    int remaining_time;
} Process;

void sjf(Process processes[], int n) {
    int current_time = 0;
    int completed = 0;
    int *completion_time = (int*)calloc(n, sizeof(int));
    int *turnaround_time = (int*)calloc(n, sizeof(int));
    int *waiting_time = (int*)calloc(n, sizeof(int));
    float avg_turnaround = 0, avg_waiting = 0;
    
    // Initialize remaining time
    for (int i = 0; i < n; i++) {
        processes[i].remaining_time = processes[i].burst_time;
    }
    
    while (completed != n) {
        int shortest_job = -1;
        int min_burst = __INT_MAX__;
        
        // Find shortest job among arrived processes
        for (int i = 0; i < n; i++) {
            if (processes[i].arrival_time <= current_time && 
                processes[i].remaining_time > 0 &&
                processes[i].remaining_time < min_burst) {
                shortest_job = i;
                min_burst = processes[i].remaining_time;
            }
        }
        
        if (shortest_job == -1) {
            current_time++;
            continue;
        }
        
        // Execute process
        processes[shortest_job].remaining_time = 0;
        completion_time[shortest_job] = current_time + min_burst;
        turnaround_time[shortest_job] = completion_time[shortest_job] - 
                                      processes[shortest_job].arrival_time;
        waiting_time[shortest_job] = turnaround_time[shortest_job] - 
                                   processes[shortest_job].burst_time;
        
        avg_turnaround += turnaround_time[shortest_job];
        avg_waiting += waiting_time[shortest_job];
        
        current_time = completion_time[shortest_job];
        completed++;
    }
    
    avg_turnaround /= n;
    avg_waiting /= n;
    
    // Print results
    printf("Process\\tCompletion\\tTurnaround\\tWaiting\\n");
    for (int i = 0; i < n; i++) {
        printf("P%d\\t%d\\t\\t%d\\t\\t%d\\n", 
               processes[i].id,
               completion_time[i],
               turnaround_time[i],
               waiting_time[i]);
    }
    printf("Average Turnaround Time: %.2f\\n", avg_turnaround);
    printf("Average Waiting Time: %.2f\\n", avg_waiting);
    
    free(completion_time);
    free(turnaround_time);
    free(waiting_time);
}`}
                            language="c"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </TabsContent>

                {/* Continue with other algorithms following the same pattern */}
              </Tabs>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Scheduling Criteria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>CPU scheduling algorithms are evaluated based on different criteria:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>CPU Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Keep the CPU as busy as possible, ideally 100%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Throughput</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Number of processes completed per time unit</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Response Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Time from request to first response</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}