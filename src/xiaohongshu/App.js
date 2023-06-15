import React from "react";
import {isLoginOk} from "./fetches";

export default function () {
    let [loginOk, setLoginOk] = React.useState(false)
    React.useEffect(() => {
        async function check() {
            setLoginOk(await isLoginOk())
        }
        check()
    }, [])

    let view = null
    if (loginOk) {
        view = <h2>小红书登录成功</h2>
    } else {
        view = <h2>小红书登录失败</h2>
    }
    return <><h1>小红书数据</h1>
        {view}
    </>
}