async function cachedData(db, prefix, pid) {
    let key = `${prefix}_${pid}`
    try {
        let doc = await db.get(key)
        return doc.data
    } catch(error) {
        console.log(`cachedData error: ${error}`)
    }
}

async function cacheData(db, prefix, pid, data) {
    let key = `${prefix}_${pid}`
    await db.put({_id: key, data: data})
}