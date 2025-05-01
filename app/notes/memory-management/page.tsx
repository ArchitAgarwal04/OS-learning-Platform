"use client"

import { Breadcrumbs } from "@/components/breadcrumbs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MemoryManagementNotes() {
  return (
    <div className="container py-10">
      <Breadcrumbs
        items={[
          { label: "Notes", href: "/notes" },
          { label: "Memory Management", href: "/notes/memory-management", active: true },
        ]}
      />

      <h1 className="text-4xl font-bold mb-6 gradient-text">Memory Management</h1>
      <p className="text-lg text-muted-foreground mb-8">
        A comprehensive guide to understanding memory management techniques in operating systems.
      </p>

      <div className="space-y-8">
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Introduction to Memory Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Memory management is a crucial function of operating systems that handles the allocation and deallocation of memory to processes. It ensures efficient use of memory while maintaining isolation between processes.
              </p>
              <h3 className="text-xl font-semibold mt-4">Key Concepts</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Physical vs Virtual Memory: Understanding the difference between actual hardware memory and virtual address space</li>
                <li>Memory Allocation: Methods for allocating memory to processes</li>
                <li>Memory Protection: Ensuring processes can't access each other's memory space</li>
                <li>Memory Fragmentation: Internal and external fragmentation issues</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Memory Allocation Algorithms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Memory allocation algorithms determine how to allocate memory blocks to processes. Each algorithm has its advantages and trade-offs.
              </p>
              <div className="mt-4">
                <Tabs defaultValue="firstfit">
                  <TabsList>
                    <TabsTrigger value="firstfit">First Fit</TabsTrigger>
                    <TabsTrigger value="bestfit">Best Fit</TabsTrigger>
                    <TabsTrigger value="worstfit">Worst Fit</TabsTrigger>
                  </TabsList>
                  <TabsContent value="firstfit">
                    <h3 className="text-xl font-semibold mb-4">First Fit Algorithm</h3>
                    <p className="mb-4">Allocates the first available memory block that is large enough to accommodate the process.</p>
                    <CodeBlock
                      code={`function firstFit(blocks, processes) {
  const allocation = new Array(processes.length).fill(-1);
  
  // For each process
  for (let i = 0; i < processes.length; i++) {
    // Find the first block that can accommodate the process
    for (let j = 0; j < blocks.length; j++) {
      if (blocks[j] >= processes[i]) {
        allocation[i] = j;
        blocks[j] -= processes[i];
        break;
      }
    }
  }
  return allocation;
}`}
                      language="javascript"
                    />
                  </TabsContent>
                  <TabsContent value="bestfit">
                    <h3 className="text-xl font-semibold mb-4">Best Fit Algorithm</h3>
                    <p className="mb-4">Allocates the smallest available memory block that can accommodate the process.</p>
                    <CodeBlock
                      code={`function bestFit(blocks, processes) {
  const allocation = new Array(processes.length).fill(-1);
  
  // For each process
  for (let i = 0; i < processes.length; i++) {
    let bestIdx = -1;
    for (let j = 0; j < blocks.length; j++) {
      if (blocks[j] >= processes[i]) {
        if (bestIdx === -1) {
          bestIdx = j;
        } else if (blocks[j] < blocks[bestIdx]) {
          bestIdx = j;
        }
      }
    }
    
    if (bestIdx !== -1) {
      allocation[i] = bestIdx;
      blocks[bestIdx] -= processes[i];
    }
  }
  return allocation;
}`}
                      language="javascript"
                    />
                  </TabsContent>
                  <TabsContent value="worstfit">
                    <h3 className="text-xl font-semibold mb-4">Worst Fit Algorithm</h3>
                    <p className="mb-4">Allocates the largest available memory block to the process.</p>
                    <CodeBlock
                      code={`function worstFit(blocks, processes) {
  const allocation = new Array(processes.length).fill(-1);
  
  // For each process
  for (let i = 0; i < processes.length; i++) {
    let worstIdx = -1;
    for (let j = 0; j < blocks.length; j++) {
      if (blocks[j] >= processes[i]) {
        if (worstIdx === -1) {
          worstIdx = j;
        } else if (blocks[j] > blocks[worstIdx]) {
          worstIdx = j;
        }
      }
    }
    
    if (worstIdx !== -1) {
      allocation[i] = worstIdx;
      blocks[worstIdx] -= processes[i];
    }
  }
  return allocation;
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
              <CardTitle>Memory Fragmentation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Memory fragmentation occurs when memory is divided into small pieces that become difficult to use effectively. There are two types of fragmentation:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Internal Fragmentation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Occurs when memory is allocated in fixed-size blocks and the allocated block is larger than the required memory. The unused memory within an allocated block is wasted.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>External Fragmentation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Occurs when free memory is broken into small pieces between allocated memory blocks. Although total free memory might be sufficient, it's not contiguous and can't be allocated to processes requiring larger blocks.</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Memory Management Techniques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Paging</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Divides physical memory into fixed-size frames</li>
                      <li>Divides logical memory into pages of the same size</li>
                      <li>No external fragmentation</li>
                      <li>May have internal fragmentation</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Segmentation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Divides memory into variable-sized segments</li>
                      <li>Each segment represents a logical unit (e.g., code, data, stack)</li>
                      <li>No internal fragmentation</li>
                      <li>May have external fragmentation</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Virtual Memory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Virtual memory is a memory management technique that provides an idealized abstraction of the storage resources that are actually available on a given machine.
              </p>
              <h3 className="text-xl font-semibold">Benefits</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Allows programs to be larger than physical memory</li>
                <li>Provides memory protection between processes</li>
                <li>Allows sharing of memory between processes</li>
                <li>More efficient use of physical memory</li>
              </ul>
              <div className="mt-4">
                <h3 className="text-xl font-semibold mb-4">Memory Translation Process</h3>
                <CodeBlock
                  code={`class VirtualMemory {
  translateAddress(virtualAddress) {
    const pageNumber = Math.floor(virtualAddress / PAGE_SIZE);
    const offset = virtualAddress % PAGE_SIZE;
    
    // Check if page is in memory
    if (!pageTable.has(pageNumber)) {
      handlePageFault(pageNumber);
    }
    
    const frameNumber = pageTable.get(pageNumber);
    return (frameNumber * PAGE_SIZE) + offset;
  }
  
  handlePageFault(pageNumber) {
    // Find a free frame or select victim frame
    const frame = selectFrame();
    
    if (frame.isDirty) {
      writeBackToDisk(frame);
    }
    
    // Load page from disk
    loadPageFromDisk(pageNumber, frame);
    updatePageTable(pageNumber, frame.number);
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