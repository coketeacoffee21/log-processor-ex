// import { expect, assert } from 'chai'
import chai from 'chai'
import sinon from 'sinon'
import { Reducer } from '../src/reducer.js'

const expect = chai.expect
const assert = chai.assert

const sandbox = sinon.createSandbox()

describe('Reducer', function() {

    afterEach(function () {
        sandbox.restore()
    })

    describe('h123', function() {
        it('should handle line as json entry', function() {
            const parentPort = {
                on: function() {},
                postMessage: function() {},
                close: function() {}
            }
            const numberOfLogs = 1000
            const logEntry = '{"nm": "foo.bar"}'
            const reducer = new Reducer(parentPort, true)
            for (let i = 0; i < numberOfLogs; i++) {
                reducer.lineHandler(logEntry)
            }
            expect(reducer.processCount).to.equals(numberOfLogs)
            expect(reducer.errorCount).to.equals(0)
            assert.hasAllDeepKeys(reducer.dict, ['bar'])
            assert.hasAllDeepKeys(reducer.dict.get('bar'), ['foo'])
        })

        it('should post result to main thread and close port when null received', function() {
            const parentPort = {
                on: function() {},
                postMessage: function() {},
                close: function() {}
            }
            const logEntry = '{"nm": "foo.bar"}'

            const parentPortPostMessageStub = sandbox.stub(parentPort, 'postMessage')
            const parentPortCloseStub = sandbox.stub(parentPort, 'close')
            const reducer = new Reducer(parentPort, true)
            reducer.lineHandler(logEntry)
            reducer.lineHandler(null)

            const subResult = { dict: reducer.dict, processCount: reducer.processCount, errorCount: reducer.errorCount }

            expect(reducer.processCount).to.equals(1)
            assert.hasAllDeepKeys(reducer.dict, ['bar'])
            assert.hasAllDeepKeys(reducer.dict.get('bar'), ['foo'])
            expect(parentPortPostMessageStub.getCall(0).calledWith(subResult)).to.be.true
            expect(parentPortCloseStub.getCall(0).calledWith()).to.be.true
        })
    })
})
