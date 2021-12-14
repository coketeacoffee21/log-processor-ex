### An exercise to process logs
1. Extract extensions, and count unique files per extension


Some basic Git commands are:

```
# Start log processor
npm run start

# Start log processor single threaded
npm run start:single

# run test
npm run test
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