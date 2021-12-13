import { parentPort } from 'worker_threads'
import { parseField, dictAddfname } from './helper.js'

let dict = new Map()
let processed = 0

parentPort.on('message', line => {
    const finished = line === null
    if (finished) {
        parentPort.postMessage({ dict, processed })
        parentPort.close()
    } else {
        const [fname, ext] = parseField(line)
        dictAddfname(dict, ext, fname)
        processed++
    }
})