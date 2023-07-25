import {db} from './context'
import {fetch} from "../context";
import {cachedData, cacheData} from '../cache';

export async function isLoginOk() {
    let response = await fetch("https://www.xingtu.cn/gw/api/demander/info", {
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    let data = await response.json()
    return data.status === 1
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
    data = await response.json()
    await cacheData(db, prefix, id, data)
    return data
}

export async function getAuthorSpreadInfo(id) {
    let prefix = 'author_spread_info'
    let data = await cachedData(db, prefix, id)

    if (data) return data

    let response = await fetch(`https://www.xingtu.cn/gw/api/data_sp/get_author_spread_info?o_author_id=${id}` +
        "&platform_source=1&platform_channel=1&range=2&type=2&only_assign=true", {
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