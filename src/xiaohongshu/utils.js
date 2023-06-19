export function getAge(ages) {
    return ages.filter(
        item => ['18-24', '25-34'].includes(item.group)
    ).reduce(
        (a, b) => a + b.percent,
        0
    )
}

export function getCities(cities) {
    let sh = '未知';let bj = '未知';let gz = '未知';let sz1 = '未知';let hz = '未知';let cd = '未知';let nj = '未知';let tj = '未知';let cq = '未知';let wh = '未知';let sz2 = '未知'
    cities.forEach(province => {
        if (province['name'] == '上海')
            sh = province['percent']
        else if (province['name'] == '北京')
            bj = province['percent']
        else if (province['name'] == '广州')
            gz = province['percent']
        else if (province['name'] == '深圳')
            sz1 = province['percent']
        else if (province['name'] == '杭州')
            hz = province['percent']
        else if (province['name'] == '成都')
            cd = province['percent']
        else if (province['name'] == '南京')
            nj = province['percent']
        else if (province['name'] == '天津')
            tj = province['percent']
        else if (province['name'] == '重庆')
            cq = province['percent']
        else if (province['name'] == '武汉')
            wh = province['percent']
        else if (province['name'] == '苏州')
            sz2 = province['percent']
    })
    return [sh, bj, gz, sz1, hz, cd, nj, tj, cq, wh, sz2]
}

export function getContentTags(items, from='title') {
    let results = new Set()
    items.forEach(item => {
        if (from==='title') {
            if (!item.title) return
            if (item.title.includes('猫')) results.add('猫')
            if (item.title.includes('狗')) results.add('狗')
            if (item.title.includes('犬')) results.add('狗')
        } else {
            if (item.taxonomy1Tag!== '宠物') return
            if (item.taxonomy2Tags.includes('猫')) results.add('猫')
            if (item.taxonomy2Tags.includes('狗')) results.add('狗')
        }
    })
    return [...results]
}

export function halfUp(data, fixed=2) {
    return parseFloat(data).toFixed(fixed)
}
