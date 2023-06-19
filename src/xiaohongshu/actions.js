import {getBlogger, getDataSummary, getFans, getFansSummary, getKolTag, getNotes} from "./fetches";
import {getAge, getCities, getContentTags, halfUp} from './utils'


async function InfoFetch({meta}, pid) {
    let result = {pid}
    let info = await getDataSummary(pid)
    result = Object.assign(result, {
        pictureReadCost: info.pictureReadCost==='0.0'?'--':halfUp(parseFloat(info.pictureReadCost)/100),
        videoReadCost: info.videoReadCost==='0.0'?'--':halfUp(parseFloat(info.videoReadCost)/100)
    })
    info = await getFans(pid)
    let cities = getCities(info.cities)
    cities = cities.map(city=>city==='未知'?'':halfUp(parseFloat(city), 3))
    let firstCity = cities.reduce((a,b)=>{
        if (!b) return parseFloat(a)
        return parseFloat(a)+parseFloat(b)
    }, 0)
    let [sh, bj, gz, sz1, hz, cd, nj, tj, cq, wh, sz2] = cities

    result = Object.assign(result, {
        age: halfUp(getAge(info.ages), 3),
        sh, bj, gz, sz1, hz, cd, nj, tj, cq, wh, sz2,
        firstCity: firstCity.toFixed(3),
        female: halfUp(info.gender.female, 4)
    })
    info = await getFansSummary(pid)
    result = Object.assign(result, {
        fansGrowthRate: (parseFloat(info.fansGrowthRate)/100).toString()
    })
    info = await getKolTag(pid)
    result = Object.assign(result, {
        kolTags: info.map(x => x.name)
    })
    info = await getNotes(pid)
    result = Object.assign(result, {
        notes: getContentTags(info.list)
    })
    info = await getBlogger(pid)
    result = Object.assign(result, {
        tags: getContentTags(info.contentTags, 'blogger'),
        interMidNum: info.interMidNum,
        clickMidNum: info.clickMidNum,
        videoPrice: info.videoPrice?info.videoPrice:'暂停接单',
        picturePrice: info.picturePrice?info.picturePrice:'暂停接单',
        redId: info.redId
    })

    if (!result.tags) result.tags = result.notes
    this.emit(`uuid.${meta.uuid}:InfoFetched`, {meta, data: {pid}})
    return result
}

export default [InfoFetch]