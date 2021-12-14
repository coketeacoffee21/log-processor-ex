### An exercise to process logs
1. Extract extensions, and count unique files per extension


### TO RUN:

```
# Start log processor
npm run start

# Start log processor single threaded
npm run start:single

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
│                          ├──────────►│                      ├── ────────────────────►
│                          │           │                      │                       │
│                          │           └──────────────────────┘                       │
│                          │                                                          │
│                          │                                                          │
│                          │◄─────────────────────────────────────────────────────────┘
│                          │                              Sub-result
│                          │
└──────────────────────────┘
```

