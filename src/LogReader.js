import fs from 'fs'
import readline from 'readline'
import { parseField, dictAddfname } from './helper.js'
import WorkerThread from 'worker_threads'

export class LogReader {
    logFile = null
    expectedWorkerCount = 0
    isCaseSensistive = true
    workers = []
    dict = new Map()
    readFinished = false
    lineCount = 0
    processCount = 0
    errorCount = 0
    promiseResolve = null
    promiseReject = null

    constructor(logPath, isCaseSensistive) {
        this.isCaseSensistive = isCaseSensistive
        this.logFile = new URL(logPath, import.meta.url)
    }

    initWorkerPool(expectedWorkerCount) {
        this.expectedWorkerCount = expectedWorkerCount
        for (let i = 0; i < this.expectedWorkerCount; i++) {
            this.workers[i] = new WorkerThread.Worker(new URL('./reducer.js', import.meta.url), { workerData: { isCaseSensistive: this.isCaseSensistive } })
            this.workers[i].on('error', code => new Error(`Worker error, exit code ${code}`))
            this.workers[i].on('message', result => this.mergeSubResult(result))
        }
        return this.workers
    }

    mergeSubResult(result) {
        const { dict: subDict, processCount, errorCount } = result
        for (const [ext, subset] of subDict.entries()) {
            const names = this.dict.get(ext) ?? new Set()
            for (let item of subset) {
                names.add(item)
            }
            this.dict.set(ext, names)
        }
        this.processCount = this.processCount + processCount
        this.errorCount = this.errorCount + errorCount
        this.resultResolve()
    }

    lineHandler(line) {
        if (this.workers.length > 0) {
            this.workers[this.lineCount++ % this.workers.length].postMessage(line)
        } else {
            try {
                const [fname, ext] = parseField(line, this.isCaseSensistive)
                dictAddfname(this.dict, ext, fname)
                this.processCount++
            } catch (err) {
                this.errorCount++
            }
            this.lineCount++
        }
    }

    async process() {
        return new Promise((resolve, reject) => {
            this.promiseResolve = resolve
            this.promiseReject = reject
            const filestream = fs.createReadStream(this.logFile, { encoding: 'utf-8' })
            const lineReader = readline.createInterface({ input: filestream })
            lineReader.on('line', line => this.lineHandler(line))
            lineReader.on('close', () => this.signalFinished())
        })
    }

    signalFinished() {
        this.readFinished = true
        for (let i = 0; i < this.workers.length; i++) {
            this.workers[i].postMessage(null)
        }
        this.resultResolve()
    }

    resultResolve() {
        if (this.readFinished && this.lineCount === (this.processCount + this.errorCount)) {
            if (this.errorCount > 0) {
                this.promiseReject(this.dict)
            } else {
                this.promiseResolve(this.dict)
            }
        }
    }

    getInfo() {
        return {
            lineCount: this.lineCount,
            processCount: this.processCount,
            errorCount: this.errorCount,
            expectedWorkerCount: this.expectedWorkerCount,
            workerCount: this.workers.length,
            threaded: this.workers.length > 0,
            isCaseSensistive: this.isCaseSensistive
        }
    }

}