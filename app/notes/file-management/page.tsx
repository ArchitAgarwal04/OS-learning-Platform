"use client"

import { Breadcrumbs } from "@/components/breadcrumbs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FileManagementNotes() {
  return (
    <div className="container py-10">
      <Breadcrumbs
        items={[
          { label: "Notes", href: "/notes" },
          { label: "File Management", href: "/notes/file-management", active: true },
        ]}
      />

      <h1 className="text-4xl font-bold mb-6 gradient-text">File Management</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Understanding file systems, file operations, and storage management in operating systems.
      </p>

      <div className="space-y-8">
        <section>
          <Card>
            <CardHeader>
              <CardTitle>File System Concepts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                A file system provides the mechanism for storage and access to both data and programs of the operating system. It provides a uniform logical view of information storage.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>File Attributes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Name: Human-readable identifier</li>
                      <li>Type: Format of the file</li>
                      <li>Size: Current size in bytes</li>
                      <li>Location: Physical location on device</li>
                      <li>Protection: Access control information</li>
                      <li>Timestamps: Creation, last access, last modification</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>File Operations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Create: Make new file</li>
                      <li>Write: Add data to file</li>
                      <li>Read: Access file content</li>
                      <li>Seek: Move to specific position</li>
                      <li>Delete: Remove file</li>
                      <li>Truncate: Clear file content</li>
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
              <CardTitle>File Access Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mt-4">
                <Tabs defaultValue="sequential">
                  <TabsList>
                    <TabsTrigger value="sequential">Sequential Access</TabsTrigger>
                    <TabsTrigger value="direct">Direct Access</TabsTrigger>
                    <TabsTrigger value="indexed">Indexed Access</TabsTrigger>
                  </TabsList>
                  <TabsContent value="sequential">
                    <h3 className="text-xl font-semibold mb-4">Sequential Access</h3>
                    <p className="mb-4">Information is processed in order, one record after another.</p>
                    <CodeBlock
                      code={`class SequentialFileReader {
  constructor(filename) {
    this.file = openFile(filename);
    this.currentPosition = 0;
  }

  read(size) {
    const data = readBytes(this.file, this.currentPosition, size);
    this.currentPosition += size;
    return data;
  }

  rewind() {
    this.currentPosition = 0;
  }

  close() {
    closeFile(this.file);
  }
}`}
                      language="javascript"
                    />
                  </TabsContent>
                  <TabsContent value="direct">
                    <h3 className="text-xl font-semibold mb-4">Direct Access</h3>
                    <p className="mb-4">Records can be read/written in any order using block numbers.</p>
                    <CodeBlock
                      code={`class DirectAccessFile {
  constructor(filename, blockSize) {
    this.file = openFile(filename);
    this.blockSize = blockSize;
  }

  readBlock(blockNumber) {
    const position = blockNumber * this.blockSize;
    return readBytes(this.file, position, this.blockSize);
  }

  writeBlock(blockNumber, data) {
    const position = blockNumber * this.blockSize;
    writeBytes(this.file, position, data);
  }
}`}
                      language="javascript"
                    />
                  </TabsContent>
                  <TabsContent value="indexed">
                    <h3 className="text-xl font-semibold mb-4">Indexed Access</h3>
                    <p className="mb-4">Uses an index to find records based on a key value.</p>
                    <CodeBlock
                      code={`class IndexedFile {
  constructor(filename) {
    this.file = openFile(filename);
    this.index = loadIndex(filename + '.idx');
  }

  findByKey(key) {
    const position = this.index.lookup(key);
    if (position === -1) return null;
    return readRecord(this.file, position);
  }

  insertRecord(key, record) {
    const position = appendRecord(this.file, record);
    this.index.insert(key, position);
    this.index.save();
  }
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
              <CardTitle>Directory Structure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Directories organize files into a hierarchical structure. They contain information about files including attributes, location, and naming.
              </p>
              <CodeBlock
                code={`class Directory {
  constructor(name) {
    this.name = name;
    this.entries = new Map();  // name -> FileEntry mapping
    this.attributes = {
      created: Date.now(),
      modified: Date.now(),
      permissions: 0o755  // rwxr-xr-x
    };
  }

  addFile(name, type) {
    const entry = new FileEntry(name, type);
    this.entries.set(name, entry);
    this.attributes.modified = Date.now();
    return entry;
  }

  findFile(path) {
    const parts = path.split('/');
    let current = this;
    
    for (const part of parts) {
      if (part === '.' || part === '') continue;
      if (part === '..') {
        current = current.parent;
        continue;
      }
      
      const entry = current.entries.get(part);
      if (!entry) return null;
      current = entry;
    }
    
    return current;
  }

  list() {
    return Array.from(this.entries.values());
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
              <CardTitle>File Allocation Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                File allocation methods determine how file blocks are organized on disk storage.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contiguous Allocation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Each file occupies contiguous blocks.</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Simple to implement</li>
                      <li>Fast sequential access</li>
                      <li>External fragmentation</li>
                      <li>File size must be known</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Linked Allocation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Each block contains a pointer to the next block.</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>No external fragmentation</li>
                      <li>Only sequential access</li>
                      <li>Space needed for pointers</li>
                      <li>Reliability issues</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Indexed Allocation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Index block contains pointers to all blocks.</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Direct access possible</li>
                      <li>No external fragmentation</li>
                      <li>Index block overhead</li>
                      <li>File size limited by index</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">Implementation Example</h3>
                <CodeBlock
                  code={`class FileAllocationTable {
  constructor(diskSize, blockSize) {
    this.blockSize = blockSize;
    this.numBlocks = Math.floor(diskSize / blockSize);
    this.blocks = new Array(this.numBlocks).fill(0);  // 0 = free
  }

  // Contiguous allocation
  allocateContiguous(numBlocks) {
    let startBlock = -1;
    let consecutiveCount = 0;

    for (let i = 0; i < this.blocks.length; i++) {
      if (this.blocks[i] === 0) {
        if (consecutiveCount === 0) startBlock = i;
        consecutiveCount++;
        if (consecutiveCount === numBlocks) {
          // Mark blocks as allocated
          for (let j = startBlock; j < startBlock + numBlocks; j++) {
            this.blocks[j] = 1;
          }
          return startBlock;
        }
      } else {
        consecutiveCount = 0;
      }
    }
    return -1;  // Not enough contiguous space
  }

  // Linked allocation
  allocateLinked(numBlocks) {
    const allocatedBlocks = [];
    for (let i = 0; i < this.blocks.length && allocatedBlocks.length < numBlocks; i++) {
      if (this.blocks[i] === 0) {
        this.blocks[i] = allocatedBlocks.length > 0 ? 
          allocatedBlocks[allocatedBlocks.length - 1] : -1;
        allocatedBlocks.push(i);
      }
    }
    return allocatedBlocks.length === numBlocks ? allocatedBlocks : null;
  }

  // Indexed allocation
  allocateIndexed(numBlocks) {
    // First find an index block
    const indexBlock = this.blocks.findIndex(block => block === 0);
    if (indexBlock === -1) return null;

    const dataBlocks = [];
    for (let i = 0; i < this.blocks.length && dataBlocks.length < numBlocks; i++) {
      if (i !== indexBlock && this.blocks[i] === 0) {
        this.blocks[i] = 1;
        dataBlocks.push(i);
      }
    }

    if (dataBlocks.length === numBlocks) {
      this.blocks[indexBlock] = dataBlocks;
      return { indexBlock, dataBlocks };
    }

    // Cleanup if we couldn't allocate all blocks
    dataBlocks.forEach(block => this.blocks[block] = 0);
    return null;
  }
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
              <CardTitle>Free Space Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Free space management keeps track of free disk blocks and allocates them when needed.
              </p>
              <div className="mt-4">
                <Tabs defaultValue="bitmap">
                  <TabsList>
                    <TabsTrigger value="bitmap">Bit Map</TabsTrigger>
                    <TabsTrigger value="linked">Linked List</TabsTrigger>
                    <TabsTrigger value="grouping">Grouping</TabsTrigger>
                  </TabsList>
                  <TabsContent value="bitmap">
                    <h3 className="text-xl font-semibold mb-4">Bit Map Method</h3>
                    <CodeBlock
                      code={`class BitMap {
  constructor(numBlocks) {
    this.map = new Uint8Array(Math.ceil(numBlocks / 8));
  }

  // Set block as used (1) or free (0)
  setBlock(blockNum, used) {
    const byteIndex = Math.floor(blockNum / 8);
    const bitIndex = blockNum % 8;
    if (used) {
      this.map[byteIndex] |= (1 << bitIndex);
    } else {
      this.map[byteIndex] &= ~(1 << bitIndex);
    }
  }

  // Check if block is used
  isBlockUsed(blockNum) {
    const byteIndex = Math.floor(blockNum / 8);
    const bitIndex = blockNum % 8;
    return (this.map[byteIndex] & (1 << bitIndex)) !== 0;
  }

  // Find first free block
  findFirstFree() {
    for (let i = 0; i < this.map.length; i++) {
      if (this.map[i] !== 0xFF) {  // Not all bits are 1
        for (let j = 0; j < 8; j++) {
          if ((this.map[i] & (1 << j)) === 0) {
            return i * 8 + j;
          }
        }
      }
    }
    return -1;  // No free blocks
  }
}`}
                      language="javascript"
                    />
                  </TabsContent>
                  <TabsContent value="linked">
                    <h3 className="text-xl font-semibold mb-4">Linked List Method</h3>
                    <CodeBlock
                      code={`class LinkedFreeList {
  constructor() {
    this.head = null;  // First free block
  }

  addFreeBlock(block) {
    block.next = this.head;
    this.head = block;
  }

  allocateBlock() {
    if (!this.head) return null;
    const block = this.head;
    this.head = block.next;
    block.next = null;
    return block;
  }

  // Coalesce adjacent free blocks
  coalesce() {
    if (!this.head) return;
    
    let current = this.head;
    while (current.next) {
      if (current.address + current.size === current.next.address) {
        // Merge blocks
        current.size += current.next.size;
        current.next = current.next.next;
      } else {
        current = current.next;
      }
    }
  }
}`}
                      language="javascript"
                    />
                  </TabsContent>
                  <TabsContent value="grouping">
                    <h3 className="text-xl font-semibold mb-4">Grouping Method</h3>
                    <CodeBlock
                      code={`class GroupedFreeSpace {
  constructor(blockSize) {
    this.blockSize = blockSize;
    this.groups = new Map();  // size -> blocks list
  }

  addFreeBlock(block) {
    const size = block.size;
    if (!this.groups.has(size)) {
      this.groups.set(size, []);
    }
    this.groups.get(size).push(block);
  }

  findBlock(size) {
    // Find smallest group that can accommodate size
    const suitable = Array.from(this.groups.entries())
      .filter(([blockSize]) => blockSize >= size)
      .sort(([a], [b]) => a - b)[0];
      
    if (!suitable) return null;
    
    const [blockSize, blocks] = suitable;
    const block = blocks.pop();
    
    // Remove empty group
    if (blocks.length === 0) {
      this.groups.delete(blockSize);
    }
    
    return block;
  }
}`}
                      language="javascript"
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}