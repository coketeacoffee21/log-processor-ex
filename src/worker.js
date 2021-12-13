import { parentPort } from 'worker_threads'
import { parseField, dictAddfname } from './helper.js'

let dict = new Map()
let processed = 0
let error = null

parentPort.on('message', line => {
    const finished = line === null
    if (finished) {
        parentPort.postMessage({ dict, processed, error })
        parentPort.close()
    } else {
        try {
            const [fname, ext] = parseField(line)
            dictAddfname(dict, ext, fname)
            processed++
        } catch (err) {
            error = err
        }
    }
})