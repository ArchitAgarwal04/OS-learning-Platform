import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageReplacementVisualizer } from "@/components/page-replacement-visualizer"
import { CodeBlock } from "@/components/code-block"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { TooltipHelper } from "@/components/tooltip-helper"

export default function PageReplacementPage() {
  return (
    <div className="container py-10">
      <Breadcrumbs items={[{ label: "Page Replacement", href: "/page-replacement", active: true }]} />

      <h1 className="text-4xl font-bold mb-6 gradient-text">Page Replacement Algorithms</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Visualize and understand how different page replacement algorithms work in operating systems.
      </p>

      <Tabs defaultValue="fifo" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fifo">FIFO</TabsTrigger>
          <TabsTrigger value="lru">LRU</TabsTrigger>
          <TabsTrigger value="optimal">Optimal</TabsTrigger>
        </TabsList>

        <TabsContent value="fifo">
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>First-In-First-Out (FIFO)</CardTitle>
                  <TooltipHelper content="FIFO replaces the oldest page in memory when a new page needs to be loaded. It's simple to implement but can suffer from Belady's anomaly." />
                </div>
                <div className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium">Simple</div>
              </div>
              <CardDescription>
                The oldest page in memory is replaced when a new page needs to be loaded.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium mb-4">Algorithm Implementation</h3>
                  <CodeBlock
                    code={`function fifo(referenceString, frameCount) {
  const frames = new Array(frameCount).fill(-1);
  const results = [];
  let pointer = 0;
  let pageFaults = 0;
  
  for (let i = 0; i < referenceString.length; i++) {
    const page = referenceString[i];
    const framesCopy = [...frames];
    let fault = true;
    
    // Check if page is already in a frame
    if (frames.includes(page)) {
      fault = false;
    } else {
      // Page fault - replace page at current pointer
      frames[pointer] = page;
      pointer = (pointer + 1) % frameCount;
      pageFaults++;
    }
    
    results.push({
      page,
      frames: [...framesCopy],
      fault,
    });
  }
  
  return {
    results,
    pageFaults,
    hitRatio: (referenceString.length - pageFaults) / referenceString.length
  };
}`}
                    language="javascript"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Visualization</h3>
                  <PageReplacementVisualizer algorithm="fifo" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lru">
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>Least Recently Used (LRU)</CardTitle>
                  <TooltipHelper content="LRU replaces the page that hasn't been used for the longest time. It performs better than FIFO but requires tracking when each page was last accessed." />
                </div>
                <div className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                  Efficient
                </div>
              </div>
              <CardDescription>The page that has not been used for the longest time is replaced.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium mb-4">Algorithm Implementation</h3>
                  <CodeBlock
                    code={`function lru(referenceString, frameCount) {
  const frames = new Array(frameCount).fill(-1);
  const lastUsed = new Array(frameCount).fill(-1);
  const results = [];
  let pageFaults = 0;
  
  for (let i = 0; i < referenceString.length; i++) {
    const page = referenceString[i];
    const framesCopy = [...frames];
    let fault = true;
    
    // Check if page is already in a frame
    const frameIndex = frames.indexOf(page);
    if (frameIndex !== -1) {
      fault = false;
      lastUsed[frameIndex] = i;
    } else {
      // Page fault - find least recently used frame
      let lruIndex = 0;
      for (let j = 1; j < frameCount; j++) {
        if (lastUsed[j] < lastUsed[lruIndex]) {
          lruIndex = j;
        }
      }
      
      frames[lruIndex] = page;
      lastUsed[lruIndex] = i;
      pageFaults++;
    }
    
    results.push({
      page,
      frames: [...framesCopy],
      fault,
    });
  }
  
  return {
    results,
    pageFaults,
    hitRatio: (referenceString.length - pageFaults) / referenceString.length
  };
}`}
                    language="javascript"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Visualization</h3>
                  <PageReplacementVisualizer algorithm="lru" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimal">
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>Optimal (Belady's Algorithm)</CardTitle>
                  <TooltipHelper content="Optimal algorithm replaces the page that won't be used for the longest time in the future. It provides the best possible performance but requires future knowledge of page references." />
                </div>
                <div className="px-2 py-1 rounded-full bg-purple-500/10 text-purple-500 text-xs font-medium">
                  Theoretical Best
                </div>
              </div>
              <CardDescription>
                Replaces the page that will not be used for the longest time in the future.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium mb-4">Algorithm Implementation</h3>
                  <CodeBlock
                    code={`function optimal(referenceString, frameCount) {
  const frames = new Array(frameCount).fill(-1);
  const results = [];
  let pageFaults = 0;
  
  for (let i = 0; i < referenceString.length; i++) {
    const page = referenceString[i];
    const framesCopy = [...frames];
    let fault = true;
    
    // Check if page is already in a frame
    if (frames.includes(page)) {
      fault = false;
    } else {
      // Page fault - find optimal page to replace
      if (frames.includes(-1)) {
        // Empty frame available
        const emptyIndex = frames.indexOf(-1);
        frames[emptyIndex] = page;
      } else {
        // Find page that won't be used for the longest time
        const nextUse = frames.map(frame => {
          const nextIndex = referenceString.indexOf(frame, i + 1);
          return nextIndex === -1 ? Infinity : nextIndex;
        });
        
        const replaceIndex = nextUse.indexOf(Math.max(...nextUse));
        frames[replaceIndex] = page;
      }
      
      pageFaults++;
    }
    
    results.push({
      page,
      frames: [...framesCopy],
      fault,
    });
  }
  
  return {
    results,
    pageFaults,
    hitRatio: (referenceString.length - pageFaults) / referenceString.length
  };
}`}
                    language="javascript"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Visualization</h3>
                  <PageReplacementVisualizer algorithm="optimal" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
