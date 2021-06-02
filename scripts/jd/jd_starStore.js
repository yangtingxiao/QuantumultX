/*
京东星店长
更新时间：2021-06-02 08:53
脚本说明：星店长，和去年一样，稍微改了改，后面的账户默认助力第一个
活动进入方式：京东app搜索【星店长】
5 9 * * * https://raw.githubusercontent.com/yangtingxiao/QuantumultX/master/scripts/jd/jd_starStore.js, tag=京东星店长, img-url=https://raw.githubusercontent.com/yangtingxiao/QuantumultX/master/image/jd.png, enabled=true
*/
const $ = new Env('京东星店长');
//Node.js用户请在jdCookie.js处填写京东ck;
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '',shareCode = "";

const JD_API_HOST = `https://api.m.jd.com/client.action?functionId=`;
!(async () => {
  await requireConfig()
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {"open-url": "https://bean.m.jd.com/"});
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    cookie = cookiesArr[i];
    if (cookie) {
      console.log('**********************分割线**********************')
      initial();
      await  QueryJDUserInfo();
      if (!merge.enabled)  //cookie不可用
      {
        $.setdata('', `CookieJD${i ? i + 1 : "" }`);//cookie失效，故清空cookie。
        $.msg($.name, `【提示】京东账号${i + 1} cookie已过期！请先获取cookie\n直接使用NobyDa的京东签到获取`, 'https://bean.m.jd.com/', {"open-url": "https://bean.m.jd.com/"});
        continue;
      }
      if (Date.now() > Date.parse('2021-06-18')){
        $.msg($.Name,"","活动已结束，请删除或禁用脚本！");
        return
      }
      let shopId = 0;
      //await mcxhd_starmall_getRedPacketAward(7)
      //return

      let now = new Date();
      //await mcxhd_starmall_taskList(86); //做最后一个，看是否做完
      //if (!merge.end) {
      /*for (shopId = 8; shopId <87 ; shopId ++ ) {
        console.log('\n开始店铺：' + shopId)
        await mcxhd_starmall_taskList(shopId);
      }
      //}
      //merge.end = false;
      if (now.getDate() === 3) shopId = 2;
      if (now.getDate() === 4) shopId = 2;
      if (now.getDate() === 5) shopId = 3;
      if (now.getDate() === 6) shopId = 3;
      if (now.getDate() === 7) shopId = 4;
      if (now.getDate() === 8) shopId = 4;
      if (now.getDate() === 9) shopId = 5;
      if (now.getDate() === 10) shopId = 6;
      if (now.getDate() === 11) shopId = 7;

      await mcxhd_starmall_taskList(shopId);

      for (shopId = 7; shopId <87 ; shopId ++ ) {
        console.log('\n开始瓜分店铺：' + shopId)
        if (merge.end) break;
        await mcxhd_starmall_getRedPacketAward(shopId);
      }*/
      for (let shopId of shopIdList) {
        console.log('\n开始店铺：' + shopId)
        await mcxhd_starmall_taskList(shopId);
      }
      //break;
      await msgShow();
    }
  }
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done())


//获取昵称（直接用，勿删）
function QueryJDUserInfo(timeout = 0) {
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
        headers : {
          'Referer' : `https://wqs.jd.com/my/iserinfo.html`,
          'Cookie' : cookie
        }
      }
      $.get(url, (err, resp, data) => {
        try {
          data = JSON.parse(data);
          if (data.retcode === 13) {
            merge.enabled = false
            return
          }
          merge.nickname = data.base.nickname;
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve()
        }
      })
    },timeout)
  })
}

//查询
function mcxhd_starmall_taskList(shopId,timeout = 0){
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}mcxhd_starmall_taskList&appid=xdz&body=%7B%22shopId%22:%22${shopId}%22,%22token%22:%22jd6df03bd53f0f292f%22%7D&loginType=2`,
        headers : {
          'Origin' : `https://h5.m.jd.com`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Accept' : `application/json, text/plain, */*`,
          'Referer' : `https://h5.m.jd.com/babelDiy/Zeus/4DEZi5iUgrNLD9EWknrGZhCjNv7V/index.html`,
          'Host' : `api.m.jd.com`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        }
      }
      $.get(url, async (err, resp, data) => {
        try {
          //console.log(data)
          data = JSON.parse(data);
          if (data.retCode !== "200") {
            console.log(data.retMessage)
            return
          }
          //console.log('\n星店长:'+data.result.starName)
          for (let i in data.result.tasks) {
            if (merge.end) return ;
            //if (data.result.tasks[i].taskType !== "7"){
            // continue
            //} else {
            //  console.log(data.result.tasks[i].subItem[0].itemId)
            //  return
            //}
             console.log('\n开始做任务：' + data.result.tasks[i].taskName)
            if (data.result.tasks[i].status === 1 ) {
              for (let j in data.result.tasks[i].subItem) {
                await mcxhd_starmall_doTask(shopId,data.result.tasks[i].taskType,data.result.tasks[i].subItem[j].itemToken)
                if (data.result.tasks[i].taskType === "6" && !shareCode) shareCode = data.result.tasks[i].subItem[j].itemToken;
              }
            } else {
              //console.log(data.result.tasks[i].taskType)
              console.log('已完成')
              if (data.result.tasks[i].taskType === "1") {
                console.log('签到已完成，本店任务跳过')
                break
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve()
        }
      })
    },timeout)
  })
}

//做任务
function mcxhd_starmall_doTask(shopId,taskType,itemToken,timeout = 0){
  return new Promise((resolve) => {
    setTimeout( ()=>{
      if (taskType === "6") itemToken = shareCode||shareCodeList[starList.indexOf(shopId)];//shareCode[shopId];// '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWf8zYv7WVIxFMVj1lV2pKDjARLLbNU_JV-gpnPfE9HW-02KqFUKGtvxAhB0qpzIrZwdSu-yZTRWQMbBwd4k2XPmFHDqa';
      let url = {
        url : `${JD_API_HOST}mcxhd_starmall_doTask&appid=xdz&body=%7B%22itemToken%22:%22${itemToken}%22,%22taskType%22:%22${taskType}%22,%22shopId%22:%22${shopId}%22,%22token%22:%22jd6df03bd53f0f292f%22%7D&loginType=2`,
        headers : {
          'Origin' : `https://h5.m.jd.com`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Accept' : `*/*`,
          'Referer' : `https://h5.m.jd.com/babelDiy/Zeus/4DEZi5iUgrNLD9EWknrGZhCjNv7V/index.html?shopId=${shopId}&inviteId=${shareCode[shopId]}&babelChannel=ttt1`,
          'Host' : `api.m.jd.com`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        }
      }
      $.get(url, async (err, resp, data) => {
        try {
          //console.log(url.url)
          //console.log(data)
          data = JSON.parse(data);
          if (taskType !== "6") console.log(data.retMessage)
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve()
        }
      })
    },timeout)
  })
}

//瓜分https://api.m.jd.com/api?appid=xdz&functionId=mcxhd_starmall_getRedPacketAward&body=%7B%22shopId%22:%224%22,%22token%22:%22jd6df03bd53f0f292f%22%7D&loginType=2
function mcxhd_starmall_getRedPacketAward(shopId,timeout = 0){
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}mcxhd_starmall_getRedPacketAward&appid=xdz&body=%7B%22shopId%22:%22${shopId}%22,%22token%22:%22jd6df03bd53f0f292f%22%7D&loginType=2`,
        headers : {
          'Origin' : `https://h5.m.jd.com`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Accept' : `*/*`,
          //'Referer' : `https://h5.m.jd.com/babelDiy/Zeus/4DEZi5iUgrNLD9EWknrGZhCjNv7V/index.html?shopId=${shopId}&inviteId=${shareCode[shopId]}&babelChannel=ttt1`,
          'Host' : `api.m.jd.com`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        }
      }
      //console.log(url.url)
      $.get(url, async (err, resp, data) => {
        try {
          //console.log(data)
          data = JSON.parse(data);
          if (data.retCode !== "200") {
            console.log(data.retMessage)
            if (data.retCode === "311") {
              merge.end = true
            }
            return
          }
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve()
        }
      })
    },timeout)
  })
}

var shareCodeList = [
  '78xTb-mdO2_5fV_mOYWHhlCulDoInfIOFMCoXKe_FCtvxHdgilgt5BtvxYkO_ihAqYxqzItRfOSKkTe3QXanOJKngp6atwCeD_xgO9g',
  ''],shopIdList = [
    '637BQA',
    'XLDYRJ',
    '94FEDQ',
    'GN949D'
],
  starList = [
    'MW9U5Z'
  ]

function requireConfig() {
  return new Promise(resolve => {
    //Node.js用户请在jdCookie.js处填写京东ck;
    const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
    //IOS等用户直接用NobyDa的jd cookie
    if ($.isNode()) {
      Object.keys(jdCookieNode).forEach((item) => {
        if (jdCookieNode[item]) {
          cookiesArr.push(jdCookieNode[item])
        }
      })
    } else {
      let cookiesData = $.getdata('CookiesJD') || "[]";
      cookiesData = jsonParse(cookiesData);
      cookiesArr = cookiesData.map(item => item.cookie);
      cookiesArr.reverse();
      cookiesArr.push(...[$.getdata('CookieJD2'), $.getdata('CookieJD')]);
      cookiesArr.reverse();
      cookiesArr = cookiesArr.filter(item => item !== "" && item !== null && item !== undefined);
    }
    console.log(`共${cookiesArr.length}个京东账号\n`);
    resolve()
  })
}

function jsonParse(str) {
  if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
      return [];
    }
  }
}


//初始化
function initial() {
  merge = {
    nickname: "",
    enabled: true,
    end: false
  }
  for (let i in merge) {
    merge[i].success = 0;
    merge[i].fail = 0;
    merge[i].prizeCount = 0;
    merge[i].notify = "";
    merge[i].show = true;
  }
}
//通知
function msgShow() {
  let message = "京东账号：" +merge.nickname + "\n执行成功，请点击通知跳转APP查看！";
  let url ={ "open-url" : `openjd://virtual?params=%7B%20%22category%22:%20%22jump%22,%20%22des%22:%20%22m%22,%20%22url%22:%20%22https://h5.m.jd.com/babelDiy/Zeus/3Vuj8Uw26NEDNRjaT2uspf2pphK/index.html%22%20%7D`}
  $.msg($.name, "", message, url);
}


function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r)));let h=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];h.push(e),s&&h.push(s),i&&h.push(i),console.log(h.join("\n")),this.logs=this.logs.concat(h)}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
