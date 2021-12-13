const DOT = '.'

export const getExt = (nm) => {
    const nmParts = nm.split(DOT)
    if (nmParts.length > 1) {
        const ext = nmParts.pop()
        return [nmParts.join(DOT), ext.toLowerCase()]
    } else {
        return [nm, '']
    }
}

export const parseField = (jsonStr) => {
    try {
        const entry = JSON.parse(jsonStr)
        return getExt(entry.nm)
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
