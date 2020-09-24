const $ = new Env();
// =======================================微信server酱通知设置区域===========================================
//此处填你申请的SCKEY.
//注：此处设置github action用户填写到Settings-Secrets里面(Name输入PUSH_KEY)
let SCKEY = '';

// =======================================Bark App通知设置区域===========================================
//此处填你BarkAPP的信息(IP/设备码，例如：https://api.day.app/XXXXXXXX)
//注：此处设置github action用户填写到Settings-Secrets里面（Name输入BARK_PUSH）
let BARK_PUSH = '';
//BARK app推送铃声,铃声列表去APP查看复制填写
//注：此处设置github action用户填写到Settings-Secrets里面（Name输入BARK_SOUND , Value输入app提供的铃声名称，例如:birdsong）
let BARK_SOUND = '';

// =======================================telegram机器人通知设置区域===========================================
//此处填你telegram bot 的Token，例如：1077xxx4424:AAFjv0FcqxxxxxxgEMGfi22B4yh15R5uw
//注：此处设置github action用户填写到Settings-Secrets里面(Name输入TG_BOT_TOKEN)
let TG_BOT_TOKEN = '';
//此处填你接收通知消息的telegram用户的id，例如：129xxx206
//注：此处设置github action用户填写到Settings-Secrets里面(Name输入TG_USER_ID)
let TG_USER_ID = '';

//运行农场脚本是否静默运行(即：不推送通知),false打开通知推送，true关闭通知推送
//注：此处设置github action用户填写到Settings-Secrets里面(Name输入 FRUIT_NOTIFY_CONTROL , Value填写true或者false)
let fruitNotifyControl = false;//(默认农场脚本推送通知)

//运行萌宠脚本是否静默运行(即：不推送通知),false打开通知推送，true关闭通知推送
//注：此处设置github action用户填写到Settings-Secrets里面(Name输入 PET_NOTIFY_CONTROL , Value填写true或者false)
let petNotifyControl = false;//(默认萌宠脚本推送通知)

if (process.env.PUSH_KEY) {
  SCKEY = process.env.PUSH_KEY;
}
if (process.env.BARK_PUSH) {
  if(process.env.BARK_PUSH.indexOf('https') > -1 || process.env.BARK_PUSH.indexOf('http') > -1) {
    //兼容BARK自建用户
    BARK_PUSH = process.env.BARK_PUSH
  } else {
    BARK_PUSH = `https://api.day.app/${process.env.BARK_PUSH}`
  }
  if (process.env.BARK_SOUND) {
    BARK_SOUND = process.env.BARK_SOUND
  }
}


if (process.env.TG_BOT_TOKEN) {
  TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;
}
if (process.env.TG_USER_ID) {
  TG_USER_ID = process.env.TG_USER_ID;
}

if (process.env.FRUIT_NOTIFY_CONTROL) {
  fruitNotifyControl = process.env.FRUIT_NOTIFY_CONTROL;
}
if (process.env.PET_NOTIFY_CONTROL) {
  petNotifyControl = process.env.PET_NOTIFY_CONTROL;
}
async function sendNotify(text, desp) {
  //提供三种通知
  await serverNotify(text, desp);
  await BarkNotify(text, desp);
  await tgBotNotify(text, desp);
}

function serverNotify(text, desp) {
  return  new Promise(resolve => {
    if (SCKEY) {
      //微信server酱推送通知一个\n不会换行，需要两个\n才能换行，故做此替换
      desp = desp.replace(/[\n\r]/g, '\n\n');
      const options = {
        url: `https://sc.ftqq.com/${SCKEY}.send`,
        body: `text=${text}&desp=${desp}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
      $.post(options, (err, resp, data) => {
        try {
          if (err) {
            console.log('\n发送通知调用API失败！！\n')
          } else {
            data = JSON.parse(data);
            if (data.errno === 0) {
              console.log('\nserver酱发送通知消息成功\n')
            } else if (data.errno === 1024) {
              console.log('\nPUSH_KEY 错误\n')
            }
          }
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve(data);
        }
      })
    } else {
      console.log('\n您未提供server酱的SCKEY，取消微信推送消息通知\n');
      resolve()
    }
  })
}

function BarkNotify(text, desp) {
  return  new Promise(resolve => {
    if (BARK_PUSH) {
      const options = {
        url: `${BARK_PUSH}/${encodeURIComponent(text)}/${encodeURIComponent(desp)}?sound=${BARK_SOUND}`,
      }
      $.get(options, (err, resp, data) => {
        try {
          if (err) {
            console.log('\nBark APP发送通知调用API失败！！\n')
          } else {
            data = JSON.parse(data);
            if (data.code === 200) {
              console.log('\nBark APP发送通知消息成功\n')
            } else {
              console.log(`\n${data.message}\n`);
            }
          }
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve();
        }
      })
    } else {
      console.log('\n您未提供Bark的APP推送BARK_PUSH，取消Bark推送消息通知\n');
      resolve()
    }
  })
}

function tgBotNotify(text, desp) {
  return  new Promise(resolve => {
    if (TG_BOT_TOKEN && TG_USER_ID) {
      const options = {
        url: `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`,
        body: `chat_id=${TG_USER_ID}&text=${text}\n\n${desp}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
      $.post(options, (err, resp, data) => {
        try {
          if (err) {
            console.log('\ntelegram发送通知消息失败！！\n')
          } else {
            data = JSON.parse(data);
            if (data.ok) {
              console.log('\nTelegram发送通知消息完成。\n')
            } else if (data.error_code === 400) {
              console.log('\n请主动给bot发送一条消息并检查接收用户ID是否正确。\n')
            } else if (data.error_code === 401){
              console.log('\nTelegram bot token 填写错误。\n')
            }
          }
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve(data);
        }
      })
    } else {
      console.log('\n您未提供telegram机器人推送所需的TG_BOT_TOKEN和TG_USER_ID，取消telegram推送消息通知\n');
      resolve()
    }
  })
}
module.exports = {
  sendNotify,
  BarkNotify,
  SCKEY,
  BARK_PUSH,
  TG_BOT_TOKEN,
  TG_USER_ID,
  fruitNotifyControl,
  petNotifyControl
}
// prettier-ignore
function Env(t,s){return new class{constructor(t,s){this.name=t,this.data=null,this.dataFile="box.dat",this.logs=[],this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}getScript(t){return new Promise(s=>{$.get({url:t},(t,e,i)=>s(i))})}runScript(t,s){return new Promise(e=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=s&&s.timeout?s.timeout:o;const[h,a]=i.split("@"),r={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":h,Accept:"*/*"}};$.post(r,(t,s,i)=>e(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),o=JSON.stringify(this.data);e?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(s,o):this.fs.writeFileSync(t,o)}}lodash_get(t,s,e){const i=s.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return e;return o}lodash_set(t,s,e){return Object(t)!==t?t:(Array.isArray(s)||(s=s.toString().match(/[^.[\]]+/g)||[]),s.slice(0,-1).reduce((t,e,i)=>Object(t[e])===t[e]?t[e]:t[e]=Math.abs(s[i+1])>>0==+s[i+1]?[]:{},t)[s[s.length-1]]=e,t)}getdata(t){let s=this.getval(t);if(/^@/.test(t)){const[,e,i]=/^@(.*?)\.(.*?)$/.exec(t),o=e?this.getval(e):"";if(o)try{const t=JSON.parse(o);s=t?this.lodash_get(t,i,""):s}catch(t){s=""}}return s}setdata(t,s){let e=!1;if(/^@/.test(s)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(s),h=this.getval(i),a=i?"null"===h?null:h||"{}":"{}";try{const s=JSON.parse(a);this.lodash_set(s,o,t),e=this.setval(JSON.stringify(s),i)}catch(s){const h={};this.lodash_set(h,o,t),e=this.setval(JSON.stringify(h),i)}}else e=$.setval(t,s);return e}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,s){return this.isSurge()||this.isLoon()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,s=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,s)=>{try{const e=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(e,null),s.cookieJar=this.ckjar}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)))}post(t,s=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t));else if(this.isNode()){this.initGotEnv(t);const{url:e,...i}=t;this.got.post(e,i).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t))}}time(t){let s={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in s)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?s[e]:("00"+s[e]).substr((""+s[e]).length)));return t}msg(s=t,e="",i="",o){const h=t=>!t||!this.isLoon()&&this.isSurge()?t:"string"==typeof t?this.isLoon()?t:this.isQuanX()?{"open-url":t}:void 0:"object"==typeof t&&(t["open-url"]||t["media-url"])?this.isLoon()?t["open-url"]:this.isQuanX()?t:void 0:void 0;$.isMute||(this.isSurge()||this.isLoon()?$notification.post(s,e,i,h(o)):this.isQuanX()&&$notify(s,e,i,h(o))),this.logs.push("","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="),this.logs.push(s),e&&this.logs.push(e),i&&this.logs.push(i)}log(...t){t.length>0?this.logs=[...this.logs,...t]:console.log(this.logs.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();e?$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t={}){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,s)}