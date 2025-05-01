"use client"

import React from "react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DeadlocksNotes(): React.JSX.Element {
  return (
    <div className="container py-10">
      <Breadcrumbs
        items={[
          { label: "Notes", href: "/notes" },
          { label: "Deadlocks and Synchronization", href: "/notes/deadlocks", active: true },
        ]}
      />

      <h1 className="text-4xl font-bold mb-6 gradient-text">Deadlocks and Synchronization</h1>
      <p className="text-lg text-muted-foreground mb-8">
        A comprehensive theoretical and practical guide to understanding process synchronization, deadlocks, and their management in operating systems.
      </p>

      <div className="space-y-8">
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Theoretical Foundation of Deadlocks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                A deadlock is a fundamental concept in operating systems where a set of processes is permanently blocked, 
                waiting for resources held by other processes in the set. This creates a circular dependency where no 
                progress can be made.
              </p>
              
              <h3 className="text-xl font-semibold mt-4">System Model</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Resources: Each type has a fixed number of instances</li>
                <li>Sequential Resource Usage: Request → Use → Release</li>
                <li>Resource Categories: Preemptable vs Non-preemptable</li>
                <li>Resource Instances: Single vs Multiple</li>
              </ul>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Resource-Allocation Graph Theory</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">A directed graph G = (V, E) where:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>V = {'{P1...Pn}'} ∪ {'{R1...Rm}'}</li>
                      <li>E = Request Edges ∪ Assignment Edges</li>
                      <li>Cycle indicates potential deadlock</li>
                      <li>For single instances, cycle = deadlock</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>State Space Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Safe State: System can execute safely</li>
                      <li>Unsafe State: Potential deadlock</li>
                      <li>Deadlocked State: No progress possible</li>
                      <li>Safety Algorithm: Determines state safety</li>
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
              <CardTitle>The Four Necessary Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="mb-4">
                Coffman et al. proved that the following four conditions are necessary for deadlock occurrence. 
                These conditions are fundamental to understanding deadlock prevention and avoidance strategies.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>1. Mutual Exclusion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Resources cannot be shared simultaneously.</p>
                    <div className="mt-4">
                      <h4 className="font-semibold">Implementation:</h4>
                      <CodeBlock
                        code={`/* Mutual Exclusion implementation using Binary Semaphore */
struct semaphore {
    int value;
    struct process *queue;
};

void wait(struct semaphore *S) {
    S->value--;
    if (S->value < 0) {
        /* Add process to queue */
        block();
    }
}

void signal(struct semaphore *S) {
    S->value++;
    if (S->value <= 0) {
        /* Remove process from queue */
        wakeup(P);
    }
}`}
                        language="c"
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>2. Hold and Wait</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Processes maintain existing resources while waiting for additional ones.</p>
                    <div className="mt-4">
                      <h4 className="font-semibold">Implementation:</h4>
                      <CodeBlock
                        code={`/* Resource allocation demonstrating hold and wait */
struct resource_handle {
    int resource_id;
    int is_allocated;
};

struct process_control_block {
    int pid;
    struct resource_handle *held_resources;
    int resource_count;
};

int request_resource(struct process_control_block *pcb, int resource_id) {
    /* Process already holds resources */
    if (pcb->resource_count > 0) {
        /* Attempting to acquire new resource while holding others */
        if (!is_resource_available(resource_id)) {
            return WAIT_FOR_RESOURCE;  /* Hold and wait condition */
        }
    }
    return allocate_resource(pcb, resource_id);
}`}
                        language="c"
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>3. No Preemption</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Resources cannot be forcibly reclaimed.</p>
                    <div className="mt-4">
                      <h4 className="font-semibold">Implementation:</h4>
                      <CodeBlock
                        code={`/* Non-preemptive resource management */
struct resource {
    int id;
    struct process *owner;
    int state;  /* FREE or ALLOCATED */
};

int acquire_resource(struct process *p, struct resource *r) {
    if (r->state == FREE) {
        r->owner = p;
        r->state = ALLOCATED;
        return SUCCESS;
    }
    /* Cannot preempt, must wait */
    return FAILURE;
}

void release_resource(struct resource *r) {
    /* Only owner can release */
    if (r->owner == current_process) {
        r->owner = NULL;
        r->state = FREE;
    }
}`}
                        language="c"
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>4. Circular Wait</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Processes form a circular chain of resource requests.</p>
                    <div className="mt-4">
                      <h4 className="font-semibold">Implementation:</h4>
                      <CodeBlock
                        code={`/* Circular wait demonstration */
#define MAX_RESOURCES 100

struct resource_graph {
    int adj_matrix[MAX_RESOURCES][MAX_RESOURCES];
    int num_resources;
};

int detect_cycle(struct resource_graph *graph) {
    int visited[MAX_RESOURCES] = {0};
    int rec_stack[MAX_RESOURCES] = {0};
    
    for(int i = 0; i < graph->num_resources; i++) {
        if(has_cycle_util(graph, i, visited, rec_stack))
            return 1;  /* Cycle detected */
    }
    return 0;  /* No cycle */
}

int has_cycle_util(struct resource_graph *graph, 
                   int vertex, 
                   int visited[], 
                   int rec_stack[]) {
    if(!visited[vertex]) {
        visited[vertex] = 1;
        rec_stack[vertex] = 1;
        
        for(int i = 0; i < graph->num_resources; i++) {
            if(graph->adj_matrix[vertex][i]) {
                if(!visited[i] && 
                   has_cycle_util(graph, i, visited, rec_stack))
                    return 1;
                else if(rec_stack[i])
                    return 1;
            }
        }
    }
    rec_stack[vertex] = 0;
    return 0;
}`}
                        language="c"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Deadlock Prevention: Theoretical Approaches</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Deadlock prevention involves ensuring that at least one of the four necessary conditions cannot hold.
                Each approach has its theoretical foundations and practical implications.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Resource Allocation State</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">A system's state is defined by:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li>Available: Vector of free resources</li>
                      <li>Allocation: Matrix of current allocations</li>
                      <li>Request: Matrix of current requests</li>
                      <li>Need: Matrix of maximum needs</li>
                    </ul>
                    <CodeBlock
                      code={`/* Resource state tracking */
struct system_state {
    int *available;          /* Available resources */
    int **allocation;       /* Current allocation matrix */
    int **request;          /* Current request matrix */
    int **need;            /* Maximum need matrix */
    int num_processes;
    int num_resources;
};

void initialize_state(struct system_state *state, 
                     int processes, 
                     int resources) {
    state->num_processes = processes;
    state->num_resources = resources;
    
    /* Allocate and initialize vectors/matrices */
    state->available = (int*)malloc(resources * sizeof(int));
    state->allocation = (int**)malloc(processes * sizeof(int*));
    state->request = (int**)malloc(processes * sizeof(int*));
    state->need = (int**)malloc(processes * sizeof(int*));
    
    for(int i = 0; i < processes; i++) {
        state->allocation[i] = (int*)calloc(resources, sizeof(int));
        state->request[i] = (int*)calloc(resources, sizeof(int));
        state->need[i] = (int*)calloc(resources, sizeof(int));
    }
}`}
                      language="c"
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Safety Algorithm</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Algorithm to determine if a state is safe:</p>
                    <CodeBlock
                      code={`/* Safety state detection algorithm */
int is_state_safe(struct system_state *state) {
    int *work = (int*)malloc(state->num_resources * sizeof(int));
    int *finish = (int*)calloc(state->num_processes, sizeof(int));
    
    /* Initialize work = available */
    memcpy(work, state->available, 
           state->num_resources * sizeof(int));
    
    /* Find a process that can finish */
    int found;
    do {
        found = 0;
        for(int i = 0; i < state->num_processes; i++) {
            if(!finish[i] && can_complete(state, i, work)) {
                /* Process i can complete */
                found = 1;
                finish[i] = 1;
                
                /* Release its resources */
                for(int j = 0; j < state->num_resources; j++) {
                    work[j] += state->allocation[i][j];
                }
                break;
            }
        }
    } while(found);
    
    /* Check if all processes finished */
    for(int i = 0; i < state->num_processes; i++) {
        if(!finish[i]) {
            free(work);
            free(finish);
            return 0;  /* Unsafe state */
        }
    }
    
    free(work);
    free(finish);
    return 1;  /* Safe state */
}`}
                      language="c"
                    />
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Banker's Algorithm: Complete Implementation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                The Banker's Algorithm, developed by Dijkstra, is a deadlock avoidance algorithm that ensures system safety.
                It maintains the system in a safe state by carefully managing resource allocation.
              </p>
              <CodeBlock
                code={`/* Complete Banker's Algorithm implementation */
struct bankers_state {
    int *available;
    int **maximum;
    int **allocation;
    int **need;
    int num_processes;
    int num_resources;
};

/* Check if resources can be safely allocated */
int is_safe_allocation(struct bankers_state *state) {
    int *work = malloc(state->num_resources * sizeof(int));
    int *finish = calloc(state->num_processes, sizeof(int));
    
    /* Initialize work = available */
    memcpy(work, state->available, 
           state->num_resources * sizeof(int));
    
    /* Find an unfinished process that can complete */
    while(1) {
        int found = 0;
        for(int i = 0; i < state->num_processes; i++) {
            if(!finish[i]) {
                int can_allocate = 1;
                
                /* Check if process can get needed resources */
                for(int j = 0; j < state->num_resources; j++) {
                    if(state->need[i][j] > work[j]) {
                        can_allocate = 0;
                        break;
                    }
                }
                
                if(can_allocate) {
                    /* Process can complete, release its resources */
                    for(int j = 0; j < state->num_resources; j++) {
                        work[j] += state->allocation[i][j];
                    }
                    finish[i] = 1;
                    found = 1;
                }
            }
        }
        if(!found) break;
    }
    
    /* Check if all processes can finish */
    for(int i = 0; i < state->num_processes; i++) {
        if(!finish[i]) {
            free(work);
            free(finish);
            return 0;  /* Unsafe state */
        }
    }
    
    free(work);
    free(finish);
    return 1;  /* Safe state */
}

/* Request resources for a process */
int request_resources(struct bankers_state *state, 
                     int process_id, 
                     int *request) {
    /* Check if request is valid */
    for(int i = 0; i < state->num_resources; i++) {
        if(request[i] > state->need[process_id][i]) {
            return 0;  /* Error: process exceeds maximum claim */
        }
        if(request[i] > state->available[i]) {
            return 0;  /* Error: resources not available */
        }
    }
    
    /* Try to allocate resources */
    for(int i = 0; i < state->num_resources; i++) {
        state->available[i] -= request[i];
        state->allocation[process_id][i] += request[i];
        state->need[process_id][i] -= request[i];
    }
    
    /* Check if resulting state is safe */
    if(is_safe_allocation(state)) {
        return 1;  /* Resources allocated */
    }
    
    /* If unsafe, rollback changes */
    for(int i = 0; i < state->num_resources; i++) {
        state->available[i] += request[i];
        state->allocation[process_id][i] -= request[i];
        state->need[process_id][i] += request[i];
    }
    
    return 0;  /* Cannot safely allocate resources */
}

/* Release resources from a process */
void release_resources(struct bankers_state *state, 
                      int process_id, 
                      int *release) {
    for(int i = 0; i < state->num_resources; i++) {
        state->available[i] += release[i];
        state->allocation[process_id][i] -= release[i];
        state->need[process_id][i] += release[i];
    }
}`}
                language="c"
              />
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Deadlock Detection: Theoretical Algorithm</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Deadlock detection involves analyzing the state of the system to determine if a deadlock exists.
                The algorithm is similar to the Banker's Algorithm but only considers current allocations.
              </p>
              <CodeBlock
                code={`/* Deadlock Detection Algorithm */
struct detection_state {
    int *available;
    int **allocation;
    int **request;
    int num_processes;
    int num_resources;
};

int* detect_deadlock(struct detection_state *state) {
    int *deadlocked = calloc(state->num_processes, sizeof(int));
    int *work = malloc(state->num_resources * sizeof(int));
    int *finish = calloc(state->num_processes, sizeof(int));
    
    /* Initialize work = available */
    memcpy(work, state->available, 
           state->num_resources * sizeof(int));
    
    /* Find processes that can complete */
    int changed;
    do {
        changed = 0;
        for(int i = 0; i < state->num_processes; i++) {
            if(!finish[i]) {
                int can_complete = 1;
                
                /* Check if process can get needed resources */
                for(int j = 0; j < state->num_resources; j++) {
                    if(state->request[i][j] > work[j]) {
                        can_complete = 0;
                        break;
                    }
                }
                
                if(can_complete) {
                    /* Process can complete */
                    finish[i] = 1;
                    changed = 1;
                    
                    /* Release its resources */
                    for(int j = 0; j < state->num_resources; j++) {
                        work[j] += state->allocation[i][j];
                    }
                }
            }
        }
    } while(changed);
    
    /* Any process that couldn't finish is deadlocked */
    for(int i = 0; i < state->num_processes; i++) {
        deadlocked[i] = !finish[i];
    }
    
    free(work);
    free(finish);
    return deadlocked;
}

/* Recovery through resource preemption */
void recover_through_preemption(struct detection_state *state, 
                              int *deadlocked) {
    for(int i = 0; i < state->num_processes; i++) {
        if(deadlocked[i]) {
            /* Release all resources held by deadlocked process */
            for(int j = 0; j < state->num_resources; j++) {
                state->available[j] += state->allocation[i][j];
                state->allocation[i][j] = 0;
            }
            /* Process needs to be restarted */
        }
    }
}`}
                language="c"
              />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}