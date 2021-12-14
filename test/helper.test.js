import { expect } from 'chai'
import sinon from 'sinon'
import { getNameExt, parseField, dictAddfname, NO_EXT_NAME } from '../src/helper.js'

sinon.stub(console, 'error')

describe('Helper functions', function() {
    describe('getNameExt should return name and extension', function() {
        it('should extract filename and extension', function() {
            const [fname, ext] = getNameExt('sTrInG.txt')
            expect(fname).to.equals('sTrInG')
            expect(ext).to.equals('txt')
        })

        it('should handle more than one extension', function() {
            const [fname, ext] = getNameExt('sTrInG.tar.gz')
            expect(fname).to.equals('sTrInG.tar')
            expect(ext).to.equals('gz')
        })

        it('should handle fileames without extension', function() {
            const [fname, ext] = getNameExt('log')
            expect(fname).to.equals('log')
            expect(ext).to.equals(NO_EXT_NAME)
        })

        it('should handle hidden files', function() {
            const [fname, ext] = getNameExt('.zshrc')
            expect(fname).to.equals('.zshrc')
            expect(ext).to.equals(NO_EXT_NAME)
        })

        it('should handle fileame ends with dot', function() {
            const [fname, ext] = getNameExt('zshrc.')
            expect(fname).to.equals('zshrc.')
            expect(ext).to.equals(NO_EXT_NAME)
        })
    })

    describe('parseField should access `nm` field from log entries', function() {
        const jsonObj = {
            ts: 1551140352,
            pt: 55,
            si: '3380fb19-0bdb-46ab-8781-e4c5cd448074',
            uu: '0dd24034-36d6-4b1e-a6c1-a52cc984f105',
            bg: '77e28e28-745a-474b-a496-3c0e086eaec0',
            sha: 'abb3ec1b8174043d5cd21d21fbe3c3fb3e9a11c7ceff3314a3222404feedda52',
            nm: 'EXAmple.tar.Gz',
            ph: '/efvrfutgp/expgh/phkkrw',
            dp: 2
        }

        it('should be able to parse nm field with case sensistive option', function() {
            const CASE_SENSISTIVE = true
            const [fname, ext] = parseField(JSON.stringify(jsonObj), CASE_SENSISTIVE)
            expect(fname).to.equals('EXAmple.tar')
            expect(ext).to.equals('Gz')
        })

        it('should be able to parse nm field with case insensistive option', function() {
            const CASE_SENSISTIVE = false
            const [fname, ext] = parseField(JSON.stringify(jsonObj), CASE_SENSISTIVE)
            expect(fname).to.equals('example.tar')
            expect(ext).to.equals('gz')
        })

        it('should throw error with broken json', function() {
            const CASE_SENSISTIVE = false
            try {
                parseField(JSON.stringify('{"nm":"abcde.txt'), CASE_SENSISTIVE)
            } catch (err) {
                expect(err instanceof TypeError).to.equals(true)
            }
        })

        it('should throw error with empty line', function() {
            const CASE_SENSISTIVE = false
            try {
                parseField(JSON.stringify(''), CASE_SENSISTIVE)
            } catch (err) {
                expect(err instanceof TypeError).to.equals(true)
            }
        })

        it('should throw error when nm field does not exist', function() {
            const CASE_SENSISTIVE = false
            try {
                parseField(JSON.stringify('{"foo":"bar"}'), CASE_SENSISTIVE)
            } catch (err) {
                expect(err instanceof TypeError).to.equals(true)
            }
        })
    })

    describe('dictAddfname should add filename to the Set per extension as key in Hash Map. Map<string, Set>', function() {
        it('should add filename to the Set given an extension as key', function() {
            const dict = new Map()
            const ext = 'txt'
            const fname = 'foo'

            for (let i = 0; i < 1000; i++) {
                dictAddfname(dict, ext, fname)
            }
            const nameSet = dict.get(ext)
            expect(dict.has(ext)).to.equals(true)
            expect(nameSet.size).to.equals(1)
            expect(nameSet.has(fname)).to.equals(true)
        })
    })

})
