import './App.css';
import React from 'react';

function App() {
  const [id, setId] = React.useState('')
  const [result, setResult] = React.useState('')
  return <><h1>星图数据</h1>
    <div className="basic">
      <h2>基本信息</h2>
      <input type="text" placeholder="请输入星图ID" value={id} onChange={event => setId(event.target.value)}/>
      <button onClick={async () => {
        let response = 'abc'
        setResult(response)
      }}>确定</button>
      <div className="result">
        {result}
      </div>
    </div>
  </>
}

export default App;
