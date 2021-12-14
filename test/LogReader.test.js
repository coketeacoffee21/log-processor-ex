import fs from 'fs'
import readline from 'readline'
import WorkerThread from 'worker_threads'
import { expect, assert } from 'chai'
import sinon from 'sinon'
import { LogReader } from '../src/LogReader.js'
import { dictAddfname } from '../src/helper.js'

const sandbox = sinon.createSandbox()
let logReader = null

describe('LogReader', function() {

    afterEach(function () {
        sandbox.restore()
        for (let i = 0; i < logReader.workers.length; i++) {
            logReader.workers[i].postMessage(null)
        }
    })

    describe('handle worker pool properly', function() {
        it('should be able to merge sub-result to the master Hash Map', function() {
            const dict1 = new Map()
            const dict2 = new Map()
            dictAddfname(dict1, 'pdf', 'ABCDEF')
            dictAddfname(dict2, 'pdf', 'foobar')
            dictAddfname(dict1, 'txt', 'HelloWorld')
            dictAddfname(dict2, 'txt', 'HelloWorld')
            const subResult1 = { dict: dict1, processCount: 2, errorCount: 0 }
            const subResult2 = { dict: dict2, processCount: 2, errorCount: 0 }

            const caseSensistive = true
            logReader = new LogReader('path/to/file.txt', caseSensistive)
            logReader.mergeSubResult(subResult1)
            logReader.mergeSubResult(subResult2)

            expect(logReader.processCount).to.equals(4)
            expect(logReader.errorCount).to.equals(0)
            assert.hasAllDeepKeys(logReader.dict, ['pdf', 'txt'])
            assert.hasAllDeepKeys(logReader.dict.get('pdf'), ['ABCDEF', 'foobar'])
            assert.hasAllDeepKeys(logReader.dict.get('txt'), ['HelloWorld'])
        })

        it('should init worker pool if workerCount > 0', function() {
            const caseSensistive = true
            const workerCount = 4
            logReader = new LogReader('path/to/file.txt', caseSensistive)
            logReader.initWorkerPool(workerCount)
            expect(logReader.workers.length).to.equals(workerCount)
            // logReader.signalFinished()
        })

        it('should NOT init worker pool if workerCount == 0', function() {
            const caseSensistive = true
            const workerCount = 0
            logReader = new LogReader('path/to/file.txt', caseSensistive)
            logReader.initWorkerPool(workerCount)
            expect(logReader.workers.length).to.equals(workerCount)
        })
    })

    describe('handle log entries properly', function() {
        it('process() should create read stream with readline', function() {
            const lineReader = { on: function () {} }
            const lineReaderOnStub = sandbox.stub(lineReader, 'on')
            const fsStub = sandbox.stub(fs, 'createReadStream').returns()
            const readlineStub = sandbox.stub(readline, 'createInterface').returns(lineReader)
            const caseSensistive = true
            logReader = new LogReader('path/to/file.txt', caseSensistive)
            logReader.process()
            expect(fsStub.callCount).to.equals(1)
            expect(readlineStub.callCount).to.equals(1)
            expect(lineReaderOnStub.getCall(0).calledWith('line')).to.be.true
            expect(lineReaderOnStub.getCall(1).calledWith('close')).to.be.true
        })

        it('lineHandler() should handle on main thread if worker pool not initialized', function() {
            const logEntry = '{"nm": "foo.bar"}'
            const caseSensistive = true
            logReader = new LogReader('path/to/file.txt', caseSensistive)
            logReader.lineHandler(logEntry)
            expect(logReader.processCount).to.equals(1)
            expect(logReader.errorCount).to.equals(0)
            assert.hasAllDeepKeys(logReader.dict, ['bar'])
            assert.hasAllDeepKeys(logReader.dict.get('bar'), ['foo'])
        })

        it('lineHandler() should send log entry to workers if worker count > 0', function() {
            const logEntry = '{"nm": "foo.bar"}'
            const caseSensistive = true
            const workerCount = 4
            const worker = {
                on: function() {},
                postMessage: function() {},
            }
            const workerPostMessageStub = sandbox.stub(worker, 'postMessage')
            const workerStub = sandbox.stub(WorkerThread, 'Worker').returns(worker)
            logReader = new LogReader('path/to/file.txt', caseSensistive)
            logReader.initWorkerPool(workerCount)
            logReader.lineHandler(logEntry)
            expect(workerStub.callCount).to.equals(workerCount)
            expect(workerPostMessageStub.getCall(0).calledWith(logEntry)).to.be.true
        })

        it('signalFinished() should send null signal to workers', function() {
            const lineReader = { on: function () {} }
            const lineReaderOnStub = sandbox.stub(lineReader, 'on')
            const fsStub = sandbox.stub(fs, 'createReadStream').returns()
            const readlineStub = sandbox.stub(readline, 'createInterface').returns(lineReader)
            const caseSensistive = true
            const workerCount = 4
            const worker = {
                on: function() {},
                postMessage: function() {},
            }
            const workerPostMessageStub = sandbox.stub(worker, 'postMessage')
            const workerStub = sandbox.stub(WorkerThread, 'Worker').returns(worker)

            logReader = new LogReader('path/to/file.txt', caseSensistive)
            logReader.initWorkerPool(workerCount)
            logReader.process()
            logReader.signalFinished()

            expect(fsStub.callCount).to.equals(1)
            expect(readlineStub.callCount).to.equals(1)
            expect(lineReaderOnStub.getCall(0).calledWith('line')).to.be.true
            expect(lineReaderOnStub.getCall(1).calledWith('close')).to.be.true
            expect(workerStub.callCount).to.equals(workerCount)
            for (let i = 0; i < workerCount; i++) {
                expect(workerPostMessageStub.getCall(i).calledWith(null)).to.be.true
            }
        })

    })
})
