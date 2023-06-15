let fetch = window.edgeFetch;

export async function isLoginOk() {
    let response = await fetch('https://pgy.xiaohongshu.com/solar/advertiser/patterns/kol', {redirect: 'manual'})
    return response.ok
}