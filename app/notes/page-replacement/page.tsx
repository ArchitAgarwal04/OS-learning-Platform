"use client"

import { Breadcrumbs } from "@/components/breadcrumbs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PageReplacementNotes() {
  return (
    <div className="container py-10">
      <Breadcrumbs
        items={[
          { label: "Notes", href: "/notes" },
          { label: "Page Replacement", href: "/notes/page-replacement", active: true },
        ]}
      />

      <h1 className="text-4xl font-bold mb-6 gradient-text">Page Replacement Algorithms</h1>
      <p className="text-lg text-muted-foreground mb-8">
        A comprehensive guide to understanding page replacement algorithms in operating systems.
      </p>

      <div className="space-y-8">
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Introduction to Page Replacement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Page replacement is a memory management technique that determines which pages to remove from memory when a new page needs to be loaded. When a page fault occurs and no free frames are available, the operating system must choose a page to remove (swap out) to make room for the new page.
              </p>
              <h3 className="text-xl font-semibold mt-4">Key Concepts</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Page Fault: Occurs when a program accesses a page that is not currently in physical memory</li>
                <li>Frame: A fixed-size block in physical memory that holds a page</li>
                <li>Page Table: Data structure that maps virtual page numbers to physical frame numbers</li>
                <li>Swap Space: Area on disk where pages are stored when not in memory</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>First-In-First-Out (FIFO)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                FIFO is the simplest page replacement algorithm. It works by removing the oldest page in memory when a new page needs to be loaded.
              </p>
              <h3 className="text-xl font-semibold">How FIFO Works</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Maintains a queue of pages in memory</li>
                <li>New pages are added to the back of the queue</li>
                <li>When replacement is needed, removes page from the front of the queue</li>
                <li>Simple to implement but not always efficient</li>
              </ul>
              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">Example Implementation</h4>
                <Tabs defaultValue="javascript">
                  <TabsList>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="cpp">C++</TabsTrigger>
                    <TabsTrigger value="java">Java</TabsTrigger>
                  </TabsList>
                  <TabsContent value="javascript">
                    <CodeBlock
                      code={`function fifoPageReplacement(pages, frameCount) {
  const frames = new Array(frameCount).fill(-1);
  let pointer = 0;
  let pageFaults = 0;

  for (let page of pages) {
    if (!frames.includes(page)) {
      frames[pointer] = page;
      pointer = (pointer + 1) % frameCount;
      pageFaults++;
    }
  }
  return pageFaults;
}`}
                      language="javascript"
                    />
                  </TabsContent>
                  <TabsContent value="python">
                    <CodeBlock
                      code={`def fifo_page_replacement(pages, frame_count):
    frames = [-1] * frame_count
    pointer = 0
    page_faults = 0
    
    for page in pages:
        if page not in frames:
            frames[pointer] = page
            pointer = (pointer + 1) % frame_count
            page_faults += 1
            
    return page_faults`}
                      language="python"
                    />
                  </TabsContent>
                  <TabsContent value="cpp">
                    <CodeBlock
                      code={`int fifoPageReplacement(vector<int>& pages, int frameCount) {
    vector<int> frames(frameCount, -1);
    int pointer = 0;
    int pageFaults = 0;
    
    for(int page : pages) {
        bool found = false;
        for(int i = 0; i < frameCount; i++) {
            if(frames[i] == page) {
                found = true;
                break;
            }
        }
        
        if(!found) {
            frames[pointer] = page;
            pointer = (pointer + 1) % frameCount;
            pageFaults++;
        }
    }
    return pageFaults;
}`}
                      language="cpp"
                    />
                  </TabsContent>
                  <TabsContent value="java">
                    <CodeBlock
                      code={`public class PageReplacement {
    public static int fifoPageReplacement(int[] pages, int frameCount) {
        int[] frames = new int[frameCount];
        Arrays.fill(frames, -1);
        int pointer = 0;
        int pageFaults = 0;
        
        for(int page : pages) {
            boolean found = false;
            for(int i = 0; i < frameCount; i++) {
                if(frames[i] == page) {
                    found = true;
                    break;
                }
            }
            
            if(!found) {
                frames[pointer] = page;
                pointer = (pointer + 1) % frameCount;
                pageFaults++;
            }
        }
        return pageFaults;
    }
}`}
                      language="java"
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
              <CardTitle>Least Recently Used (LRU)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                LRU replaces the page that hasn't been accessed for the longest time. It's based on the principle of locality of reference.
              </p>
              <h3 className="text-xl font-semibold">Characteristics</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Tracks when each page was last accessed</li>
                <li>Requires additional hardware support for efficient implementation</li>
                <li>Generally performs better than FIFO</li>
                <li>More complex to implement than FIFO</li>
              </ul>
              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">Example Implementation</h4>
                <Tabs defaultValue="javascript">
                  <TabsList>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="cpp">C++</TabsTrigger>
                    <TabsTrigger value="java">Java</TabsTrigger>
                  </TabsList>
                  <TabsContent value="javascript">
                    <CodeBlock
                      code={`function lruPageReplacement(pages, frameCount) {
  const frames = new Map(); // Map to store page and its last use time
  let pageFaults = 0;
  let time = 0;

  for (let page of pages) {
    time++;
    if (frames.size < frameCount) {
      if (!frames.has(page)) {
        frames.set(page, time);
        pageFaults++;
      }
    } else if (!frames.has(page)) {
      // Find least recently used page
      let lruPage = [...frames.entries()]
        .reduce((a, b) => (a[1] < b[1] ? a : b))[0];
      frames.delete(lruPage);
      frames.set(page, time);
      pageFaults++;
    }
    frames.set(page, time); // Update access time
  }
  return pageFaults;
}`}
                      language="javascript"
                    />
                  </TabsContent>
                  <TabsContent value="python">
                    <CodeBlock
                      code={`def lru_page_replacement(pages, frame_count):
    frames = {}  # Dictionary to store page and its last use time
    page_faults = 0
    time = 0
    
    for page in pages:
        time += 1
        if len(frames) < frame_count:
            if page not in frames:
                frames[page] = time
                page_faults += 1
        elif page not in frames:
            # Find least recently used page
            lru_page = min(frames.items(), key=lambda x: x[1])[0]
            frames.pop(lru_page)
            frames[page] = time
            page_faults += 1
        frames[page] = time  # Update access time
        
    return page_faults`}
                      language="python"
                    />
                  </TabsContent>
                  <TabsContent value="cpp">
                    <CodeBlock
                      code={`int lruPageReplacement(vector<int>& pages, int frameCount) {
    unordered_map<int, int> frames;  // Map to store page and its last use time
    int pageFaults = 0;
    int time = 0;
    
    for(int page : pages) {
        time++;
        if(frames.size() < frameCount) {
            if(frames.find(page) == frames.end()) {
                frames[page] = time;
                pageFaults++;
            }
        }
        else if(frames.find(page) == frames.end()) {
            // Find least recently used page
            int lruPage = -1;
            int minTime = INT_MAX;
            for(auto& frame : frames) {
                if(frame.second < minTime) {
                    minTime = frame.second;
                    lruPage = frame.first;
                }
            }
            frames.erase(lruPage);
            frames[page] = time;
            pageFaults++;
        }
        frames[page] = time;  // Update access time
    }
    return pageFaults;
}`}
                      language="cpp"
                    />
                  </TabsContent>
                  <TabsContent value="java">
                    <CodeBlock
                      code={`public class PageReplacement {
    public static int lruPageReplacement(int[] pages, int frameCount) {
        HashMap<Integer, Integer> frames = new HashMap<>();  // Map to store page and its last use time
        int pageFaults = 0;
        int time = 0;
        
        for(int page : pages) {
            time++;
            if(frames.size() < frameCount) {
                if(!frames.containsKey(page)) {
                    frames.put(page, time);
                    pageFaults++;
                }
            }
            else if(!frames.containsKey(page)) {
                // Find least recently used page
                int lruPage = frames.entrySet()
                    .stream()
                    .min(Map.Entry.comparingByValue())
                    .get()
                    .getKey();
                frames.remove(lruPage);
                frames.put(page, time);
                pageFaults++;
            }
            frames.put(page, time);  // Update access time
        }
        return pageFaults;
    }
}`}
                      language="java"
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
              <CardTitle>Optimal Page Replacement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The optimal page replacement algorithm replaces the page that will not be used for the longest period in the future. This is theoretically the best possible algorithm but impossible to implement in practice because it requires knowledge of future page references.
              </p>
              <h3 className="text-xl font-semibold">Key Points</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provides a theoretical minimum number of page faults</li>
                <li>Used as a benchmark to evaluate other algorithms</li>
                <li>Not implementable in real systems</li>
                <li>Useful for theoretical analysis</li>
              </ul>
              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">Example Implementation</h4>
                <Tabs defaultValue="javascript">
                  <TabsList>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="cpp">C++</TabsTrigger>
                    <TabsTrigger value="java">Java</TabsTrigger>
                  </TabsList>
                  <TabsContent value="javascript">
                    <CodeBlock
                      code={`function optimalPageReplacement(pages, frameCount) {
  const frames = new Array(frameCount).fill(-1);
  let pageFaults = 0;

  for (let i = 0; i < pages.length; i++) {
    if (!frames.includes(pages[i])) {
      if (frames.includes(-1)) {
        frames[frames.indexOf(-1)] = pages[i];
      } else {
        // Find page that won't be used for longest time
        let farthest = -1;
        let replaceIndex = -1;
        for (let j = 0; j < frames.length; j++) {
          let nextUse = pages.slice(i + 1).indexOf(frames[j]);
          if (nextUse === -1) {
            replaceIndex = j;
            break;
          }
          if (nextUse > farthest) {
            farthest = nextUse;
            replaceIndex = j;
          }
        }
        frames[replaceIndex] = pages[i];
      }
      pageFaults++;
    }
  }
  return pageFaults;
}`}
                      language="javascript"
                    />
                  </TabsContent>
                  <TabsContent value="python">
                    <CodeBlock
                      code={`def optimal_page_replacement(pages, frame_count):
    frames = [-1] * frame_count
    page_faults = 0
    
    for i in range(len(pages)):
        if pages[i] not in frames:
            if -1 in frames:
                frames[frames.index(-1)] = pages[i]
            else:
                # Find page that won't be used for longest time
                farthest = -1
                replace_index = -1
                for j in range(frame_count):
                    try:
                        next_use = pages[i+1:].index(frames[j])
                    except ValueError:
                        replace_index = j
                        break
                    if next_use > farthest:
                        farthest = next_use
                        replace_index = j
                frames[replace_index] = pages[i]
            page_faults += 1
            
    return page_faults`}
                      language="python"
                    />
                  </TabsContent>
                  <TabsContent value="cpp">
                    <CodeBlock
                      code={`int optimalPageReplacement(vector<int>& pages, int frameCount) {
    vector<int> frames(frameCount, -1);
    int pageFaults = 0;
    
    for(int i = 0; i < pages.size(); i++) {
        bool found = false;
        for(int j = 0; j < frameCount; j++) {
            if(frames[j] == pages[i]) {
                found = true;
                break;
            }
        }
        
        if(!found) {
            bool emptyFrame = false;
            for(int j = 0; j < frameCount; j++) {
                if(frames[j] == -1) {
                    frames[j] = pages[i];
                    emptyFrame = true;
                    break;
                }
            }
            
            if(!emptyFrame) {
                // Find page that won't be used for longest time
                int farthest = -1;
                int replaceIndex = -1;
                for(int j = 0; j < frameCount; j++) {
                    int nextUse = pages.size();
                    for(int k = i + 1; k < pages.size(); k++) {
                        if(pages[k] == frames[j]) {
                            nextUse = k;
                            break;
                        }
                    }
                    if(nextUse > farthest) {
                        farthest = nextUse;
                        replaceIndex = j;
                    }
                }
                frames[replaceIndex] = pages[i];
            }
            pageFaults++;
        }
    }
    return pageFaults;
}`}
                      language="cpp"
                    />
                  </TabsContent>
                  <TabsContent value="java">
                    <CodeBlock
                      code={`public class PageReplacement {
    public static int optimalPageReplacement(int[] pages, int frameCount) {
        int[] frames = new int[frameCount];
        Arrays.fill(frames, -1);
        int pageFaults = 0;
        
        for(int i = 0; i < pages.length; i++) {
            boolean found = false;
            for(int j = 0; j < frameCount; j++) {
                if(frames[j] == pages[i]) {
                    found = true;
                    break;
                }
            }
            
            if(!found) {
                boolean emptyFrame = false;
                for(int j = 0; j < frameCount; j++) {
                    if(frames[j] == -1) {
                        frames[j] = pages[i];
                        emptyFrame = true;
                        break;
                    }
                }
                
                if(!emptyFrame) {
                    // Find page that won't be used for longest time
                    int farthest = -1;
                    int replaceIndex = -1;
                    for(int j = 0; j < frameCount; j++) {
                        int nextUse = pages.length;
                        for(int k = i + 1; k < pages.length; k++) {
                            if(pages[k] == frames[j]) {
                                nextUse = k;
                                break;
                            }
                        }
                        if(nextUse > farthest) {
                            farthest = nextUse;
                            replaceIndex = j;
                        }
                    }
                    frames[replaceIndex] = pages[i];
                }
                pageFaults++;
            }
        }
        return pageFaults;
    }
}`}
                      language="java"
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
              <CardTitle>Comparison of Algorithms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                      <td className="px-4 py-2">FIFO</td>
                      <td className="px-4 py-2">
                        <ul className="list-disc pl-4">
                          <li>Simple to implement</li>
                          <li>Low overhead</li>
                        </ul>
                      </td>
                      <td className="px-4 py-2">
                        <ul className="list-disc pl-4">
                          <li>High page fault rate</li>
                          <li>Belady's anomaly possible</li>
                        </ul>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2">LRU</td>
                      <td className="px-4 py-2">
                        <ul className="list-disc pl-4">
                          <li>Good performance</li>
                          <li>No Belady's anomaly</li>
                        </ul>
                      </td>
                      <td className="px-4 py-2">
                        <ul className="list-disc pl-4">
                          <li>Hardware support needed</li>
                          <li>Complex implementation</li>
                        </ul>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">Optimal</td>
                      <td className="px-4 py-2">
                        <ul className="list-disc pl-4">
                          <li>Best possible performance</li>
                          <li>No Belady's anomaly</li>
                        </ul>
                      </td>
                      <td className="px-4 py-2">
                        <ul className="list-disc pl-4">
                          <li>Not implementable</li>
                          <li>Requires future knowledge</li>
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