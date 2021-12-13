import { LogReader } from './LogReader.js'

async function main() {
    // const reader = new LogReader('../logs/16000k-normal-real.txt')
    const reader = new LogReader('../logs/log1.txt')
    const start = +new Date()
    const dict = await reader.process()
    const end = +new Date()
    // console.log('dict', dict)
    for (const [key, value] of dict.entries()) {
        console.log(key + ': ' + value.size)
    }
    console.log('Lines processed:', reader.getInfo(), end - start)
}

main()
