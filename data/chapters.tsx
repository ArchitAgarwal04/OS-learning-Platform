
import React from "react";

export interface ChapterContent {
  id: string;
  title: string;
  content: React.ReactNode;
}

export const chaptersData = [
  {
    id: "intro",
    title: "Introduction to OS",
    description: "Basic concepts, history and functions of operating systems",
    icon: "BookOpen",
    content: (
      <>
        <h2 className="content-subtitle">What is an Operating System?</h2>
        <p className="content-paragraph">
          An operating system (OS) is system software that manages computer hardware, software resources, and provides common services for computer programs. It acts as an intermediary between users and the computer hardware.
        </p>
        
        <h2 className="content-subtitle">Functions of an Operating System</h2>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>Process Management: Creating, scheduling, and terminating processes</li>
          <li>Memory Management: Allocation and deallocation of memory to processes</li>
          <li>File System Management: Organization, storage, retrieval, naming, and protection of files</li>
          <li>Device Management: Managing I/O devices and providing interface for users</li>
          <li>Security and Protection: Protecting system resources and user data</li>
        </ul>
        
        <h2 className="content-subtitle">Types of Operating Systems</h2>
        <p className="content-paragraph">
          1. <strong>Batch OS</strong>: Jobs with similar requirements are batched together and processed.
          <br />
          2. <strong>Time-Sharing OS</strong>: Enables multiple users to share computer resources.
          <br />
          3. <strong>Distributed OS</strong>: Manages a group of connected computers.
          <br />
          4. <strong>Network OS</strong>: Runs on a server to manage data, users, and devices.
          <br />
          5. <strong>Real-Time OS</strong>: For time-critical applications where data must be processed within strict time constraints.
        </p>
      </>
    ),
  },
  {
    id: "process-management",
    title: "Process Management",
    description: "Process states, PCBs, and operations on processes",
    icon: "Layers",
    content: (
      <>
        <h2 className="content-subtitle">What is a Process?</h2>
        <p className="content-paragraph">
          A process is an instance of a program in execution. It is a unit of work within the system. Each process has its own memory space, system resources, and security attributes.
        </p>
        
        <h2 className="content-subtitle">Process States</h2>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li><strong>New</strong>: The process is being created</li>
          <li><strong>Ready</strong>: The process is waiting to be assigned to a processor</li>
          <li><strong>Running</strong>: Instructions are being executed</li>
          <li><strong>Waiting</strong>: The process is waiting for some event to occur</li>
          <li><strong>Terminated</strong>: The process has finished execution</li>
        </ul>
        
        <h2 className="content-subtitle">Process Control Block (PCB)</h2>
        <p className="content-paragraph">
          The PCB is a data structure that contains information about the process, including:
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>Process ID</li>
          <li>Process State</li>
          <li>Program Counter</li>
          <li>CPU Registers</li>
          <li>CPU Scheduling Information</li>
          <li>Memory Management Information</li>
          <li>I/O Status Information</li>
        </ul>
      </>
    ),
  },
  {
    id: "threads-concurrency",
    title: "Threads and Concurrency",
    description: "Multithreading models and thread synchronization",
    icon: "Split",
    content: (
      <>
        <h2 className="content-subtitle">Introduction to Threads</h2>
        <p className="content-paragraph">
          A thread is a basic unit of CPU utilization. It comprises a thread ID, program counter, register set, and stack. It shares resources with other threads belonging to the same process.
        </p>
        
        <h2 className="content-subtitle">Benefits of Multithreading</h2>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>Responsiveness: Applications continue running even if part is blocked</li>
          <li>Resource Sharing: Threads share memory and resources of the process</li>
          <li>Economy: Creating and context-switching threads is less costly</li>
          <li>Scalability: Threads can run in parallel on multiprocessor systems</li>
        </ul>
        
        <h2 className="content-subtitle">Threading Models</h2>
        <p className="content-paragraph">
          1. <strong>Many-to-One</strong>: Many user-level threads mapped to one kernel thread
          <br />
          2. <strong>One-to-One</strong>: Each user thread mapped to a kernel thread
          <br />
          3. <strong>Many-to-Many</strong>: Many user-level threads multiplexed to a smaller or equal number of kernel threads
        </p>
      </>
    ),
  },
  {
    id: "cpu-scheduling",
    title: "CPU Scheduling",
    description: "Scheduling algorithms and performance criteria",
    icon: "Clock",
    content: (
      <>
        <h2 className="content-subtitle">CPU Scheduling</h2>
        <p className="content-paragraph">
          CPU scheduling is the basis of multi-programmed operating systems. By switching the CPU among processes, the operating system can make the computer more productive.
        </p>
        
        <h2 className="content-subtitle">Scheduling Criteria</h2>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>CPU Utilization: Keep the CPU as busy as possible</li>
          <li>Throughput: Number of processes completed per time unit</li>
          <li>Turnaround Time: Time to execute a particular process</li>
          <li>Waiting Time: Time a process waits in the ready queue</li>
          <li>Response Time: Time from submission to first response</li>
        </ul>
        
        <h2 className="content-subtitle">Scheduling Algorithms</h2>
        <p className="content-paragraph">
          1. <strong>First-Come, First-Served (FCFS)</strong>: Simplest algorithm where processes are executed in the order they arrive
          <br />
          2. <strong>Shortest-Job-Next (SJN)</strong>: Processes with the shortest execution time are executed first
          <br />
          3. <strong>Priority Scheduling</strong>: Each process is assigned a priority and scheduled accordingly
          <br />
          4. <strong>Round Robin (RR)</strong>: Each process gets a small unit of CPU time, then is preempted and placed at the back of the queue
          <br />
          5. <strong>Multilevel Queue Scheduling</strong>: Processes are classified into different groups, each with its own queue
        </p>
      </>
    ),
  },
  {
    id: "process-sync",
    title: "Process Synchronization",
    description: "Critical section problems and synchronization tools",
    icon: "Link",
    content: (
      <>
        <h2 className="content-subtitle">Process Synchronization</h2>
        <p className="content-paragraph">
          Process synchronization refers to the coordination of execution and sharing of resources by processes to ensure the consistent state of shared data.
        </p>
        
        <h2 className="content-subtitle">Critical Section Problem</h2>
        <p className="content-paragraph">
          The critical section is a segment of code where processes access and manipulate shared resources. The critical section problem involves designing a protocol that processes can use to cooperate.
        </p>
        
        <h2 className="content-subtitle">Requirements for Critical Section Solution</h2>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>Mutual Exclusion: Only one process can execute in the critical section at a time</li>
          <li>Progress: If no process is executing in the critical section, a process that wants to enter must be allowed to do so</li>
          <li>Bounded Waiting: There must be a limit on how many times a process can be bypassed</li>
        </ul>
        
        <h2 className="content-subtitle">Synchronization Tools</h2>
        <p className="content-paragraph">
          1. <strong>Mutex Locks</strong>: Simplest synchronization tool for mutual exclusion
          <br />
          2. <strong>Semaphores</strong>: More sophisticated synchronization tool used as a signaling mechanism
          <br />
          3. <strong>Monitors</strong>: High-level synchronization construct that provides both mutual exclusion and condition synchronization
          <br />
          4. <strong>Message Passing</strong>: Processes communicate and synchronize by sending and receiving messages
        </p>
      </>
    ),
  },
  {
    id: "deadlocks",
    title: "Deadlocks",
    description: "Deadlock characterization, prevention, detection, and recovery",
    icon: "Ban",
    content: (
      <>
        <h2 className="content-subtitle">Introduction to Deadlocks</h2>
        <p className="content-paragraph">
          A deadlock is a situation where a set of processes are blocked because each process is holding a resource and waiting to acquire a resource held by another process.
        </p>
        
        <h2 className="content-subtitle">Necessary Conditions for Deadlock</h2>
        <p className="content-paragraph">
          Four conditions must be present simultaneously for a deadlock to occur:
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li><strong>Mutual Exclusion</strong>: Resources cannot be shared</li>
          <li><strong>Hold and Wait</strong>: Processes hold resources while waiting for others</li>
          <li><strong>No Preemption</strong>: Resources cannot be forcibly removed</li>
          <li><strong>Circular Wait</strong>: A circular chain of processes waiting for resources</li>
        </ul>
        
        <h2 className="content-subtitle">Deadlock Handling Strategies</h2>
        <p className="content-paragraph">
          1. <strong>Prevention</strong>: Ensure that at least one of the necessary conditions does not occur
          <br />
          2. <strong>Avoidance</strong>: Dynamically examine resource allocation states to ensure no deadlock can occur
          <br />
          3. <strong>Detection and Recovery</strong>: Allow deadlocks to occur, detect them, and take action to recover
          <br />
          4. <strong>Ignore the Problem</strong>: Pretend deadlocks never occur (ostrich algorithm)
        </p>
      </>
    ),
  },
  {
    id: "memory-management",
    title: "Memory Management",
    description: "Memory allocation, fragmentation, and paging",
    icon: "Database",
    content: (
      <>
        <h2 className="content-subtitle">Memory Management</h2>
        <p className="content-paragraph">
          Memory management involves the management of primary memory or main memory. It keeps track of each and every memory location, whether it is allocated or free.
        </p>
        
        <h2 className="content-subtitle">Memory Management Techniques</h2>
        <p className="content-paragraph">
          1. <strong>Single Contiguous Allocation</strong>: All memory except for a small portion for the OS is available to a single process
          <br />
          2. <strong>Partitioning</strong>:
          <br />
          &nbsp;&nbsp;- <em>Fixed Partitioning</em>: Memory is divided into fixed-sized partitions
          <br />
          &nbsp;&nbsp;- <em>Variable Partitioning</em>: Partitions are created dynamically as needed
          <br />
          3. <strong>Paging</strong>: Physical memory is divided into fixed-sized blocks called frames, and logical memory is divided into blocks of the same size called pages
          <br />
          4. <strong>Segmentation</strong>: Memory is divided into segments of varying sizes based on logical units
        </p>
        
        <h2 className="content-subtitle">Fragmentation</h2>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li><strong>External Fragmentation</strong>: Total memory space exists to satisfy a request, but it is not contiguous</li>
          <li><strong>Internal Fragmentation</strong>: Allocated memory may be slightly larger than requested memory, resulting in wasted space</li>
        </ul>
      </>
    ),
  },
  {
    id: "virtual-memory",
    title: "Virtual Memory",
    description: "Demand paging, page replacement algorithms and thrashing",
    icon: "Box",
    content: (
      <>
        <h2 className="content-subtitle">Virtual Memory</h2>
        <p className="content-paragraph">
          Virtual memory is a memory management technique that provides an illusion of large main memory by using both physical memory and secondary storage.
        </p>
        
        <h2 className="content-subtitle">Demand Paging</h2>
        <p className="content-paragraph">
          Demand paging is a method of virtual memory management where pages are loaded into main memory only when they are needed or demanded by the program.
        </p>
        
        <h2 className="content-subtitle">Page Replacement Algorithms</h2>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li><strong>First-In-First-Out (FIFO)</strong>: Replaces the oldest page in memory</li>
          <li><strong>Optimal Page Replacement</strong>: Replaces the page that will not be used for the longest period</li>
          <li><strong>Least Recently Used (LRU)</strong>: Replaces the page that has not been used for the longest period</li>
          <li><strong>Least Frequently Used (LFU)</strong>: Replaces the page with the smallest number of references</li>
        </ul>
        
        <h2 className="content-subtitle">Thrashing</h2>
        <p className="content-paragraph">
          Thrashing is a state where the system spends most of its time swapping pages in and out instead of executing instructions. This occurs when a process does not have enough frames to hold all the pages it needs for execution.
        </p>
        <p className="content-paragraph">
          Solutions to prevent thrashing include:
          <br />
          - Local replacement algorithms
          <br />
          - Working set model
          <br />
          - Page fault frequency
        </p>
      </>
    ),
  },
  {
    id: "file-systems",
    title: "File Systems",
    description: "File concepts, access methods, directory structures, and protection",
    icon: "Folder",
    content: (
      <>
        <h2 className="content-subtitle">File Concepts</h2>
        <p className="content-paragraph">
          A file is a collection of related information that is recorded on secondary storage. Files are mapped by the operating system onto physical devices.
        </p>
        
        <h2 className="content-subtitle">File Attributes</h2>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>Name: Human-readable identifier</li>
          <li>Type: Data or program</li>
          <li>Location: Address on device</li>
          <li>Size: Current size in bytes, words, or blocks</li>
          <li>Protection: Controls who can read, write, execute</li>
          <li>Time, date, and user identification</li>
        </ul>
        
        <h2 className="content-subtitle">File Access Methods</h2>
        <p className="content-paragraph">
          1. <strong>Sequential Access</strong>: Information is processed in order, one record after another
          <br />
          2. <strong>Direct Access</strong>: Records can be read or written in any order
          <br />
          3. <strong>Indexed Access</strong>: Uses an index to locate records
        </p>
        
        <h2 className="content-subtitle">Directory Structure</h2>
        <p className="content-paragraph">
          Directories provide a way to organize files:
          <br />
          - <strong>Single-level</strong>: All files in one directory
          <br />
          - <strong>Two-level</strong>: Each user has a separate directory
          <br />
          - <strong>Tree-structured</strong>: Directories can have subdirectories
          <br />
          - <strong>Acyclic-graph</strong>: Allows shared subdirectories and files
          <br />
          - <strong>General graph</strong>: Allows cycles but complicates searching
        </p>
      </>
    ),
  },
  {
    id: "io-systems",
    title: "I/O Systems",
    description: "I/O hardware, interfaces, and kernel subsystems",
    icon: "HardDrive",
    content: (
      <>
        <h2 className="content-subtitle">I/O Hardware</h2>
        <p className="content-paragraph">
          I/O devices can be broadly categorized as:
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>Block devices (disks, tapes): Store information in fixed-size blocks</li>
          <li>Character devices (keyboards, mice): Deliver or accept a stream of characters</li>
          <li>Network devices: For sending and receiving data packets</li>
        </ul>
        
        <h2 className="content-subtitle">I/O Control Methods</h2>
        <p className="content-paragraph">
          1. <strong>Programmed I/O</strong>: Processor executes instructions to transfer data
          <br />
          2. <strong>Interrupt-driven I/O</strong>: CPU is interrupted when I/O is complete
          <br />
          3. <strong>Direct Memory Access (DMA)</strong>: Special hardware transfers blocks of data without CPU intervention
        </p>
        
        <h2 className="content-subtitle">I/O Software Layers</h2>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>User-level libraries: Provide functions to applications</li>
          <li>Kernel system calls: Interface for applications to request I/O operations</li>
          <li>Device drivers: Control specific types of hardware</li>
          <li>Interrupt handlers: Manage device-specific events</li>
          <li>Hardware controllers: Physical components that interface with devices</li>
        </ul>
        
        <h2 className="content-subtitle">Buffering</h2>
        <p className="content-paragraph">
          Buffering involves temporarily storing data while it's being transferred to reduce the impact of discrepancies in data production and consumption rates.
        </p>
      </>
    ),
  },
  {
    id: "disk-scheduling",
    title: "Disk Scheduling",
    description: "Disk scheduling algorithms and performance optimization",
    icon: "Save",
    content: (
      <>
        <h2 className="content-subtitle">Disk Scheduling</h2>
        <p className="content-paragraph">
          Disk scheduling is managing access to the disk to optimize performance metrics such as throughput and response time.
        </p>
        
        <h2 className="content-subtitle">Disk Scheduling Algorithms</h2>
        <p className="content-paragraph">
          1. <strong>First-Come, First-Served (FCFS)</strong>: Requests are serviced in the order they arrive
          <br />
          2. <strong>Shortest Seek Time First (SSTF)</strong>: Service the request closest to the current head position
          <br />
          3. <strong>SCAN (Elevator Algorithm)</strong>: The disk arm moves in one direction servicing requests until it reaches the end, then reverses direction
          <br />
          4. <strong>C-SCAN (Circular SCAN)</strong>: Similar to SCAN but services requests only in one direction
          <br />
          5. <strong>LOOK and C-LOOK</strong>: Improvements over SCAN and C-SCAN where the disk arm only goes as far as the last request in each direction
        </p>
        
        <h2 className="content-subtitle">Performance Considerations</h2>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>Seek Time: Time to position the head over the correct track</li>
          <li>Rotational Latency: Time for the desired sector to rotate under the head</li>
          <li>Transfer Time: Time to transfer data between disk and memory</li>
          <li>Access Time: Total time to perform an I/O operation</li>
        </ul>
        
        <h2 className="content-subtitle">Disk Scheduling Optimization Techniques</h2>
        <p className="content-paragraph">
          - Request Merging: Combine adjacent requests
          <br />
          - Anticipatory Scheduling: Pause after a read to predict future reads
          <br />
          - I/O Scheduling: Arrange and prioritize I/O operations
        </p>
      </>
    ),
  },
  {
    id: "security-protection",
    title: "Security and Protection",
    description: "Security goals, mechanisms and access control",
    icon: "Shield",
    content: (
      <>
        <h2 className="content-subtitle">Security and Protection</h2>
        <p className="content-paragraph">
          Security refers to mechanisms and techniques that prevent unauthorized access to system resources, while protection refers to mechanisms for controlling access of processes to resources defined by the OS.
        </p>
        
        <h2 className="content-subtitle">Security Goals</h2>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li><strong>Confidentiality</strong>: Prevention of unauthorized disclosure of information</li>
          <li><strong>Integrity</strong>: Prevention of unauthorized modification of information</li>
          <li><strong>Availability</strong>: Prevention of unauthorized withholding of information or resources</li>
        </ul>
        
        <h2 className="content-subtitle">Security Mechanisms</h2>
        <p className="content-paragraph">
          1. <strong>Authentication</strong>: Verifying the identity of users (passwords, biometrics)
          <br />
          2. <strong>Authorization</strong>: Determining if an authenticated entity has permission to access a resource
          <br />
          3. <strong>Encryption</strong>: Transforming information to make it unreadable to unauthorized users
          <br />
          4. <strong>Auditing</strong>: Recording and examining security-relevant activities
        </p>
        
        <h2 className="content-subtitle">Access Control Methods</h2>
        <p className="content-paragraph">
          1. <strong>Access Control Lists (ACLs)</strong>: List of permissions attached to an object
          <br />
          2. <strong>Capability Lists</strong>: List of permissions attached to a subject
          <br />
          3. <strong>Role-Based Access Control (RBAC)</strong>: Permissions based on roles rather than individuals
          <br />
          4. <strong>Mandatory Access Control (MAC)</strong>: System-enforced policies based on security classifications
        </p>
        
        <h2 className="content-subtitle">Common Threats</h2>
        <p className="content-paragraph">
          - Malware (viruses, worms, trojans)
          <br />
          - Denial of Service attacks
          <br />
          - Phishing and social engineering
          <br />
          - Privilege escalation
          <br />
          - Buffer overflow attacks
        </p>
      </>
    ),
  },
  {
    id: "case-studies",
    title: "Case Studies",
    description: "Analysis of Linux, Windows, and other major OS",
    icon: "Microscope",
    content: (
      <>
        <h2 className="content-subtitle">Linux Operating System</h2>
        <p className="content-paragraph">
          Linux is a free, open-source Unix-like operating system based on the Linux kernel.
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li><strong>Architecture</strong>: Monolithic kernel with loadable modules</li>
          <li><strong>Process Management</strong>: Uses tasks represented by task_struct data structure</li>
          <li><strong>Scheduling</strong>: Completely Fair Scheduler (CFS)</li>
          <li><strong>Memory Management</strong>: Uses paging with support for virtual memory</li>
          <li><strong>File System</strong>: Supports multiple file systems including ext4, XFS, Btrfs</li>
        </ul>
        
        <h2 className="content-subtitle">Windows Operating System</h2>
        <p className="content-paragraph">
          Windows is a group of operating systems developed by Microsoft.
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li><strong>Architecture</strong>: Hybrid kernel</li>
          <li><strong>Process Management</strong>: Uses threads as the basic executable entity</li>
          <li><strong>Memory Management</strong>: Virtual memory with paging and memory-mapped files</li>
          <li><strong>File System</strong>: NTFS (New Technology File System)</li>
          <li><strong>Security</strong>: Uses access control lists and security descriptors</li>
        </ul>
        
        <h2 className="content-subtitle">macOS Operating System</h2>
        <p className="content-paragraph">
          macOS is a Unix-based operating system developed by Apple Inc.
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li><strong>Architecture</strong>: Hybrid kernel (Darwin) with Mach and BSD components</li>
          <li><strong>Memory Management</strong>: Virtual memory with paging</li>
          <li><strong>File System</strong>: APFS (Apple File System), previously HFS+</li>
          <li><strong>Security</strong>: Sandboxing, GateKeeper, FileVault encryption</li>
        </ul>
        
        <h2 className="content-subtitle">Android Operating System</h2>
        <p className="content-paragraph">
          Android is a mobile operating system based on a modified version of the Linux kernel.
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li><strong>Architecture</strong>: Linux kernel with Android-specific modifications</li>
          <li><strong>Application Execution</strong>: Uses the Android Runtime (ART) or previously Dalvik Virtual Machine</li>
          <li><strong>Security</strong>: Application sandboxing and permission model</li>
          <li><strong>Memory Management</strong>: Low Memory Killer to manage limited resources</li>
        </ul>
      </>
    ),
  },
];
