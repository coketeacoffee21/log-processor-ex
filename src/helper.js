const DOT = '.'

export const getExt = (nm) => {
    const nmParts = nm.split(DOT)
    if (nmParts.length > 1) {
        const ext = nmParts.pop()
        return [nmParts.join(DOT), ext]
    } else {
        return [nm, '']
    }
}

export const parseField = (jsonStr, isCaseSensistive) => {
    try {
        const entry = JSON.parse(jsonStr)
        return isCaseSensistive ? getExt(entry.nm) : getExt(entry.nm).map(it => it.toLowerCase())
    } catch (err) {
        console.error(err)
        throw err
    }
}

export const dictAddfname = (dict, ext, fname) => {
    const names = dict.get(ext) ?? new Set()
    names.add(fname)
    dict.set(ext, names)
}
