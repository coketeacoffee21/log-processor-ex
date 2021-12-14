import { LogReader } from './LogReader.js'
import path from 'path'
const WORKER_COUNT = parseInt(process.env.WORKER_COUNT) ?? 4
const CASE_SENSISTIVE = process.env.CASE_SENSISTIVE === 'true'
const filepath = path.resolve(process.argv[2]);

async function main() {
    let dict
    const reader = new LogReader(filepath, CASE_SENSISTIVE)
    reader.initWorkerPool(WORKER_COUNT)
    try {
        dict = await reader.process()
    } catch (err) {
        console.error('An error has occured! Printing partial result:', )
        console.error('Stat:', JSON.stringify(reader.getInfo()))
        dict = err
    }
    for (const [key, value] of dict.entries()) {
        console.log(key + ': ' + value.size)
    }
}

main()
