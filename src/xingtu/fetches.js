import {db} from './context'
import {fetch} from "../context";
import {cachedData, cacheData} from '../cache';
import {isDouyinPageOk, getTagIds, getTagLevelTwoIds} from "./utils";
import { TAGS } from './consts';

export async function isDouyinVerifyOk() {
    let response = await fetch("https://www.douyin.com/user/MS4wLjABAAAAKEwyE73s1rSCzBML8w2B3l_qpr0m9EzgBOZCRgBYpmQ", {
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    })
    let data = await response.text()
    return isDouyinPageOk(data)
}

export async function isLoginOk() {
    let response = await fetch("https://www.xingtu.cn/gw/api/demander/info", {
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    let data = await response.json()
    return data.status === 1
}

export async function getAuthorDailyFans(id) {
    let today = new Date()
    let yesterday = new Date(today.getTime())
    yesterday.setDate(today.getDate() - 1)
    let month_ago = new Date(yesterday.getTime())
    month_ago.setMonth(yesterday.getMonth() - 1)
    let start = month_ago.toISOString().split('T')[0]
    let end = yesterday.toISOString().split('T')[0]

    let prefix = `get_author_daily_fans_${end}`
    let data = await cachedData(db, prefix, id)
    if(data) return data


    let response = await fetch(`https://www.xingtu.cn/gw/api/data_sp/get_author_daily_fans?author_id=${id}&platform_source=1&start_date=${start}&end_date=${end}&author_type=1`, {
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    data = await response.json()
    await cacheData(db, prefix, id, data)
    return data
}

export async function getDouyinPage(pc_link) {
    let prefix = 'douyin_info'
    let data = await cachedData(db, prefix, pc_link)

    if (data) return data
    let response = await fetch(pc_link, {
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    })
    data = await response.text()
    if (!isDouyinPageOk(data)) throw new Error('抖音验证未通过')
    await cacheData(db, prefix, pc_link, data)
    return data
}

export async function getAuthorBaseInfo(id) {
    let prefix = 'author_base_info'
    let data = await cachedData(db, prefix, id)

    if (data) return data

    let response = await fetch(`https://www.xingtu.cn/gw/api/author/get_author_base_info?o_author_id=${id}&platform_source=1&platform_channel=1&recommend=true&search_session_id=&need_sec_uid=true`, {
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    data = await response.json()
    await cacheData(db, prefix, id, data)
    return data
}


export async function getAuthorMarketingInfo(id) {
    let prefix = 'author_marketing_info'
    let data = await cachedData(db, prefix, id)

    if (data) return data

    let response = await fetch(`https://www.xingtu.cn/gw/api/author/get_author_marketing_info?o_author_id=${id}&platform_source=1&platform_channel=1`, {
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    data = await response.json()
    await cacheData(db, prefix, id, data)
    return data
}


export async function getAuthorPlatformChannelInfo(id) {
    let prefix = 'author_platform_channel_info'
    let data = await cachedData(db, prefix, id)

    if (data) return data

    let response = await fetch(`https://www.xingtu.cn/gw/api/gauthor/author_get_business_card_info?o_author_id=${id}`, {
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    try {
      data = await response.json()
    } catch (e) {
      console.error(`获取作者${id}的名片信息失败`, e)
      return {}
    }
    await cacheData(db, prefix, id, data)
    return data
}


export async function getAuthorPlatformChannelInfoV2(id) {
    let prefix = 'author_platform_channel_infov2'
    let data = await cachedData(db, prefix, id)

    if (data) return data

    let response = await fetch(`https://www.xingtu.cn/gw/api/author/get_author_platform_channel_info_v2?platform_source=1&platform_channel=1&o_author_id=${id}`, {
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    data = await response.json()
    await cacheData(db, prefix, id, data)
    return data
}

export async function getAuthorSpreadInfo(id, type=2) {
    let prefix = `author_spread_info_${type}`
    let data = await cachedData(db, prefix, id)

    if (data) return data

    let response = await fetch(`https://www.xingtu.cn/gw/api/data_sp/get_author_spread_info?o_author_id=${id}` +
        `&platform_source=1&platform_channel=1&range=2&type=${type}&only_assign=true`, {
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    data = await response.json()
    await cacheData(db, prefix, id, data)
    return data
}

export async function getAuthorShowItems(id) {
    let prefix = 'author_show_items'
    let data = await cachedData(db, prefix, id)

    if (data) return data

    let response = await fetch(`https://www.xingtu.cn/gw/api/author/get_author_show_items_v2?o_author_id=${id}` +
        "&platform_source=1&platform_channel=1&limit=10&only_assign=true", {
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    data = await response.json()
    await cacheData(db, prefix, id, data)
    return data
}

export async function getAuthorFansDistributionInfo(id) {
    let prefix = 'author_fans_distribution'
    let data = await cachedData(db, prefix, id)

    if (data) return data

    let response = await fetch(`https://www.xingtu.cn/gw/api/data_sp/get_author_fans_distribution?o_author_id=${id}&platform_source=1&author_type=1`, {
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    data = await response.json()
    await cacheData(db, prefix, id, data)
    return data
}

export async function getAuthorLinkInfo(id) {
    let prefix = 'author_link_info'
    let data = await cachedData(db, prefix, id)

    if (data) return data

    let response = await fetch(`https://www.xingtu.cn/gw/api/data_sp/get_author_link_info?o_author_id=${id}&platform_source=1&platform_channel=1&industy_tag=0`, {
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    data = await response.json()
    await cacheData(db, prefix, id, data)
    return data
}

export async function searchNickName(nick) {
    let prefix = 'search_nickname'
    let data = await cachedData(db, prefix, nick)

    if (data) return data

    let payload = {
        "scene_param": {
            "platform_source": 1,
            "search_scene": 1,
            "display_scene": 1,
            "marketing_target": 1,
            "task_category": 1
        },
        "page_param": {"page": 1, "limit": 20},
        "sort_param": {"sort_type": 2, "sort_field": {"field_name": "score"}},
        "search_param": {"keyword": nick, "seach_type": 2}
    }
    let response = await fetch("https://www.xingtu.cn/gw/api/gsearch/search_for_author_square", {
        "body": JSON.stringify(payload),
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    });
    data = await response.json()
    await cacheData(db, prefix, nick, data)
    return data
}

export async function searchTagName(tag, page=1) {
    let prefix = 'search_tag'
    let data = await cachedData(db, prefix, `${tag}-${page}`)

    if (data) return [data, data.pagination.has_more]
    await getSearchOptions()
    let payload = {
        "scene_param": {
            "platform_source": 1,
            "search_scene": 1,
            "display_scene": 1,
            "task_category": 1,
            "marketing_target": 1,
            "first_industry_id": 0
        },
        "page_param": {
            "page": `${page}`,
            "limit": "30"
        },
        "sort_param": {
            "sort_field": {
                "field_name": "score"
            },
            "sort_type": 2
        },
        "attribute_filter": [
            {
                "field": {
                    "field_name": "price_by_video_type__ge",
                    "rel_id": "2"
                },
                "field_value": "0"
            }
        ],
        "search_param": {
            "seach_type": 3,
            "time_range_days": 180,
            "is_new_content_query": true
        }
    }
    const tagIds = getTagIds(tag)
    const tagLevelTwoIds = getTagLevelTwoIds(tag)
    if (tagIds) {
        payload.attribute_filter.push({
            "field": {
                "field_name": "tag"
            },
            "field_value": JSON.stringify(tagIds)
        })
    }
    if (tagLevelTwoIds) {
        payload.attribute_filter.push({
            "field": {
                "field_name": "tag_level_two"
            },
            "field_value": JSON.stringify(tagLevelTwoIds)
        })
    }
    let response = await fetch("https://www.xingtu.cn/gw/api/gsearch/search_for_author_square", {
        "body": JSON.stringify(payload),
        "method": "POST",
        "mode": "cors",
        "credentials": "include",
        "headers": {
          "agw-js-conv": "str"
        }
    });
    data = await response.json()
    await cacheData(db, prefix, `${tag}-${page}`, data)
    return [data, data.pagination.has_more]
}

export async function getSearchOptions() {
  let prefix = 'search_options'
  let data = await cachedData(db, prefix, '')

  if (data) return data

  let response = await fetch("https://www.xingtu.cn/gw/api/fe_common_service/author_options/market_fields?market_scene=1", {
      "method": "GET",
      "mode": "cors",
      "credentials": "include",
      "headers": {
        "agw-js-conv": "str"
      }
  });
  data = await response.json()
  const options = data
  for (const key in options.data) {
    if (key == 'content_tag_v2') {
      const twoLevelOptions = JSON.parse(options['data'][key])
      for (const option of twoLevelOptions) {
        // first
        const firstValue = parseInt(Object.keys(option.first).pop())
        const firstName = Object.values(option.first).pop()
        TAGS[`${firstName}-全部`] = firstValue
        // second
        for (const secondOption of option.second) {
          const secondValue = parseInt(Object.keys(secondOption).pop())
          const secondName = Object.values(secondOption).pop()
          TAGS[`${firstName}-${secondName}`] = secondValue
        }
      }
    }
  }
  await cacheData(db, prefix, '', data)
  return data
}
