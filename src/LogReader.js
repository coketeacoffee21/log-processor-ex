import { createReadStream } from 'fs'
import { createInterface } from 'readline'
import { parseField, dictAddfname } from './helper.js'
import { Worker } from 'worker_threads'

const WORKER_COUNT = parseInt(process.env.WORKER_COUNT || 4)
const THREADED = WORKER_COUNT !== 0

export class LogReader {
    logFile = null
    dict = new Map()
    lineCount = 0
    processCount = 0
    workers = []
    promiseResolve = null
    promiseReject = null
    readFinished = false

    constructor(logPath) {
        this.logFile = new URL(logPath, import.meta.url)
        for (let i = 0; i < WORKER_COUNT && THREADED; i++) {
            this.workers[i] = new Worker(new URL('./worker.js', import.meta.url))
            this.workers[i].on('error', code => new Error(`Worker error, exit code ${code}`))
            this.workers[i].on('message', result => {
                const { dict: subDict, processed } = result
                this.mergeSubDict(subDict)
                this.processCount = this.processCount + processed
                this.resultResolve()
            })
        }
    }

    mergeSubDict(subDict) {
        for (const [ext, subset] of subDict.entries()) {
            const names = this.dict.get(ext) ?? new Set()
            for (let item of subset) {
                names.add(item)
            }
            this.dict.set(ext, names)
        }
    }

    lineHandler(line) {
        if (THREADED) {
            this.workers[this.lineCount++ % WORKER_COUNT].postMessage(line)
        } else {
            const [fname, ext] = parseField(line)
            dictAddfname(this.dict, ext, fname)
            this.processCount++
            this.lineCount++
        }
    }

    async process() {
        return new Promise((resolve, reject) => {
            this.promiseResolve = resolve
            this.promiseReject = reject
            const filestream = createReadStream(this.logFile, { encoding: 'utf-8' })
            const lineReader = createInterface({ input: filestream })
            // lineReader.on('error', (err) => reject(err)) Error handling
            lineReader.on('line', line => this.lineHandler(line))
            lineReader.on('close', () => {
                this.readFinished = true
                for (let i = 0; i < this.workers.length; i++) {
                    this.workers[i].postMessage(null)
                }
                this.resultResolve()
            })
        })
    }

    resultResolve() {
        if (this.readFinished && this.lineCount === this.processCount) {
            this.promiseResolve(this.dict)
        }
    }

    getLineCount() {
        return this.lineCount
    }

    getInfo() {
        return {
            lineCount: this.lineCount,
            worker: WORKER_COUNT
        }
    }

}