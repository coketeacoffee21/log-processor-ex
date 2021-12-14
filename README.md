### An exercise to process logs
1. Extract extensions, and count unique files per extension


### To Run:

```
# Start log processor with worker thread
npm run start
CASE_SENSISTIVE=true WORKER_COUNT=4 node src/index.js

# Start log processor single threaded
npm run start:single
CASE_SENSISTIVE=true WORKER_COUNT=0 node src/index.js

# run test
npm run test
npm run test:coverage
```

### Design
```
┌──────────────────────────┐                Aggregate
│                          │           ┌──────────────────────┐
│                          │           │                      │
│                          │           │                      │
│                          │  JSON     │    Reducer 1         ├───────────────────────┐
│                          ├──────────►│                      │                       │
│                          │           │                      │                       │
│                          │           └──────────────────────┘                       │
│                          │                                                          │
│                          │           ┌──────────────────────┐                       │
│                          │           │                      │                       │
│                          │  JSON     │                      │                       │
│       Main Thread        ├──────────►│    Reducer 2         ├───────────────────────►
│                          │           │                      │                       │
│                          │           │                      │                       │
│                          │           └──────────────────────┘                       │
│                          │                                                          │
│                          │           ┌──────────────────────┐                       │
│                          │           │                      │                       │
│                          │           │                      │                       │
│                          │  JSON     │    Reducer 3         │                       │
│                          ├──────────►│                      ├──-────────────────────►
│                          │           │                      │                       │
│                          │           └──────────────────────┘                       │
│                          │                                                          │
│                          │                                                          │
│                          │◄─────────────────────────────────────────────────────────┘
│                          │                              Sub-result
│                          │
└──────────────────────────┘
```

