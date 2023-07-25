import './App.css';
import React from 'react';
import {
  getAuthorBaseInfo, getAuthorFansDistributionInfo, getAuthorLinkInfo,
  getAuthorMarketingInfo, getAuthorPlatformChannelInfo, getAuthorShowItems, getAuthorSpreadInfo,
  searchNickName
} from "./fetches";
import {useLocation} from "react-router-dom";
import {isLoginOk} from "./fetches";
import {shell} from "../context";

function getPriceInfo(prices) {
  return prices.map(item => {
    return {
      desc: item.desc,
      price: item.price,
    }
  })
}

function getPercent(number, fixed=1) {
  if (number) {
    return `${(number*100).toFixed(fixed)}%`
  }
  return '-%'
}

function getLatest15Description(items) {
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
    if (item.play > 1000*10000) {
      famous ++
    }
  }

  return [play_min, play_max, getPercent(famous/items.length)]
}

function getLinkDist(dist) {
  let total = dist.distribution_list.reduce((c, i) => c + i.distribution_value, 0)
  let result = {}
  for (let item of dist.distribution_list) {
    result[item.distribution_key] = getPercent(item.distribution_value/total)
  }
  return result
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

  React.useEffect(() => {
    async function check() {
      setLoginOk(await isLoginOk())
    }
    check()
    //shell.installExternalAction(UpdateProgress)
    //shell.installModule(actions)
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
        setBasicInfo({
          nick_name: baseInfo.nick_name,
          tags_relation: Object.keys(baseInfo.tags_relation),
          douyin_pc_link: `https://www.douyin.com/user/${baseInfo.sec_uid}`,
          industry_tags: marketingInfo.industry_tags.map(item => item.split('-')[0]),
          price_info: getPriceInfo(marketingInfo.price_info.filter(item => item.enable && item.is_open && item.need_price && item.task_category == 1)),
          self_intro: platformChannelInfo.card_info.self_intro,
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
    view = <></>
  } else {
    view = <h2>星图登录失败</h2>
  }
  return <><h1>星图数据</h1> {view} </>
}

export default App;
