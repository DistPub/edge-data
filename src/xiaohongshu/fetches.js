import {db} from './context'
import {fetch} from "../context";
import {cachedData, cacheData} from '../cache';

export async function isLoginOk() {
    let response = await fetch('https://pgy.xiaohongshu.com/api/solar/user/info', {redirect: 'manual'})
    return response.ok
}

export async function getDataSummary(pid) {
    let prefix = 'data_summary'
    let data = await cachedData(db, prefix, pid)

    if (data) return data.data

    let response = await fetch(`https://pgy.xiaohongshu.com/api/solar/kol/dataV3/dataSummary?userId=${pid}&business=0`)
    data = await response.json()
    await cacheData(db, prefix, pid, data)
    return data.data
}

export async function getFans(pid) {
    let prefix = 'fans'
    let data = await cachedData(db, prefix, pid)

    if (data) return data.data

    let response = await fetch(`https://pgy.xiaohongshu.com/api/solar/kol/data/${pid}/fans_profile`)
    data = await response.json()
    await cacheData(db, prefix, pid, data)
    return data.data
}

export async function getFansSummary(pid) {
    let prefix = 'fans_summary'
    let data = await cachedData(db, prefix, pid)

    if (data) return data.data

    let response = await fetch(`https://pgy.xiaohongshu.com/api/solar/kol/dataV3/fansSummary?userId=${pid}`)
    data = await response.json()
    await cacheData(db, prefix, pid, data)
    return data.data
}

export async function getKolTag(pid) {
    let prefix = 'kol_tag'
    let data = await cachedData(db, prefix, pid)

    if (data) return data.data

    let response = await fetch(`https://pgy.xiaohongshu.com/api/solar/kol/dataV2/kolFeatureTags?userId=${pid}`)
    data = await response.json()
    await cacheData(db, prefix, pid, data)
    return data.data
}

export async function getNotes(pid) {
    let prefix = 'notes'
    let data = await cachedData(db, prefix, pid)

    if (data) return data.data

    let response = await fetch(`https://pgy.xiaohongshu.com/api/solar/kol/dataV2/notesDetail?advertiseSwitch=1&orderType=1&pageNumber=1&pageSize=8&userId=${pid}&noteType=4`)
    data = await response.json()
    await cacheData(db, prefix, pid, data)
    return data.data
}

export async function getBlogger(pid) {
    let prefix = 'blogger'
    let data = await cachedData(db, prefix, pid)

    if (data) return data.data

    let response = await fetch(`https://pgy.xiaohongshu.com/api/solar/cooperator/user/blogger/${pid}`)
    data = await response.json()
    await cacheData(db, prefix, pid, data)
    return data.data
}
