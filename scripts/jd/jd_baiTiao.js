/*
京东金融领白条券
更新时间：2020-10-26 16:02
[task_local]
# 京东金融领白条券  9点执行（非天天领券要9点开始领）
0 9 * * * https://raw.githubusercontent.com/yangtingxiao/QuantumultX/master/scripts/jd/jd_baiTiao.js, tag=京东白条, img-url=https://raw.githubusercontent.com/yangtingxiao/QuantumultX/master/image/baitiao.png, enabled=true
*/
const $ = new Env('天天领白条券');
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
//直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '';
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
} else {
  cookiesArr.push($.getdata('CookieJD'));
  cookiesArr.push($.getdata('CookieJD2'));
}
const JR_API_HOST = 'https://jrmkt.jd.com/activity/newPageTake/takePrize';
let prize =
  //每日领随机白条券
  [
    {name : `prizeDaily`, desc : `天天领`, id : `Q72m9P5k3K94223q5k5O1w228U2S8B040D2B9qt`},
    //周一领
    {name : `prizeMonday`, desc : `周一领`, id : `Q1295372232228280029Aw`},
    //周二领
    {name : `prizeTuesday`, desc : `周二领`, id : `Q9293947555491r1b3U870x0D2V95X`},
    //周三领
    {name : `prizeWednesday`, desc : `周三领`, id : `Q8299679592g5N1Y1r3j8X0004269Ll`},
    //周四领
    {name : `prizeThursday`, desc : `周四领`, id : `X9D2l0f0P8S31154947512923QU`},
    //每周五领55-5券
    {name : `prizeFriday`, desc : `周五领`, id : `Q529284818011r8O2Y8L07082T9kE`},
    //周六领
    {name : `prizeSaturday`, desc : `周六领`, id : `i9200831161952186922QB`},
    //周六领2
    {name : `prizeSaturday2`, desc : `周六领`, id : `Q4295706b5Q9t2D6F181k3x8Q0v0W2e9JK`}
  ]

!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '提示：请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {"open-url": "https://bean.m.jd.com/"});
    return;
  }

  for (let i = 0; i < prize.length; i++) {
    prize[i].body =`activityId=${prize[i].id}&eid=${randomWord(false,90).toUpperCase()}&fp=${randomWord(false,32).toLowerCase()}`
  }

  for (let i = 0; i < cookiesArr.length; i++) {
    cookie = cookiesArr[i];
    if (cookie) {
      $.prize = {addMsg : ``};
      let date = new Date();
      await takePrize(prize[0]);
      if ($.prize["prizeDaily"].respCode === "00001" ) {
        $.msg($.name, '提示：请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {"open-url": "https://bean.m.jd.com/"});
        continue;
      }
      if (date.getDay() !== 0) {
        await takePrize(prize[date.getDay()],820);//延迟执行，防止提示活动火爆
        if (date.getDay() === 6) await takePrize(prize[7],820);//第二个周六券
      }
      if (date.getDay() === 0) {
        $.prize.addMsg = `提　醒：请于今天使用周日专享白条券\n`
      }
      await queryMissionWantedDetail();
      await msgShow();
    }
  }
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })


function takePrize(prize,timeout = 0) {
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url: JR_API_HOST,
        body : prize.body,
        headers: {
          'Cookie' : cookie,
          'X-Requested-With' : `XMLHttpRequest`,
          'Accept' : `application/json, text/javascript, */*; q=0.01`,
          'Origin' : `https://jrmkt.jd.com`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Content-Type' : `application/x-www-form-urlencoded;charset=UTF-8`,
          'Host' : `jrmkt.jd.com`,
          'Connection' : `keep-alive`,
          'Referer' : `https://jrmkt.jd.com/ptp/wl/vouchers.html?activityId=${prize.id}`,
          'Accept-Language' : `zh-cn`
        }
      }
      $.post(url, (err, resp, data) => {
        try {
          data = JSON.parse(data);
          $.prize[prize.name] = data;
          $.prize[prize.name].desc = prize.desc;
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve()
        }
      })
    },timeout)
  })
}

function queryMissionWantedDetail(timeout = 0) {
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url: `https://ms.jr.jd.com/gw/generic/mission/h5/m/queryMissionWantedDetail?reqData=%7B%22playId%22:%2281%22,%22channelCode%22:%22MISSIONCENTER%22,%22timeStamp%22:%2${$.time(`yyyy-MM-ddTHH:mm:ss.SZ`)}%22%7D`,
        headers: {
          'Cookie' : cookie,
          'Origin' : `https://m.jr.jd.com`,
          'Connection' : `keep-alive`,
          'Accept' : `application/json`,
          'Referer' : `https://m.jr.jd.com/member/task/RewardDetail/?playId=81&platformCode=MISSIONCENTER&channel=baitiao&jrcontainer=h5&jrcloseweb=false`,
          'Host' : `ms.jr.jd.com`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        }
      }
      $.post(url, async (err, resp, data) => {
        try {
          data = JSON.parse(data);
          switch (data.resultData.data.mission.status ) {
            case -1 :
              $.prize.addMsg += `周任务：${data.resultData.data.mission.name}`;
              await receivePlay(data.resultData.data.mission.missionId);
              break;
            case 0 : // 2已完成  -1未领取  0已领取
              $.prize.addMsg += `周任务：完成进度${data.resultData.data.mission.scheduleNowValue || 0}/${data.resultData.data.mission.scheduleTargetValue}，剩余数量：${data.resultData.data.residueAwardNum || `未知`}\n`
              break;
            case 1 : //
              $.prize.addMsg += `周任务：完成进度${data.resultData.data.mission.scheduleNowValue || 0}/${data.resultData.data.mission.scheduleTargetValue}，剩余数量：${data.resultData.data.residueAwardNum || `未知`}\n`
              break;
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

function receivePlay(missionId,timeout = 0) {
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url: `https://ms.jr.jd.com/gw/generic/mission/h5/m/receivePlay?reqData=%7B%22playId%22:%2281%22,%22channelCode%22:%22MISSIONCENTER%22,%22playType%22:1,%22missionId%22:${missionId},%22timeStamp%22:%22${$.time(`yyyy-MM-ddTHH:mm:ss.SZ`)}%22%7D`,
        headers: {
          'Cookie' : cookie,
          'Origin' : `https://m.jr.jd.com`,
          'Connection' : `keep-alive`,
          'Accept' : `application/json`,
          'Referer' : `https://m.jr.jd.com/member/task/RewardDetail/?playId=81&platformCode=MISSIONCENTER&channel=baitiao&jrcontainer=h5&jrcloseweb=false`,
          'Host' : `ms.jr.jd.com`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        }
      }
      $.post(url, (err, resp, data) => {
        try {
          data = JSON.parse(data);
          $.prize.addMsg += `-${data.resultData.msg.replace(`该任务`,``)}\n`;
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve()
        }
      })
    },timeout)
  })
}


function randomWord(randomFlag, min, max){
  let str = "",
    range = min,
    arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  // 随机产生
  if(randomFlag){
    range = Math.round(Math.random() * (max-min)) + min;
  }
  for(let i=0; i<range; i++){
    pos = Math.round(Math.random() * (arr.length-1));
    str += arr[pos];
  }
  return str;
}

function msgShow() {
  let url ={"open-url" : "jdmobile://share?jumpType=7&jumpUrl=https%3A%2F%2Fm.jr.jd.com%2Fmember%2Fmc%2F%23%2Fhome"}
  $.message = "";
  for (let i in $.prize) {
    if (typeof ($.prize[i]) !== "object" ) continue;
    if ($.message === "") $.message = `用户名：${$.prize[i].nickName}\n`;
    if ($.prize[i].respCode === "00000") {
      $.message += `${$.prize[i].desc}：${$.prize[i].prizeModels[0].prizeName + $.prize[i].prizeModels[0].prizeAward}\n`;
    }
    else {
      $.message += `${$.prize[i].desc}：${typeof($.prize[i].failDesc) == "undefined" ? $.prize[i].respDesc : $.prize[i].failDesc}\n`;
    }
  }
  $.message += $.prize.addMsg ? $.prize.addMsg : "";
  $.msg($.name, '', `${$.message.substr(0,$.message.length - 1)}`, url);
}


function Env(t,s){return new class{constructor(t,s){this.name=t,this.data=null,this.dataFile="box.dat",this.logs=[],this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}getScript(t){return new Promise(s=>{$.get({url:t},(t,e,i)=>s(i))})}runScript(t,s){return new Promise(e=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=s&&s.timeout?s.timeout:o;const[h,a]=i.split("@"),r={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":h,Accept:"*/*"}};$.post(r,(t,s,i)=>e(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),o=JSON.stringify(this.data);e?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(s,o):this.fs.writeFileSync(t,o)}}lodash_get(t,s,e){const i=s.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return e;return o}lodash_set(t,s,e){return Object(t)!==t?t:(Array.isArray(s)||(s=s.toString().match(/[^.[\]]+/g)||[]),s.slice(0,-1).reduce((t,e,i)=>Object(t[e])===t[e]?t[e]:t[e]=Math.abs(s[i+1])>>0==+s[i+1]?[]:{},t)[s[s.length-1]]=e,t)}getdata(t){let s=this.getval(t);if(/^@/.test(t)){const[,e,i]=/^@(.*?)\.(.*?)$/.exec(t),o=e?this.getval(e):"";if(o)try{const t=JSON.parse(o);s=t?this.lodash_get(t,i,""):s}catch(t){s=""}}return s}setdata(t,s){let e=!1;if(/^@/.test(s)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(s),h=this.getval(i),a=i?"null"===h?null:h||"{}":"{}";try{const s=JSON.parse(a);this.lodash_set(s,o,t),e=this.setval(JSON.stringify(s),i)}catch(s){const h={};this.lodash_set(h,o,t),e=this.setval(JSON.stringify(h),i)}}else e=$.setval(t,s);return e}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,s){return this.isSurge()||this.isLoon()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,s=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,s)=>{try{const e=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(e,null),s.cookieJar=this.ckjar}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)))}post(t,s=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t));else if(this.isNode()){this.initGotEnv(t);const{url:e,...i}=t;this.got.post(e,i).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t))}}time(t){let s={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in s)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?s[e]:("00"+s[e]).substr((""+s[e]).length)));return t}msg(s=t,e="",i="",o){const h=t=>!t||!this.isLoon()&&this.isSurge()?t:"string"==typeof t?this.isLoon()?t:this.isQuanX()?{"open-url":t}:void 0:"object"==typeof t&&(t["open-url"]||t["media-url"])?this.isLoon()?t["open-url"]:this.isQuanX()?t:void 0:void 0;this.isSurge()||this.isLoon()?$notification.post(s,e,i,h(o)):this.isQuanX()&&$notify(s,e,i,h(o)),this.logs.push("","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="),this.logs.push(s),e&&this.logs.push(e),i&&this.logs.push(i)}log(...t){t.length>0?this.logs=[...this.logs,...t]:console.log(this.logs.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();e?$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t={}){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,s)}
