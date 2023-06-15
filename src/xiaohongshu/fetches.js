let fetch = window.edgeFetch;

export async function isLoginOk() {
    let response = await fetch('https://pgy.xiaohongshu.com/api/solar/user/info', {redirect: 'manual'})
    return response.ok
}

export async function getDataSummary(db, pid) {
    let prefix = 'data_summary'
    let data = await cachedData(db, prefix, pid)

    if (data) return data.data

    let response = await fetch(`https://pgy.xiaohongshu.com/api/solar/kol/dataV3/dataSummary?userId=${pid}&business=0`)
    data = await response.json()
    await cacheData(db, prefix, pid, data)
    return data.data
}

export async function getFans(db, pid) {
    let prefix = 'fans'
    let data = await cachedData(db, prefix, pid)

    if (data) return data.data

    let response = await fetch(`https://pgy.xiaohongshu.com/api/solar/kol/data/${pid}/fans_profile`)
    data = await response.json()
    await cacheData(db, prefix, pid, data)
    return data.data
}

export async function getFansSummary(db, pid) {
    let prefix = 'fans_summary'
    let data = await cachedData(db, prefix, pid)

    if (data) return data.data

    let response = await fetch(`https://pgy.xiaohongshu.com/api/solar/kol/dataV3/fansSummary?userId=${pid}`)
    data = await response.json()
    await cacheData(db, prefix, pid, data)
    return data.data
}

export async function getKolTag(db, pid) {
    let prefix = 'kol_tag'
    let data = await cachedData(db, prefix, pid)

    if (data) return data.data

    let response = await fetch(`https://pgy.xiaohongshu.com/api/solar/kol/dataV2/kolFeatureTags?userId=${pid}`)
    data = await response.json()
    await cacheData(db, prefix, pid, data)
    return data.data
}

export async function getNotes(db, pid) {
    let prefix = 'notes'
    let data = await cachedData(db, prefix, pid)

    if (data) return data.data

    let response = await fetch(`https://pgy.xiaohongshu.com/api/solar/kol/dataV2/notesDetail?advertiseSwitch=1&orderType=1&pageNumber=1&pageSize=8&userId=${pid}&noteType=4`)
    data = await response.json()
    await cacheData(db, prefix, pid, data)
    return data.data
}

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