import React from "react";
import {db as dbLab} from '../lab/context'
import {db as dbXiaohongshu} from '../xiaohongshu/context'
import {db as dbXintu} from '../xingtu/context'

const dbs = [dbLab, dbXiaohongshu, dbXintu]

function App() {
    const [dbInfo, setDBInfo] = React.useState([])
    async function loadDBInfo() {
        let info = await Promise.all(dbs.map(async db => {
            let info = await db.info()
            info.db = db
            return info
        }))
        setDBInfo(info)
    }
    React.useEffect(() => {
        loadDBInfo()
    }, [])
    return <>
        <h1>设置</h1>
        <h2>缓存</h2>
        <div className={"cache"}>
            <ul>
            {dbInfo.map(db => {
                return <li key={db.db_name}>数据库名字：{db.db_name} 已缓存大小：{db.doc_count}
                    <button onClick={async () => {
                        await db.db.destroy()
                        window.location.reload()
                    }}>清除</button></li>
            })}
            </ul>
        </div>
    </>;
}

export default App;