const fetch = window.edgeFetch

export async function getBasicInfo(id) {
    let authorBaseInfo = await fetch(`https://www.xingtu.cn/gw/api/author/get_author_base_info?o_author_id=${id}&platform_source=1&platform_channel=1&recommend=true&search_session_id=&need_sec_uid=true`, {
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    let authorMarketingInfo = await fetch(`https://www.xingtu.cn/gw/api/author/get_author_marketing_info?o_author_id=${id}&platform_source=1&platform_channel=1`, {
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    let authorPlatformChannelInfo = await fetch(`https://www.xingtu.cn/gw/api/author/get_author_platform_channel_info_v2?platform_source=1&platform_channel=1&o_author_id=${id}`, {
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    return [await authorBaseInfo.json(), await authorMarketingInfo.json(), await authorPlatformChannelInfo.json()]
}

export async function getContentInfo(id) {
    let authorSpreadInfo = await fetch(`https://www.xingtu.cn/gw/api/data_sp/get_author_spread_info?o_author_id=${id}` +
        "&platform_source=1&platform_channel=1&range=2&type=2&only_assign=true", {
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    let authorShowItems = await fetch(`https://www.xingtu.cn/gw/api/author/get_author_show_items_v2?o_author_id=${id}` +
        "&platform_source=1&platform_channel=1&limit=10&only_assign=true", {
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    return [await authorSpreadInfo.json(), await authorShowItems.json()]
}