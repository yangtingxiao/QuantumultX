/*
东东小窝
更新时间：2020-12-06 06:07
脚本说明：加购任务不需要请去BoxJs中关闭！
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
// quantumultx
[task_local]
#东东小窝
11 0 * * * https://raw.githubusercontent.com/yangtingxiao/QuantumultX/master/scripts/jd/jd_woHome.js, tag=东东小窝, img-url=https://raw.githubusercontent.com/yangtingxiao/QuantumultX/master/image/woHome.png, enabled=true
// Loon
[Script]
cron "11 0 * * *" script-path=https://raw.githubusercontent.com/yangtingxiao/QuantumultX/master/scripts/jd/jd_woHome.js,tag=东东小窝
// Surge
东东小窝 = type=cron,cronexp=11 0 * * *,wake-system=1,timeout=20,script-path=https://raw.githubusercontent.com/yangtingxiao/QuantumultX/master/scripts/jd/jd_woHome.js
 */
const $ = new Env('东东小窝');
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const printDetail = $.getdata("CFG_WOHOME_LOG") ? $.getdata("CFG_WOHOME_LOG") === "true" : false//是否显示出参详情
const doAddChatTask = $.getdata("CFG_WOHOME_ADDCARTTASK") ? $.getdata("CFG_WOHOME_ADDCARTTASK") === "true" : true   //加购任务
const doPaidDraw = $.getdata("CFG_WOHOME_PAIDDRAW") ? $.getdata("CFG_WOHOME_PAIDDRAW") === "true" : false   //窝币抽奖
const funArr = ['','createAssistUser','clock','game','followShops','browseShops','followChannel','browseChannels','','purchaseCommodities','browseCommodities','browseMeetings']
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '';
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
} else {
  cookiesArr.push($.getdata('CookieJD'));
  cookiesArr.push($.getdata('CookieJD2'));
}

const JD_API_HOST = `https://lkyl.dianpusoft.cn/api/`;
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {"open-url": "https://bean.m.jd.com/"});
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    cookie = cookiesArr[i];
    if (cookie) {
      if (i) console.log(`\n***************开始京东账号${i + 1}***************`)
      initial();
      await  QueryJDUserInfo();
      if (!merge.enabled)  //cookie不可用
      {
        $.setdata('', `CookieJD${i ? i + 1 : "" }`);//cookie失效，故清空cookie。
        $.msg($.name, `【提示】京东账号${i + 1} cookie已过期！请先获取cookie\n直接使用NobyDa的京东签到获取`, 'https://bean.m.jd.com/', {"open-url": "https://bean.m.jd.com/"});
        continue;
      }
      await encrypt();
      await msgShow();
    }
  }
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done())


//获取昵称
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
          //if (printDetail) console.log(data)
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
//登录
function login(timeout = 0){
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}user-info/login`,
        headers : {
          'Origin' : `https://lkyl.dianpusoft.cn`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Content-Type' : `application/json`,
          'Referer' : `https://lkyl.dianpusoft.cn/client/?lkEPin=`,
          'Host' : `lkyl.dianpusoft.cn`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        },
        body : `{"body": {"client": 2,"userName": "${userName}"}}`
      }
      $.post(url, async (err, resp, data) => {
        try {
          if (printDetail) console.log(data)
          data = JSON.parse(data);
          if (data.head.code === 200) {
            token = data.head.token
            await queryByUserId()
            if (merge.newUser) return;
            await queryDraw()
            await queryAllTaskInfo()
            await queryByUserId()
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


function queryByUserId(timeout = 0){
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}ssjj-wo-home-info/queryByUserId/2?body=%7B%7D`,
        headers : {
          'Origin' : `https://lkyl.dianpusoft.cn`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Content-Type' : `application/json`,
          'Referer' : `https://lkyl.dianpusoft.cn/client/?lkEPin=`,
          'Host' : `lkyl.dianpusoft.cn`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`,
          'token' : token
        }
      }
      $.get(url, async (err, resp, data) => {
        try {
          if (printDetail) console.log(data)
          data = JSON.parse(data);
          if (!data.body.id) {
            merge.newUser = true;
          }
          if (typeof (merge.start) === "undefined") {
            merge.start = data.body.woB
          } else {
            merge.end = data.body.woB
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

function queryAllTaskInfo(type = "",timeout = 0){
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}ssjj-task-info/queryAllTaskInfo/2?body=%7B%7D`,
        headers : {
          'Origin' : `https://lkyl.dianpusoft.cn`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Content-Type' : `application/json`,
          'Referer' : `https://lkyl.dianpusoft.cn/client/?lkEPin=`,
          'Host' : `lkyl.dianpusoft.cn`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`,
          'token' : token
        }
      }
      $.get(url, async (err, resp, data) => {
        try {
          if (printDetail) console.log(data)
          data = JSON.parse(data);
          if (data.head.code === 200) {
            for (let i in data.body) {
              if (type !== "" && data.body[i].ssjjTaskInfo.type !== type) continue;
              console.log(`${data.body[i].ssjjTaskInfo.type}-${data.body[i].ssjjTaskInfo.name}`)
              if (data.body[i].doneNum < (data.body[i].ssjjTaskInfo.awardOfDayNum||1)){
                if (data.body[i].browseId) {
                  await task_record(funArr[data.body[i].ssjjTaskInfo.type],`${data.body[i].ssjjTaskInfo.id}/${data.body[i].browseId}`)
                  await queryAllTaskInfo(data.body[i].ssjjTaskInfo.type);
                  continue
                }
                if ([2,4,9].includes(data.body[i].ssjjTaskInfo.type)) {
                  if (!doAddChatTask && data.body[i].ssjjTaskInfo.type === 9) {
                    console.log("您选择了不做加购任务，跳过")
                    continue;  //不做加购任务则跳过
                  }
                  await task_record(funArr[data.body[i].ssjjTaskInfo.type],data.body[i].ssjjTaskInfo.id)
                  continue
                }
                if (data.body[i].ssjjTaskInfo.type === 3) {
                  for (let j = data.body[i].doneNum; j < (data.body[i].ssjjTaskInfo.awardOfDayNum||1);j++) {
                    await task_record(funArr[data.body[i].ssjjTaskInfo.type],`${j+1}/${data.body[i].ssjjTaskInfo.id}`)
                  }
                  continue
                }
                if (data.body[i].ssjjTaskInfo.type === 1) {
                  await $.getScript("https://raw.githubusercontent.com/yangtingxiao/QuantumultX/master/memo/jd_woHomeShareCode.txt").then((text) => (shareCode = text.replace('\n','')))
                  await task_record(funArr[data.body[i].ssjjTaskInfo.type],`${shareCode}/${data.body[i].ssjjTaskInfo.id}`)
                  continue
                }
                await queryDoneTaskRecord(data.body[i].ssjjTaskInfo.type,data.body[i].ssjjTaskInfo.id)
              } else {
                console.log('已完成')
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


function queryDoneTaskRecord(type,id,timeout = 0){
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}ssjj-task-record/queryDoneTaskRecord/${type}/${id}?body=%7B%7D`,
        headers : {
          'Origin' : `https://lkyl.dianpusoft.cn`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Content-Type' : `application/json`,
          'Referer' : `https://lkyl.dianpusoft.cn/client/?lkEPin=`,
          'Host' : `lkyl.dianpusoft.cn`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`,
          'token' : token
        }
      }
      $.get(url, async (err, resp, data) => {
        try {
          if (printDetail) console.log(data)
          data = JSON.parse(data);
          if (type === 9) {
            //await queryCommoditiesListByTaskId(id,data.body||[],type)
          }
          await queryChannelsList(id,data.body||[],type)
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve()
        }
      })
    },timeout)
  })
}


function queryChannelsList(id,list,type,timeout = 0){
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}ssjj-task-channels/queryChannelsList/${id}?body=%7B%7D`,
        headers : {
          'Origin' : `https://lkyl.dianpusoft.cn`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Content-Type' : `application/json`,
          'Referer' : `https://lkyl.dianpusoft.cn/client/?lkEPin=`,
          'Host' : `lkyl.dianpusoft.cn`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`,
          'token' : token
        }
      }
      $.get(url, async (err, resp, data) => {
        try {
          if (printDetail) console.log(data)
          data = JSON.parse(data);
          //console.log(data.head.msg)
          for (let i in data.body) {
            if (list.includes(data.body[i].id)) continue;
            if (type === 6) await task_record(funArr[type],`${data.body[i].id}/${id}`)
            if (type === 7) await task_record(funArr[type],`${id}/${data.body[i].id}`)
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
function task_record(functionid,id,timeout = 0){
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}ssjj-task-record/${functionid}/${id}/?body=%7B%7D`,
        headers : {
          'Origin' : `https://lkyl.dianpusoft.cn`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Content-Type' : `application/json`,
          'Referer' : `https://lkyl.dianpusoft.cn/client/?lkEPin=`,
          'Host' : `lkyl.dianpusoft.cn`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`,
          'token' : token
        }
      }
      //console.log(url.url)
      $.get(url, async (err, resp, data) => {
        try {
          if (printDetail) console.log(data)
          data = JSON.parse(data);
          console.log(data.head.msg)
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve()
        }
      })
    },timeout)
  })
}

//查询抽奖
function queryDraw(timeout = 0){
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}ssjj-draw-center/queryDraw?body=%7B%7D`,
        headers : {
          'Origin' : `https://lkyl.dianpusoft.cn`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Content-Type' : `application/json`,
          'Referer' : `https://lkyl.dianpusoft.cn/client/?lkEPin=`,
          'Host' : `lkyl.dianpusoft.cn`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`,
          'token' : token
        }
      }
      $.get(url, async (err, resp, data) => {
        try {
          if (printDetail) console.log(data)
          data = JSON.parse(data);
          if (data.head.code !== 200) {
            console.log(typeof data.body !== 'undefined' ? data.body.name : data.head.msg)
            merge.draw.notify += (typeof data.body !== 'undefined' ? data.body.name : data.head.msg) + ";";
            return
          }
          if (data.body.freeDrawCount > 0) {
            console.log('开始免费抽奖')
            await draw(data.body.center.id)
          } else {
            merge.draw.notify = '免费次数已用完;';
            console.log('免费次数已用完')
          }
          if (doPaidDraw) {
            console.log('您选择了窝币抽奖')
            while (!merge.stopDraw) {
              await draw(data.body.center.id)
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
//抽奖
function draw(id,timeout = 0){
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}ssjj-draw-record/draw/${id}?body=%7B%7D`,
        headers : {
          'Origin' : `https://lkyl.dianpusoft.cn`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Content-Type' : `application/json`,
          'Referer' : `https://lkyl.dianpusoft.cn/client/?lkEPin=`,
          'Host' : `lkyl.dianpusoft.cn`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`,
          'token' : token
        }
      }
      $.get(url, async (err, resp, data) => {
        try {
          if (printDetail) console.log(data)
          data = JSON.parse(data);
          if (data.head.code !== 200) merge.stopDraw = true
          console.log(typeof data.body !== 'undefined' ? data.body.name : data.head.msg)
          merge.draw.notify += (typeof data.body !== 'undefined' ? data.body.name : data.head.msg)  + ";";
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve()
        }
      })
    },timeout)
  })
}

//获取userName
function encrypt(timeout = 0){
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `https://jdhome.m.jd.com/saas/framework/encrypt/pin?appId=6d28460967bda11b78e077b66751d2b0`,
        headers : {
          'Origin' : `https://jdhome.m.jd.com`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Accept' : `application/json`,
          'Referer' : `https://jdhome.m.jd.com/dist/taro/index.html/`,
          'Host' : `jdhome.m.jd.com`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        }
      }
      $.post(url, async (err, resp, data) => {
        try {
          if (err) {
            console.log(err.error)
            merge.fail = `请求jdhome.m.jd.com失败：${err.error}\n请更换网络环境重试！`
            return
          }
          if (printDetail) console.log(data)
          data = JSON.parse(data);
          if (data.success) {
            userName = data.data;
            await login()
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

//初始化
function initial() {
  merge = {
    nickname: "",
    enabled: true,
    newUser: false,
    stopDraw: false,
    jdBeans: {prizeDesc : "兑换|京豆|个",isNumber : true,fixed : 0},
    draw : {prizeDesc : "抽奖结果",isNumber : false}
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
  let message = "";
  let url ={ "open-url" : `openjd://virtual?params=%7B%20%22category%22:%20%22jump%22,%20%22des%22:%20%22m%22,%20%22url%22:%20%22${encodeURIComponent('https://lkyl.dianpusoft.cn/client/?lkEPin='+userName+'&token='+token)}%22%20%7D`}
  let title = `京东账号：${merge.nickname}`;
  if (merge.draw.notify.split(";").length >3) {
    merge.draw.notify = merge.draw.notify.replace("今日没有抽奖次数;","");
  }
  merge.draw.notify = merge.draw.notify.substr(0,merge.draw.notify.length -1)
  if (merge.end) {
    message += `当前窝币：${merge.end}\n`
    message += merge.end === merge.start ?  `` : `本次新增：${merge.end - merge.start}\n`
    message += merge.draw.prizeDesc +'：'+merge.draw.notify +'\n'
    message += `请点击通知跳转至APP查看`
  } else {
    if (typeof merge.fail === "undefined")
      message += `您的账户尚未开通东东小窝，请先点击通知进入开通`
    else
      message += merge.fail
  }
  $.msg($.name, title, message, url);
}


function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,g=-8){ let f=new Date().getTimezoneOffset();let d=new Date().getTime()+ f * 60 * 1000 - (g * 60 * 60 * 1000); let n = new Date(d);let e={"M+":n.getMonth()+1,"d+":n.getDate(),"H+":n.getHours(),"m+":n.getMinutes(),"s+":n.getSeconds(),"q+":Math.floor((n.getMonth()+3)/3),S:n.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(n.getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r)));let h=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];h.push(e),s&&h.push(s),i&&h.push(i),console.log(h.join("\n")),this.logs=this.logs.concat(h)}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
