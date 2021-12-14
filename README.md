### An exercise to process logs
1. Extract extensions, and count unique files per extension


### To Run:

```
# install
npm install

# Start log processor with worker thread
npm run start ./logs/log1.txt
CASE_SENSISTIVE=true WORKER_COUNT=4 node src/index.js ./logs/log1.txt

# Start log processor single threaded
npm run start:single ./logs/log1.txt
CASE_SENSISTIVE=true WORKER_COUNT=0 node src/index.js ./logs/log1.txt

# run test
npm run test
npm run test:coverage
```

### Design
With N Reducers, main thread distributes JSON entries evenly.  
Each reducer outputs it's intermediate result for final aggregation
```
 ┌────────────────────┐    Generate intermediate result per reducer
 │                    │           ┌──────────────────────┐
 │                    │           │                      │
 │                    │           │                      │
 │                    │  JSON     │    Reducer 1         ├─────────┐
 │                    ├──────────►│                      │         │
 │                    │           │                      │         │
 │                    │           └──────────────────────┘         │
 │                    │                                            │
 │                    │           ┌──────────────────────┐         │
 │                    │           │                      │         │
 │                    │  JSON     │                      │         │
 │                    ├──────────►│    Reducer 2         ├─────────►
 │     Main Thread    │           │                      │         │
 │                    │           │                      │         │
 │                    │           └──────────────────────┘         │
 │                    │                                            │
 │                    │           ┌──────────────────────┐         │
 │                    │           │                      │         │
 │                    │           │                      │         │
 │                    │  JSON     │    Reducer N         │         │
 │                    ├──────────►│                      ├─────────►
 │ ┌────────────────┐ │           │                      │         │
 │ │   Aggregate    │ │           └──────────────────────┘         │
 │ │  final result  | │                                            │
 │ │                │ │                                            │
 │ │                │ │◄───────────────────────────────────────────┘
 │ └────────────────┘ │           N intermediate results
 │                    │
 └────────────────────┘

```

