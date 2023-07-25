import './App.css';
import React from 'react';
import {
  getAuthorBaseInfo,
  getAuthorFansDistributionInfo,
  getAuthorLinkInfo,
  getAuthorMarketingInfo,
  getAuthorPlatformChannelInfo, getAuthorPlatformChannelInfoV2,
  getAuthorShowItems,
  getAuthorSpreadInfo,
  isLoginOk,
  searchNickName
} from "./fetches";
import {useLocation} from "react-router-dom";
import {getLatest15Description, getLinkDist, getPercent, getPriceInfo} from "./utils";
import {shell} from "../context";
import {CircularProgressWithLabel} from "../components";
import actions from "./actions";

function makeFlow(nicks) {
  let action = shell.Action
      .updateProgress([nicks]) // => [nick, nick, ...]
      .InfoFetch.PCollect // => [info, info, ...]
      .buildExcel(['data', [
        'nickName', 'id', 'status',
        'wechat', 'self_intro']])
      .download(['vendor.xlsx'])
  return action
}

function App() {
  let search = new URLSearchParams(useLocation().search)
  let [loginOk, setLoginOk] = React.useState(false)
  const [id, setId] = React.useState('')
  const [basicInfo, setBasicInfo] = React.useState({})
  const [contentInfo, setContentInfo] = React.useState({})
  const [linkInfo, setLinkInfo] = React.useState({})
  const [businessInfo, setBusinessInfo] = React.useState({})
  const [searchNick, setSearchNick] = React.useState("")
  const [searchResults, setSearchResults] = React.useState({})
  let [nicks, setNicks] = React.useState('妈耶是只猫')
  let [fetched, setFetched] = React.useState(0)
  let [total, setTotal] = React.useState(0)
  let [percent, setPercent] = React.useState(0)

  React.useEffect(() => {
    let data = (fetched/total*100).toFixed(1)
    if (isNaN(data)) return
    setPercent(parseFloat(data))
  }, [fetched, total])

  function UpdateProgress({meta}, nicks) {
    this.on(`uuid:${meta.downstream.uuid}:InfoFetched`, ({data, direction}) => {
      if (direction !== 'upstream') return
      setFetched(old => old + 1)
      console.log(`fetched ${data.nickName}`)
    })
    return nicks
  }
  Object.defineProperty(UpdateProgress, 'name', {value: 'UpdateProgress'})

  React.useEffect(() => {
    async function check() {
      setLoginOk(await isLoginOk())
    }
    check()
    shell.installExternalAction(UpdateProgress)
    shell.installModule(actions)
  }, [])

  let debug = <>
    <div className="search">
      <h2>搜索昵称</h2>
      <input type="text" placeholder="请输入昵称" value={searchNick} onChange={event => setSearchNick(event.target.value)} />
      <button onClick={async () => {
        let data = await searchNickName(searchNick)

        if (data.authors.length === 0) {
          alert('没有搜索到任何结果')
        } else if (data.authors[0].attribute_datas['nick_name'] === searchNick) {
          setId(data.authors[0].attribute_datas.id)
          setSearchResults(data.authors[0])
        } else {
          alert('没有搜索到这个昵称，只有其他类似结果')
        }
      }}>获取</button>
      <div className="result">
        {JSON.stringify(searchResults)}
      </div>
    </div>
    <div className="basic">
      <h2>基本信息</h2>
      <input type="text" placeholder="请输入星图ID" value={id} onChange={event => setId(event.target.value)}/>
      <button onClick={async () => {
        let baseInfo = await getAuthorBaseInfo(id)
        let marketingInfo = await getAuthorMarketingInfo(id)
        let platformChannelInfo = await getAuthorPlatformChannelInfo(id)
        let platformChannelInfoV2 = await getAuthorPlatformChannelInfoV2(id)
        setBasicInfo({
          nick_name: baseInfo.nick_name,
          tags_relation: Object.keys(baseInfo.tags_relation),
          douyin_pc_link: `https://www.douyin.com/user/${baseInfo.sec_uid}`,
          industry_tags: marketingInfo.industry_tags.map(item => item.split('-')[0]),
          price_info: getPriceInfo(marketingInfo.price_info.filter(item => item.enable && item.is_open && item.need_price && item.task_category == 1)),
          self_intro: platformChannelInfo.card_info.self_intro || platformChannelInfoV2.self_intro,
          email: platformChannelInfo.card_info.email,
          phone: platformChannelInfo.card_info.phone,
          wechat: platformChannelInfo.card_info.wechat,
        })
      }}>获取</button>
      <div className="result">
        {JSON.stringify(basicInfo)}
      </div>
    </div>
    <div className="content">
      <h2>内容表现</h2>
      <button onClick={async () => {
        let spreadInfo = await getAuthorSpreadInfo(id)
        let showItems = await getAuthorShowItems(id)
        setContentInfo({
          share_avg: spreadInfo.share_avg,
          comment_avg: spreadInfo.comment_avg,
          like_avg: spreadInfo.like_avg,
          play_mid: spreadInfo.play_mid,
          interact_rate: getPercent(spreadInfo?.interact_rate?.value/10000),
          play_over_rate: getPercent(spreadInfo?.play_over_rate?.value/10000),
          latest_star_item_info: getLatest15Description(showItems.latest_star_item_info),
        })
      }}>获取</button>
      <div className="result">
        {JSON.stringify(contentInfo)}
      </div>
    </div>
    <div className="link">
      <h2>连接用户</h2>
      <button onClick={async () => {
        let audienceDist = await getAuthorFansDistributionInfo(id)
        setLinkInfo({
          city: getLinkDist(...audienceDist.distributions.filter(item => item.origin_type == 8)),
          gender: getLinkDist(...audienceDist.distributions.filter(item => item.origin_type == 0)),
          group: getLinkDist(...audienceDist.distributions.filter(item => item.origin_type == 10)),
          device: getLinkDist(...audienceDist.distributions.filter(item => item.origin_type == 3)),
        })
      }}>获取</button>
      <div className="result">
        {JSON.stringify(linkInfo)}
      </div>
    </div>
    <div className="link">
      <h2>商业能力</h2>
      <button onClick={async () => {
        let res = await getAuthorLinkInfo(id)
        setBusinessInfo({
          link_star_index: Math.trunc(res.link_star_index.value),
          link_spread_index: Math.trunc(res.link_spread_index.value),
          link_shopping_index: Math.trunc(res.link_shopping_index.value),
          link_convert_index: Math.trunc(res.link_convert_index.value),
          cp_index: Math.trunc(res.cp_index.value),
          cooperate_index: Math.trunc(res.cooperate_index.value),
        })
      }}>获取</button>
      <div className="result">
        {JSON.stringify(businessInfo)}
      </div>
    </div>
  </>
  let view = null
  if (loginOk) {
    view = <><h2>星图登录成功</h2>
      {search.get('debug') && debug}
      <h2>批量导出数据</h2>
      <div><textarea placeholder='请输入昵称，一行一个' value={nicks} onChange={
        event => setNicks(event.target.value)
      }></textarea></div>
      <button onClick={async ()=> {
        const nickNames = nicks.split('\n').filter(item => item.length > 0)
        setTotal(nickNames.length)
        setFetched(0)
        if (nickNames.length === 0)
          return alert('请输入至少一个昵称')
        let response = await shell.exec(makeFlow(nickNames))
        console.log(response.json())
      }}>导出</button>
      <CircularProgressWithLabel value={percent} /></>
  } else {
    view = <h2>星图登录失败</h2>
  }
  return <><h1>星图数据</h1> {view} </>
}

export default App;
