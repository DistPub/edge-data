import React from "react";
import {getBlogger, getDataSummary, getFans, getFansSummary, getKolTag, getNotes, isLoginOk} from "./fetches";
import {PouchDBContext} from "./context";

function getAge(ages) {
    return ages.filter(
        item => ['18-24', '25-34'].includes(item.group)
    ).reduce(
        (a, b) => a + b.percent,
        0
    )
}

function getCities(cities) {
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

function getContentTags(items, from='title') {
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

function App() {
    let [loginOk, setLoginOk] = React.useState(false)
    let [pid, setPid] = React.useState("")
    let [dataSummary, setDataSummary] = React.useState({})
    let [fans, setFans] = React.useState({})
    let [fansSummary, setFansSummary] = React.useState({})
    let [kolTag, setKolTag] = React.useState({})
    let [notes, setNotes] = React.useState({})
    let [blogger, setBlogger] = React.useState({})
    const db = React.useContext(PouchDBContext);
    React.useEffect(() => {
        async function check() {
            setLoginOk(await isLoginOk())
        }
        check()
    }, [])

    let view = null
    if (loginOk) {
        view = <><h2>小红书登录成功</h2>
            <h2>data summary</h2>
            <input type="text" placeholder="请输入小红书id" value={pid} onChange={event => setPid(event.target.value)}></input>
            <button onClick={async () => {
                let info = await getDataSummary(db, pid)
                setDataSummary({
                    pictureReadCost: info.pictureReadCost,
                    videoReadCost: info.videoReadCost
                })
            }}>确定</button>
            <div className="result">
                {JSON.stringify(dataSummary)}
            </div>
            <h2>fans</h2>
            <button onClick={async () => {
                let info = await getFans(db, pid)
                setFans({
                    age: getAge(info.ages),
                    cities: getCities(info.cities),
                    female: info.gender.female
                })
            }}>确定</button>
            <div className="result">
                {JSON.stringify(fans)}
            </div>
            <h2>fans summary</h2>
            <button onClick={async () => {
                let info = await getFansSummary(db, pid)
                setFansSummary({
                    fansGrowthRate: info.fansGrowthRate
                })
            }}>确定</button>
            <div className="result">
                {JSON.stringify(fansSummary)}
            </div>
            <h2>kol tag</h2>
            <button onClick={async () => {
                let info = await getKolTag(db, pid)
                setKolTag({
                    tags: info.map(x => x.name)
                })
            }}>确定</button>
            <div className="result">
                {JSON.stringify(kolTag)}
            </div>
            <h2>notes</h2>
            <button onClick={async () => {
                let info = await getNotes(db, pid)
                setNotes({
                    tags: getContentTags(info.list)
                })
            }}>确定</button>
            <div className="result">
                {JSON.stringify(notes)}
            </div>
            <h2>blogger</h2>
            <button onClick={async () => {
                let info = await getBlogger(db, pid)
                setBlogger({
                    tags: getContentTags(info.contentTags, 'blogger'),
                    interMidNum: info.interMidNum,
                    clickMidNum: info.clickMidNum,
                    videoPrice: info.videoPrice,
                    picturePrice: info.picturePrice,
                    redId: info.redId
                })
            }}>确定</button>
            <div className="result">
                {JSON.stringify(blogger)}
            </div>
        </>
    } else {
        view = <h2>小红书登录失败</h2>
    }
    return <><h1>小红书数据</h1>
        {view}
    </>
}

export default App