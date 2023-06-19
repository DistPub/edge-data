import React from "react";
import {getBlogger, getDataSummary, getFans, getFansSummary, getKolTag, getNotes, isLoginOk} from "./fetches";
import {useLocation} from "react-router-dom";
import {CircularProgressWithLabel} from "../components";
import {shell} from './context'
import {getAge, getCities, getContentTags} from './utils'
import actions from './actions'

function makeFlow(ids) {
    let action = shell.Action
        .updateProgress([ids]) // => [id, id, ...]
        .InfoFetch.PCollect // => [info, info, ...]
        .buildExcel(['data', [
            'pid', 'pictureReadCost', 'videoReadCost',
            'age', 'sh', 'bj', 'gz', 'sz1', 'hz', 'cd',
            'nj', 'tj', 'cq', 'wh', 'sz2', 'female',
            'firstCity', 'fansGrowthRate',
            'kolTags', 'tags', 'interMidNum', 'clickMidNum',
            'videoPrice', 'picturePrice', 'redId']])
        .download(['vendor.xlsx'])
    return action
}

function App() {
    let search = new URLSearchParams(useLocation().search)
    let [loginOk, setLoginOk] = React.useState(false)
    let [pid, setPid] = React.useState("")
    let [dataSummary, setDataSummary] = React.useState({})
    let [fans, setFans] = React.useState({})
    let [fansSummary, setFansSummary] = React.useState({})
    let [kolTag, setKolTag] = React.useState({})
    let [notes, setNotes] = React.useState({})
    let [blogger, setBlogger] = React.useState({})
    let [pids, setPids] = React.useState('5e37051b000000000100ba28')
    let [fetched, setFetched] = React.useState(0)
    let [total, setTotal] = React.useState(0)
    let [percent, setPercent] = React.useState(0)

    function UpdateProgress({meta}, ids) {
        this.on(`uuid:${meta.downstream.uuid}:InfoFetched`, ({data, direction}) => {
            if (direction !== 'upstream') return
            setFetched(old => old + 1)
            console.log(`fetched ${data.pid}`)
        })
        return ids
    }
    React.useEffect(() => {
        async function check() {
            setLoginOk(await isLoginOk())
        }
        check()
        shell.installExternalAction(UpdateProgress)
        shell.installModule(actions)
    }, [])
    React.useEffect(() => {
        let data = (fetched/total*100).toFixed(1)
        if (isNaN(data)) return
        setPercent(parseFloat(data))
    }, [fetched, total])

    let debug = <>
        <h2>data summary</h2>
            <input type="text" placeholder="请输入小红书id" value={pid} onChange={event => setPid(event.target.value)}></input>
            <button onClick={async () => {
                let info = await getDataSummary(pid)
                setDataSummary({
                    pictureReadCost: info.pictureReadCost,
                    videoReadCost: info.videoReadCost
                })
            }}>获取</button>
            <div className="result">
                {JSON.stringify(dataSummary)}
            </div>
            <h2>fans</h2>
            <button onClick={async () => {
                let info = await getFans(pid)
                setFans({
                    age: getAge(info.ages),
                    cities: getCities(info.cities),
                    female: info.gender.female
                })
            }}>获取</button>
            <div className="result">
                {JSON.stringify(fans)}
            </div>
            <h2>fans summary</h2>
            <button onClick={async () => {
                let info = await getFansSummary(pid)
                setFansSummary({
                    fansGrowthRate: info.fansGrowthRate
                })
            }}>获取</button>
            <div className="result">
                {JSON.stringify(fansSummary)}
            </div>
            <h2>kol tag</h2>
            <button onClick={async () => {
                let info = await getKolTag(pid)
                setKolTag({
                    kolTags: info.map(x => x.name)
                })
            }}>获取</button>
            <div className="result">
                {JSON.stringify(kolTag)}
            </div>
            <h2>notes</h2>
            <button onClick={async () => {
                let info = await getNotes(pid)
                setNotes({
                    notes: getContentTags(info.list)
                })
            }}>获取</button>
            <div className="result">
                {JSON.stringify(notes)}
            </div>
            <h2>blogger</h2>
            <button onClick={async () => {
                let info = await getBlogger(pid)
                setBlogger({
                    tags: getContentTags(info.contentTags, 'blogger'),
                    interMidNum: info.interMidNum,
                    clickMidNum: info.clickMidNum,
                    videoPrice: info.videoPrice,
                    picturePrice: info.picturePrice,
                    redId: info.redId
                })
            }}>获取</button>
            <div className="result">
                {JSON.stringify(blogger)}
            </div>
        </>

    let view = null
    if (loginOk) {
        view = <><h2>小红书登录成功</h2>
            {search.get('debug') && debug}
            <h2>批量导出数据</h2>
            <div><textarea placeholder='请输入pid，一行一个' value={pids} onChange={
                event => setPids(event.target.value)
            }></textarea></div>
            <button onClick={async ()=> {
                const ids = pids.split('\n').filter(item => item.length > 0)
                setTotal(ids.length)
                setFetched(0)
                if (ids.length === 0)
                    return alert('请输入至少一个pid')
                let response = await shell.exec(makeFlow(ids))
                console.log(response.json())
            }}>导出</button>
            <CircularProgressWithLabel value={percent} />
        </>
    } else {
        view = <h2>小红书登录失败</h2>
    }
    return <><h1>小红书数据</h1>
        {view}
    </>
}

export default App