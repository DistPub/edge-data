import { TAGS } from "./consts"

export function getPriceInfo(prices) {
    return prices.map(item => {
        return {
            desc: item.desc,
            price: item.price,
        }
    })
}

export function getPercent(number, fixed = 1) {
    if (number) {
        return `${(number * 100).toFixed(fixed)}%`
    }
    return '-%'
}

export function getLatest15Description(items) {
    let play_min = 0
    let play_max = 0
    let famous = 0
    let first = true;

    for (let item of items) {
        if (first) {
            play_min = item.play
            play_max = item.play
            first = false
        }
        if (item.play < play_min) {
            play_min = item.play
        }
        if (item.play > play_max) {
            play_max = item.play
        }
        if (item.play > 1000 * 10000) {
            famous++
        }
    }

    return [play_min, play_max, getPercent(famous / items.length)]
}

export function getLinkDist(dist, count_by=[]) {
    let total = dist.distribution_list.reduce((c, i) => c + i.distribution_value, 0)
    let result = {}
    let count = 0
    for (let item of dist.distribution_list) {
        result[item.distribution_key] = getPercent(item.distribution_value / total)

        if (count_by.length && count_by.includes(item.distribution_key)) {
            count += item.distribution_value
        }
    }
    result.count_by = getPercent(count / total)
    return result
}

export function getDouyinInfo(page) {
    let element = document.createElement('div')
    element.innerHTML = page
    let selector = '#douyin-right-container > div > div > div > div > div > p > '
    let id_data = element.querySelector(`${selector} span:nth-child(1)`)
    if (id_data)
        id_data = id_data.textContent.split('：')[1]
    else
        id_data = '未知'
    let attribution_data = element.querySelector(`${selector} span:nth-child(2)`)
    if(attribution_data)
        attribution_data = attribution_data.textContent.split('：')[1]
    else
        attribution_data = '未知'
    return {
        id: id_data,
        attribution: attribution_data
    }
}

export function getPcLink(arg) {
    return `https://www.douyin.com/user/${arg}`
}

export function getFansIndex(fans) {
    return fans.daily[fans.daily.length-1].fans_cnt / fans.daily[0].fans_cnt  - 1
}

export function isDouyinPageOk(page) {
    let container = document.createElement('div')
    container.innerHTML = page
    return container.querySelector('title').innerText !== '验证码中间页'
}

export function getTagIds(tag) {
  return tag.split(',').filter(item => item.endsWith('-全部')).map(item => {
    return TAGS[item]
  })
}

export function getTagLevelTwoIds(tag) {
  return tag.split(',').filter(item => !item.endsWith('-全部')).map(item => {
    return TAGS[item]
  })
}
