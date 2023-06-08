import './App.css';
import React from 'react';
import {getBasicInfo} from "./fetches";

function getPriceInfo(prices) {
  return prices.map(item => {
    return {
      desc: item.desc,
      price: item.price,
    }
  })
}

function App() {
  const [id, setId] = React.useState('')
  const [result, setResult] = React.useState({})
  return <><h1>星图数据</h1>
    <div className="basic">
      <h2>基本信息</h2>
      <input type="text" placeholder="请输入星图ID" value={id} onChange={event => setId(event.target.value)}/>
      <button onClick={async () => {
        let [baseInfo, marketingInfo, platformChannelInfo] = await getBasicInfo(id)
        setResult({
          nick_name: baseInfo.nick_name,
          tags_relation: Object.keys(baseInfo.tags_relation),
          douyin_pc_link: `https://www.douyin.com/user/${baseInfo.sec_uid}`,
          industry_tags: marketingInfo.industry_tags.map(item => item.split('-')[0]),
          price_info: getPriceInfo(marketingInfo.price_info.filter(item => item.enable && item.is_open && item.need_price && item.task_category == 1)),
          self_intro: platformChannelInfo.self_intro,
        })
      }}>确定</button>
      <div className="result">
        {JSON.stringify(result)}
      </div>
    </div>
  </>
}

export default App;
