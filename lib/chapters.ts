export interface ChapterContent {
  id: string;
  title: string;
  description: string;
  content: string;
  icon: string;
  subtopics?: SubTopic[];
}

export interface SubTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const chaptersData: ChapterContent[] = [
  {
    id: "process-management",
    title: "Process Management",
    description: "Learn about processes, process states, and process management in operating systems",
    content: "Process management content...",
    icon: "Split",
    subtopics: [
      {
        id: "process-states",
        title: "Process States",
        description: "Understanding different process states and transitions",
        icon: "Split"
      },
      {
        id: "process-scheduling",
        title: "Process Scheduling",
        description: "Process scheduling algorithms and criteria",
        icon: "Clock"
      }
    ]
  },
  {
    id: "cpu-scheduling",
    title: "CPU Scheduling",
    description: "Explore various CPU scheduling algorithms and their implementations",
    content: "CPU scheduling content...",
    icon: "Clock",
    subtopics: [
      {
        id: "scheduling-algorithms",
        title: "Scheduling Algorithms",
        description: "FCFS, SJF, Round Robin, and Priority scheduling",
        icon: "Clock"
      },
      {
        id: "scheduling-criteria",
        title: "Scheduling Criteria",
        description: "Metrics for evaluating scheduling algorithms",
        icon: "BarChart"
      }
    ]
  },
  {
    id: "memory-management",
    title: "Memory Management",
    description: "Understanding memory management techniques and virtual memory",
    content: "Memory management content...",
    icon: "Database",
    subtopics: [
      {
        id: "virtual-memory",
        title: "Virtual Memory",
        description: "Concepts of virtual memory and paging",
        icon: "Database"
      },
      {
        id: "page-replacement",
        title: "Page Replacement",
        description: "Page replacement algorithms",
        icon: "RefreshCw"
      }
    ]
  },
  {
    id: "file-systems",
    title: "File Systems",
    description: "Learn about file system implementation and management",
    content: "File systems content...",
    icon: "Folder",
    subtopics: [
      {
        id: "file-allocation",
        title: "File Allocation",
        description: "Methods of file allocation and organization",
        icon: "FileText"
      },
      {
        id: "directory-structure",
        title: "Directory Structure",
        description: "Directory implementation and hierarchy",
        icon: "FolderTree"
      }
    ]
  },
  {
    id: "disk-management",
    title: "Disk Management",
    description: "Disk scheduling and storage management",
    content: "Disk management content...",
    icon: "HardDrive",
    subtopics: [
      {
        id: "disk-scheduling",
        title: "Disk Scheduling",
        description: "Disk scheduling algorithms",
        icon: "HardDrive"
      },
      {
        id: "raid",
        title: "RAID",
        description: "RAID levels and implementations",
        icon: "Layers"
      }
    ]
  }
];
