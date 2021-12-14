const DOT = '.'
export const NO_EXT_NAME = ''

export const getNameExt = (nm) => {
    const nmParts = nm.split(DOT)
    const ext = nmParts.pop()
    const fname = nmParts.join(DOT)

    if (nmParts.length > 0 && fname.length && ext !== NO_EXT_NAME) {
        return [nmParts.join(DOT), ext]
    } else {
        return [nm, NO_EXT_NAME]
    }
}

export const parseField = (jsonStr, isCaseSensistive) => {
    try {
        const entry = JSON.parse(jsonStr)
        if ('nm' in entry) {
            return isCaseSensistive ? getNameExt(entry.nm) : getNameExt(entry.nm).map(it => it.toLowerCase())
        } else {
            throw new TypeError('nm field does not exist')
        }
    } catch (err) {
        console.error(`Error Caught for line:'${jsonStr}'\n`, err)
        throw err
    }
}

export const dictAddfname = (dict, ext, fname) => {
    const names = dict.get(ext) ?? new Set()
    names.add(fname)
    dict.set(ext, names)
}
