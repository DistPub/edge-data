import {
    getAuthorPlatformChannelInfo,
    getAuthorPlatformChannelInfoV2,
    searchNickName
} from "./fetches";


async function InfoFetch({meta}, nick) {
    let result = {nickName: nick}
    let data = await searchNickName(nick)

    if (data.authors.length === 0) {
        result.status = '没有搜索到任何结果'
    } else if (data.authors[0].attribute_datas['nick_name'] === nick) {
        result.status = 'ok'
        result.id = data.authors[0].attribute_datas.id

        data = await getAuthorPlatformChannelInfo(result.id)
        result.wechat = data?.card_info?.wechat
        result.self_intro = data?.card_info?.self_intro

        if (!result.self_intro) {
            data = await getAuthorPlatformChannelInfoV2(result.id)
            result.self_intro = data.self_intro
        }
    } else {
        result.status = '没有搜索到这个昵称，只有其他类似结果'
    }
    this.emit(`uuid.${meta.uuid}:InfoFetched`, {meta, data: {nickName: nick}})
    return result
}
Object.defineProperty(InfoFetch, 'name', {value: 'InfoFetch'})

export default [InfoFetch]
