import React from "react"
import {db} from "./context"
import {cacheData, cachedData} from "../cache"
import {fetch} from "../context"
import inspectFunction from 'inspect-function'
import {Snackbar} from "@mui/material";
import {Alert} from "../components";

// public internal function
window.labSDK = {db: db, cacheData: cacheData, cachedData: cachedData, fetch: fetch}

async function loadDocSrc(url, setter) {
    let module = await import(/* webpackIgnore: true */url)
    let docs = []
    for (let name in module) {
        let doc = inspectFunction(module[name])
        delete doc.fn
        if (!doc.parameters) doc.parameters = []
        else doc.parameters = doc.parameters.map(param => {
            param.alias = param.parameter
            return param
        })
        doc.alias = doc.name
        docs.push(doc)
    }
    setter(docs)
}
export default function App() {
    let [docSrc, setDocStr] = React.useState('')
    let [docs, setDocs] = React.useState([])
    let [open, setOpen] = React.useState(false)
    let [severity, setSeverity] = React.useState('error')
    let [message, setMessage] = React.useState('message')
    function openSnackbar(severity, message) {
        setSeverity(severity)
        setMessage(message)
        setOpen(true)
    }
    return <>
        <h2>Lab</h2>
        <label htmlFor="docSrc">API爬虫脚本</label>
        <input id="docSrc" type="text" value={docSrc}
               onChange={event=>
                   setDocStr(event.target.value)}/>
        <button onClick={event =>
            loadDocSrc(docSrc, setDocs)}>加载脚本</button>
        <div className="doc_explain">
            <h3>给API的参数和结果取个名字</h3>
            <ul>{docs.map((doc,doc_idx) => <li key={doc.name}>
                <h4>API:{doc.name}</h4>
                <label htmlFor={'result_'+doc.name}>结果叫：</label>
                <input id={'result_'+doc.name} type="text" value={doc.alias}
                       onChange={event =>
                           setDocs(docs.map((target,i) => {
                               if (i===doc_idx) target.alias = event.target.value
                               return target
                           }))} />
                <h4>参数列表</h4>
                <ol>{doc.parameters.map((arg,arg_idx)=><li key={arg.parameter}>
                    <label htmlFor={'arg_'+arg.parameter}>{arg.parameter}叫：</label>
                    <input id={'arg_'+arg.parameter} type="text" value={arg.alias}
                           onChange={event =>
                               setDocs(docs.map((target,i) => {
                                   if (i===doc_idx) {
                                       target.parameters = target.parameters.map((param,ii) => {
                                           if(ii===arg_idx) param.alias = event.target.value
                                           return param
                                       })
                                   }
                                   return target
                               }))} />
                </li>)}</ol>
            </li>)}</ul>
            <button onClick={async event => {
                await cacheData(db, docSrc, 'doc_explain', docs)
                openSnackbar('success', '保存成功')
            }}>保存到数据库</button>
            <button onClick={async event => {
                let cache = await cachedData(db, docSrc, 'doc_explain')
                if (cache) {
                    setDocs(cache)
                    openSnackbar('success', '加载成功')
                } else
                    openSnackbar('warning', '数据库里没有找到')
            }}>尝试从数据库加载</button>
        </div>
        <Snackbar open={open} autoHideDuration={6000} onClose={event => setOpen(false)}>
            <Alert severity={severity} sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
    </>
}