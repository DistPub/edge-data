export async function cachedData(db, prefix, pid, raw_doc=false) {
    let key = `${prefix}_${pid}`
    try {
        let doc = await db.get(key)
        if (raw_doc) return doc
        return doc.data
    } catch(error) {
        console.log(`cachedData error: ${error}`)
    }
}

export async function cacheData(db, prefix, pid, data) {
    let key = `${prefix}_${pid}`
    let cache = await cachedData(db, prefix, pid, true)
    let doc = {_id: key, data: data}
    if (cache) doc._rev = cache._rev
    await db.put(doc)
}