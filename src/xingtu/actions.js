import {
    getAuthorBaseInfo, getAuthorDailyFans, getAuthorFansDistributionInfo, getAuthorLinkInfo, getAuthorMarketingInfo,
    getAuthorPlatformChannelInfo,
    getAuthorPlatformChannelInfoV2, getAuthorSpreadInfo, getDouyinPage,
    searchNickName,
    searchTagName
} from "./fetches";
import {getDouyinInfo, getFansIndex, getLinkDist, getPcLink, getPercent, getPriceInfo} from "./utils";


async function* TagFetch({ meta }, tag) {
  let has_more = true
  let page = 1
  let data;
  while (has_more) {
    [data, has_more] = await searchTagName(tag, page++)
    this.emit(`uuid.${meta.uuid}:TagFetchTarget`, {direction: 'upstream', meta, data: {
      size: data.authors.length,
      page: page-1
    }})


    for (const author of data.authors) {
      this.emit(`uuid.${meta.uuid}:TagFetchTargetAuthor`, {direction: 'upstream', meta, data: {
        author
      }})
      yield author
    }
  }
}
Object.defineProperty(TagFetch, 'name', {value: 'TagFetch'})

async function AuthorInfoFetch({meta}, author) {
  let result = {
    id: author.attribute_datas.id,
    nickName: author.attribute_datas.nick_name,
    follower: author.attribute_datas.follower,
  }
  let data;
  data = await getAuthorPlatformChannelInfo(result.id)
  result.wechat = data?.card_info?.wechat
  result.self_intro = data?.card_info?.self_intro
  result.mcn = data.card_info?.mcn_info?.mcn_name

  if (!result.self_intro) {
      data = await getAuthorPlatformChannelInfoV2(result.id)
      result.self_intro = data.self_intro
      result.wechat = data?.wechat
      result.mcn = data?.mcn_info?.mcn_name
  }
  return result
}
Object.defineProperty(AuthorInfoFetch, 'name', {value: 'AuthorInfoFetch'})

async function InfoFetch({meta}, nick) {
    this.emit(`uuid.${meta.uuid}:InfoFetching`, {meta, data: {nickName: nick}})
    let result = {nickName: nick}
    let data = await searchNickName(nick)

    if (data.authors.length === 0) {
        result.status = '没有搜索到任何结果'
    } else if (data.authors[0].attribute_datas['nick_name'] === nick) {
        result.status = 'ok'
        let author = data.authors[0]
        result.follower = author.attribute_datas.follower
        result.gender = author.attribute_datas.gender === '1' ? '女' : '男'
        result.city = author.attribute_datas.city
        result.province = author.attribute_datas.province
        result.link_star_index = author.attribute_datas.link_star_index
        result.link_spread_index = author.attribute_datas.link_spread_index
        result.link_shopping_index = author.attribute_datas.link_shopping_index
        result.link_convert_index = author.attribute_datas.link_convert_index
        result.prospective_20_60_cpm = author.attribute_datas.prospective_20_60_cpm
        result.expected_play_num = author.attribute_datas.expected_play_num
        result.id = data.authors[0].attribute_datas.id

        data = await getAuthorPlatformChannelInfo(result.id)
        result.wechat = data?.card_info?.wechat
        result.self_intro = data?.card_info?.self_intro

        if (!result.self_intro) {
            data = await getAuthorPlatformChannelInfoV2(result.id)
            result.self_intro = data.self_intro
        }

        let baseInfo = await getAuthorBaseInfo(result.id)
        result.tags_relation = baseInfo.tags_relation
        result.douyin_pc_link = getPcLink(baseInfo.sec_uid)
        let page = await getDouyinPage(result.douyin_pc_link)
        let douyin = getDouyinInfo(page)
        result = {...result, douyin_id: douyin.id, attribution: douyin.attribution}

        let marketingInfo = await getAuthorMarketingInfo(result.id)
        let prices = getPriceInfo(marketingInfo.price_info.filter(item => item.enable && item.is_open && item.need_price && item.task_category == 1))

        result.price120 = '无'
        result.price2160 = '无'
        for (let price of prices) {
            if (price.desc === '1-20s视频') {
                result.price120 = price.price
            } else if(price.desc === '21-60s视频') {
                result.price2160 = price.price
            }
        }

        let res = await getAuthorLinkInfo(result.id)
        result.cp_index = res.cp_index.value
        result.cooperate_index = res.cooperate_index.value

        let fans = await getAuthorDailyFans(result.id)
        result.fans_index = getFansIndex(fans)

        let spreadInfo = await getAuthorSpreadInfo(result.id)
        let spreadInfo_private = await getAuthorSpreadInfo(result.id, 1)
        result = {...result, ...{
            item_num: spreadInfo.item_num,
            share_avg: spreadInfo.share_avg,
            comment_avg: spreadInfo.comment_avg,
            like_avg: spreadInfo.like_avg,
            play_mid: spreadInfo.play_mid,
            interact_rate: getPercent(spreadInfo?.interact_rate?.value / 10000),
            play_over_rate: getPercent(spreadInfo?.play_over_rate?.value / 10000),
        }}
        result = {...result, ...{
            private_item_num: spreadInfo_private.item_num,
            private_share_avg: spreadInfo_private.share_avg,
            private_comment_avg: spreadInfo_private.comment_avg,
            private_like_avg: spreadInfo_private.like_avg,
            private_play_mid: spreadInfo_private.play_mid,
            private_interact_rate: getPercent(spreadInfo_private?.interact_rate?.value / 10000),
            private_play_over_rate: getPercent(spreadInfo_private?.play_over_rate?.value / 10000),
        }}

        let audienceDist = await getAuthorFansDistributionInfo(result.id)
        result.female = getLinkDist(...audienceDist.distributions.filter(item => item.origin_type == 0)).female
        let ages = getLinkDist(...audienceDist.distributions.filter(item => item.origin_type == 1),['18-23', '24-30', '31-40'])
        result.ages = ages.count_by
        let xians = getLinkDist(...audienceDist.distributions.filter(item => item.origin_type == 5),['一线', '二线'])
        result.xian = xians.count_by
        result.iphone = getLinkDist(...audienceDist.distributions.filter(item => item.origin_type == 3)).iPhone
    } else {
        result.status = '没有搜索到这个昵称，只有其他类似结果'
    }
    this.emit(`uuid.${meta.uuid}:InfoFetched`, {meta, data: {nickName: nick}})
    return result
}
Object.defineProperty(InfoFetch, 'name', {value: 'InfoFetch'})

export default [InfoFetch, TagFetch, AuthorInfoFetch]
