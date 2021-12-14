### An exercise to process logs
1. Extract extensions, and count unique files per extension


### To Run:

```
# install
npm install

# Start log processor with worker thread
npm run start ../logs/log1.txt
CASE_SENSISTIVE=true WORKER_COUNT=4 node src/index.js ../logs/log1.txt

# Start log processor single threaded
npm run start:single ../logs/log1.txt
CASE_SENSISTIVE=true WORKER_COUNT=0 node src/index.js ../logs/log1.txt

# run test
npm run test
npm run test:coverage
```

### Design
```
 ┌────────────────────┐                Aggregate sub-results
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
 │                    │  JSON     │    Reducer 3         │         │
 │                    ├──────────►│                      ├─────────►
 │ ┌────────────────┐ │           │                      │         │
 │ │   Aggregate    │ │           └──────────────────────┘         │
 │ │  final result  | │                                            │
 │ │                │ │                                            │
 │ │                │ │◄───────────────────────────────────────────┘
 │ └────────────────┘ │                  Sub-results
 │                    │
 └────────────────────┘

```

