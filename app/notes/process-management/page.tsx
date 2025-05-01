"use client"

import { Breadcrumbs } from "@/components/breadcrumbs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProcessManagementNotes() {
  return (
    <div className="container py-10">
      <Breadcrumbs
        items={[
          { label: "Notes", href: "/notes" },
          { label: "Process Management", href: "/notes/process-management", active: true },
        ]}
      />

      <h1 className="text-4xl font-bold mb-6 gradient-text">Process Management</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Understanding process management in operating systems, including process states, scheduling, and communication.
      </p>

      <div className="space-y-8">
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Process Concepts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                A process is a program in execution. It includes the program code (text section), current activity (program counter, registers), stack (temporary data), and heap (dynamically allocated memory).
              </p>
              <h3 className="text-xl font-semibold mt-4">Process States</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>New</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Process is being created</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Ready</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Process is waiting to be assigned to a processor</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Running</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Instructions are being executed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Waiting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Process is waiting for some event to occur</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Terminated</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Process has finished execution</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Process Control Block (PCB)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Process Control Block (PCB) is a data structure maintained by the operating system for each process. It contains important information needed for process management.
              </p>
              <CodeBlock
                code={`class ProcessControlBlock {
  constructor(pid) {
    this.processState = 'new';
    this.processID = pid;
    this.programCounter = 0;
    this.registers = new Map();
    this.memoryLimits = {
      start: 0,
      end: 0
    };
    this.openFiles = new Set();
    this.schedulingInfo = {
      priority: 0,
      lastCPUBurst: 0,
      totalCPUTime: 0
    };
  }

  updateState(newState) {
    this.processState = newState;
    this.schedulingInfo.lastStateChange = Date.now();
  }

  saveContext(registers, programCounter) {
    this.registers = new Map(registers);
    this.programCounter = programCounter;
  }
}`}
                language="javascript"
              />
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Process Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Process Creation</h3>
                  <CodeBlock
                    code={`function createProcess() {
  // Allocate PCB
  const pcb = new ProcessControlBlock(getNextPID());
  
  // Allocate memory
  const memoryAllocation = allocateMemory();
  pcb.memoryLimits = memoryAllocation;
  
  // Initialize process
  initializeProcess(pcb);
  
  // Add to ready queue
  readyQueue.push(pcb);
  return pcb.processID;
}`}
                    language="javascript"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Process Termination</h3>
                  <CodeBlock
                    code={`function terminateProcess(pid) {
  const pcb = findProcess(pid);
  if (!pcb) return false;
  
  // Close all files
  pcb.openFiles.forEach(closeFile);
  
  // Free allocated memory
  deallocateMemory(pcb.memoryLimits);
  
  // Remove from queues
  removeFromQueues(pcb);
  
  // Free PCB
  deletePCB(pcb);
  return true;
}`}
                    language="javascript"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Interprocess Communication (IPC)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Processes need to communicate with each other for cooperation and data sharing. The operating system provides various IPC mechanisms.
              </p>
              <div className="mt-4">
                <Tabs defaultValue="pipes">
                  <TabsList>
                    <TabsTrigger value="pipes">Pipes</TabsTrigger>
                    <TabsTrigger value="sharedmem">Shared Memory</TabsTrigger>
                    <TabsTrigger value="messages">Message Passing</TabsTrigger>
                  </TabsList>
                  <TabsContent value="pipes">
                    <h3 className="text-xl font-semibold mb-4">Pipes</h3>
                    <p className="mb-4">Allows communication between related processes through a unidirectional data channel.</p>
                    <CodeBlock
                      code={`// Create a pipe
const pipe = createPipe();

if (fork() === 0) {  // Child process
  closePipe(pipe.readEnd);
  writeToPipe(pipe.writeEnd, "Hello from child");
  closePipe(pipe.writeEnd);
} else {  // Parent process
  closePipe(pipe.writeEnd);
  const message = readFromPipe(pipe.readEnd);
  closePipe(pipe.readEnd);
  console.log(message);
}`}
                      language="javascript"
                    />
                  </TabsContent>
                  <TabsContent value="sharedmem">
                    <h3 className="text-xl font-semibold mb-4">Shared Memory</h3>
                    <p className="mb-4">Allows processes to share a region of memory for direct communication.</p>
                    <CodeBlock
                      code={`// Create shared memory segment
const shmid = createSharedMemory(1024);

if (fork() === 0) {  // Child process
  const sharedMem = attachSharedMemory(shmid);
  writeToMemory(sharedMem, "Hello from child");
  detachSharedMemory(sharedMem);
} else {  // Parent process
  const sharedMem = attachSharedMemory(shmid);
  const message = readFromMemory(sharedMem);
  detachSharedMemory(sharedMem);
  removeSharedMemory(shmid);
}`}
                      language="javascript"
                    />
                  </TabsContent>
                  <TabsContent value="messages">
                    <h3 className="text-xl font-semibold mb-4">Message Passing</h3>
                    <p className="mb-4">Allows processes to communicate through messages managed by the OS.</p>
                    <CodeBlock
                      code={`// Create message queue
const mqid = createMessageQueue();

if (fork() === 0) {  // Child process
  const message = {
    type: 1,
    data: "Hello from child"
  };
  sendMessage(mqid, message);
} else {  // Parent process
  const message = receiveMessage(mqid, 1);
  console.log(message.data);
  removeMessageQueue(mqid);
}`}
                      language="javascript"
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Threads and Concurrency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Threads are the units of execution within a process. Multiple threads share process resources but have their own execution state.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User-Level Threads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Managed by user-level thread library</li>
                      <li>Fast thread switching</li>
                      <li>Can't take advantage of multiprocessing</li>
                      <li>If one thread blocks, entire process blocks</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Kernel-Level Threads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Managed by the operating system</li>
                      <li>Slower thread switching</li>
                      <li>Can take advantage of multiprocessing</li>
                      <li>Independent thread blocking</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-semibold mb-4">Thread Creation Example</h3>
                <CodeBlock
                  code={`class ThreadExample {
  constructor() {
    this.sharedData = 0;
    this.mutex = new Mutex();
  }

  async worker(id) {
    for (let i = 0; i < 3; i++) {
      await this.mutex.acquire();
      try {
        // Critical section
        this.sharedData++;
        console.log(\`Thread \${id}: \${this.sharedData}\`);
      } finally {
        this.mutex.release();
      }
      // Simulate some work
      await sleep(Math.random() * 1000);
    }
  }

  async main() {
    const threads = [];
    for (let i = 0; i < 3; i++) {
      threads.push(this.worker(i));
    }
    await Promise.all(threads);
  }
}`}
                  language="javascript"
                />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}