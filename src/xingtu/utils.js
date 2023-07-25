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

export function getLinkDist(dist) {
    let total = dist.distribution_list.reduce((c, i) => c + i.distribution_value, 0)
    let result = {}
    for (let item of dist.distribution_list) {
        result[item.distribution_key] = getPercent(item.distribution_value / total)
    }
    return result
}