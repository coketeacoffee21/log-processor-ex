import WorkerThread from 'worker_threads'
import { parseField, dictAddfname } from './helper.js'

const parentPort = WorkerThread.parentPort
const workerData = WorkerThread.workerData

export class Reducer {
    dict = new Map()
    processCount = 0
    errorCount = 0
    isCaseSensistive = true

    constructor(parentPort, isCaseSensistive) {
        this.parentPort = parentPort
        this.isCaseSensistive = isCaseSensistive
    }

    lineHandler(line) {
        const finished = line === null
        if (finished) {
            this.parentPort.postMessage({ dict: this.dict, processCount: this.processCount, errorCount: this.errorCount })
            this.parentPort.close()
        } else {
            try {
                const [fname, ext] = parseField(line, this.isCaseSensistive)
                dictAddfname(this.dict, ext, fname)
                this.processCount++
            } catch (err) {
                this.errorCount++
            }
        }
    }
}

if (parentPort !== null) {
    const reducer = new Reducer(parentPort, workerData.isCaseSensistive)
    parentPort.on('message', line => reducer.lineHandler(line))
}