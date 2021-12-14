for (let i = 0; i < 16_000_000; i ++) {
    const ext = i % 5000
    const log = `{"ts":1551140354,"pt":55,"si":"3380fb19-0bdb-46ab-8781-e4c5cd448074","uu":"0dd24034-36d6-4b1e-a6c1-a52cc984f105","bg":"77e28e28-745a-474b-a496-3c0e086eaec0","sha":"abb3ec1b8174043d5cd21d21fbe3c3fb3e9a11c7ceff3314a3222404feedda52","nm":"${i}.${ext}","ph":"/efvrfutgp/expgh/phkkrw","dp":2}`
    console.log(log)
}