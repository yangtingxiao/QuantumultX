/*
京东金融领白条券
更新时间：2021-02-01 15:07
[task_local]
# 京东金融领白条券  0点,9点执行（非天天领券要9点开始领，扫码券0点领）
0 0,9 * * * https://raw.githubusercontent.com/yangtingxiao/QuantumultX/master/scripts/jd/jd_baiTiao.js, tag=京东白条, img-url=https://raw.githubusercontent.com/yangtingxiao/QuantumultX/master/image/baitiao.png, enabled=true
*/
const $ = new Env('天天领白条券');
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const printDetail = false;        //是否显示出参详情
let cookieExpire = false;
let lackCoin = false;
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
    {name : `prizeDaily`, desc : `天天领`, id : `Q8291646471q5f1V1w362z1d0p299jl`},
    //周一领
    {name : `prizeMonday`, desc : `周一领`, id : `Q1295372232228280029Aw`},
    //周二领
    {name : `prizeTuesday`, desc : `周二领`, id : `Q9293947555491r1b3U870x0D2V95X`},
    //周三领
    {name : `prizeWednesday`, desc : `周三领`, id : `p9w2v180c1o0g1w001101211928QW`},
    //周四领
    {name : `prizeThursday`, desc : `周四领`, id : `q9r2C1n0i101001618477923Q1`},
    //每周五领55-5券
    {name : `prizeFriday`, desc : `周五领`, id : `Q529284818011r8O2Y8L07082T9kE`},
    //周六领
    {name : `prizeSaturday`, desc : `周六领`, id : `i9200831161952186922QB`},
    //周六领2
    {name : `prizeSaturday2`, desc : `周六领`, id : `Q4295706b5Q9t2D6F181k3x8Q0v0W2e9JK`}
  ]

!(async () => {
  $.msg($.name,'','活动已结束，请删除或禁用脚本，等待新活动开启！')
  return
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
      $.prize["dailyCoupon"] = "";
      let date = new Date($.time("yyyy/MM/dd HH:mm:ss"));
      cookieExpire = false;
      lackCoin = false;
      await queryCouponsNotGroup()
      if (cookieExpire) {
        $.msg($.name, '提示：请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {"open-url": "https://bean.m.jd.com/"});
        continue;
      }
      await Promise.all([
        queryCouponCenter(),
        gateFloorById(),
        queryAwardCenter()
      ])
      if (date.getHours() > 0) await takePrize(prize[0]);
      if (date.getDay() !== 0 && date.getHours() >= 8) {
        await takePrize(prize[date.getDay()],820);//延迟执行，防止提示活动火爆
        if (date.getDay() === 6) await takePrize(prize[7],820);//第二个周六券
      }

      if (date.getHours() > 0 && date.getDay() === 0) {
        $.prize.addMsg = `提　醒：请于今天使用周日专享白条券\n`
      }
      if (date.getHours() >= 8) await queryMissionWantedDetail();
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
          if (printDetail) console.log(data);
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
          if (printDetail) console.log(data);
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
          if (printDetail) console.log(data);
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

function queryCouponsNotGroup(timeout = 0) {
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url: `https://ms.jr.jd.com/gw/generic/bt/h5/m/queryCouponsNotGroup?reqData=%7B%22businessLine%22:%22LQ_QYZX_SCQ%22%7D`,
        headers: {
          'Cookie' : cookie,
          'Origin' : `https://m.jr.jd.com`,
          'Connection' : `keep-alive`,
          'Accept' : `application/json`,
          'Referer' : `https://m.jr.jd.com/`,
          'Host' : `ms.jr.jd.com`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        }
      }
      $.get(url, async(err, resp, data) => {
        try {
          if (printDetail) console.log(data);
          data = JSON.parse(data);
          if (data.resultData.result.code !== "0000") {
            cookieExpire = true
            return
          }
          for (let i = data.resultData.floorInfo.length - 1;i >= 0 ;i--){
            if (data.resultData.floorInfo[i].couponStatus === "2") {
              if ($.prize["dailyCoupon"].match(/不符合活动参与规则/)) {
                $.prize["dailyCoupon"] = "";
                break;
              }
              await comReceiveCoupon(data.resultData.floorInfo[i].couponKey,100)
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


function comReceiveCoupon(couponKey,timeout = 0) {
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url: `https://ms.jr.jd.com/gw/generic/bt/h5/m/comReceiveCoupon?reqData=%7B%22businessLine%22:%22LQ_QYZX_SCQ%22,%22couponKey%22:%22${couponKey}%22%7D`,
        headers: {
          'Cookie' : cookie,
          'Origin' : `https://m.jr.jd.com`,
          'Connection' : `keep-alive`,
          'Accept' : `application/json`,
          'Referer' : `https://m.jr.jd.com/`,
          'Host' : `ms.jr.jd.com`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        }
      }
      $.get(url, (err, resp, data) => {
        try {
          if (printDetail) console.log(data);
          data = JSON.parse(data);
          if (data.resultData.result.code !== "0000") {
            //$.prize["dailyCoupon"] += data.resultData.result.info
            console.log(data.resultData.result.info)
            return
          }
          $.prize["dailyCoupon"] += data.resultData.couponsVo.prizeAmount + '元;'
          //console.log($.prize["dailyCoupon"])
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve()
        }
      })
    },timeout)
  })
}

function queryCouponCenter(timeout = 0) {
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url: `https://ms.jr.jd.com/gw/generic/hyqy/h5/m/queryCouponCenter?reqData=%7B%22timeStamp%22:%222020-12-08T22:55:51.289Z%22%7D`,
        headers: {
          'Cookie' : cookie,
          'Origin' : `https://m.jr.jd.com`,
          'Connection' : `keep-alive`,
          'Accept' : `application/json`,
          'Referer' : `https://m.jr.jd.com/`,
          'Host' : `ms.jr.jd.com`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        }
      }
      $.get(url, async(err, resp, data) => {
        try {
          if (printDetail) console.log(data);
          data = JSON.parse(data);
          //return
          for (let i = data.resultData.data.length - 1;i >= 0 ;i--) {
            if (data.resultData.data[i].name === "白条券") {
              for (let j = 0;j < data.resultData.data[i].coupons.length;j++) {
                //console.log(data.resultData.data[i].coupons[j].labels)
                //console.log(data.resultData.data[i].coupons[j].id)
                if (data.resultData.data[i].coupons[j].labels === "立减券") {
                  await takeCouponPrize(data.resultData.data[i].coupons[j].id,parseFloat(data.resultData.data[i].coupons[j].briefAmount),820)
                  //break
                }
              }
              break
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

function queryAwardCenter(timeout = 0) {
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `https://pro.m.jd.com/jdjr/active/2gzjhRXJ5pSqEJyvMwRwoFtqcPFd/index.html`,
        headers : {
          'Referer' : `https://wqs.jd.com/my/iserinfo.html`,
          'Cookie' : cookie
        }
      }
      $.get(url, async (err, resp, data) => {
        try {
          if (printDetail) console.log(data.match(/(window.__react_data__ =) (.+)/)[2])
          if (data.match(/(window.__react_data__ =) .+/)) {
            data = JSON.parse(data.match(/(window.__react_data__ =) (.+)/)[2]);
          } else {
            return
          }
          for (let i in data.activityData.floorList) {
            for (let j in data.activityData.floorList[i].couponList) {
              if (data.activityData.floorList[i].couponList[j].status === "0" && data.activityData.floorList[i].couponList[j].scope.match(/扫一扫/)) {
               await newBabelAwardCollection(data.activityData.floorList[i].couponList[j].cpId,parseFloat(data.activityData.floorList[i].couponList[j].val.match(/([1-9]\d*\.?\d*)|(0\.\d*[1-9])/)[0]))
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

function newBabelAwardCollection(actKey,briefAmount,timeout = 0) {
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let body = { "activityId" : "2gzjhRXJ5pSqEJyvMwRwoFtqcPFd", "scene" : 3, "actKey" : actKey }
      let url = {
        url: `https://api.m.jd.com/client.action?functionId=newBabelAwardCollection&body=${encodeURI(JSON.stringify(body))}&client=wh5`,
        headers: {
          'Cookie' : cookie,
          'Origin' : `https://m.jr.jd.com`,
          'Connection' : `keep-alive`,
          'Accept' : `application/json`,
          'Referer' : `https://pro.m.jd.com/jdjr/active/2gzjhRXJ5pSqEJyvMwRwoFtqcPFd/index.html`,
          'Host' : `api.m.jd.com`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        }
      }
      $.get(url, async(err, resp, data) => {
        try {
          if (printDetail) console.log(data);
          //console.log(data);
          data = JSON.parse(data);
          if (data.subCode === "0") {
            $.prize["dailyCoupon"] += briefAmount.toFixed(1) + '元;'
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

function takeCouponPrize(couponId,briefAmount,timeout = 0) {
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let reqData = {"couponId" : couponId,"riskInfo":{"eid" : randomWord(false,90).toUpperCase(),"fp":randomWord(false,32).toLowerCase() ,"appId":"JDJR-App" } }
      let url = {
        url: `https://ms.jr.jd.com/gw/generic/hyqy/h5/m/takePrize?reqData=${encodeURI(JSON.stringify(reqData))}`,
        headers: {
          'Cookie' : cookie,
          'Origin' : `https://m.jr.jd.com`,
          'Connection' : `keep-alive`,
          'Accept' : `application/json`,
          'Referer' : `https://m.jr.jd.com/`,
          'Host' : `ms.jr.jd.com`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        }
      }
      //console.log(url.url)
      $.get(url, async(err, resp, data) => {
        try {
          if (printDetail) console.log(data);
          data = JSON.parse(data);
          if (data.resultData.code === "0000") {
            $.prize["dailyCoupon"] += briefAmount.toFixed(1) + '元;'
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


function gateFloorById(timeout = 0) {
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url: `https://ms.jr.jd.com/gw/generic/hy/h5/m/gateFloorById?reqData=%7B%22pageSize%22%3A1000%2C%22version%22%3A%221.0%22%2C%22timeStamp%22%3A1607467849952%7D`,
        headers: {
          'Cookie' : cookie,
          'Origin' : `https://m.jr.jd.com`,
          'Connection' : `keep-alive`,
          'Accept' : `application/json`,
          'Referer' : `https://m.jr.jd.com/`,
          'Host' : `ms.jr.jd.com`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        }
      }
      $.get(url, async(err, resp, data) => {
        try {
          if (printDetail) console.log(data);
          data = JSON.parse(data);
          for (let i = 0;i < data.resultData.data.data.length;i++) {
            if (lackCoin) break
            if (data.resultData.data.data[i].name.match(/白条.*?立减/) && data.resultData.data.data[i].exchangeStatus === 1) {
              //console.log(data.resultData.data.data[i].name.match(/([1-9]\d*\.?\d*)|(0\.\d*[1-9])/)[0])
              //console.log(data.resultData.data.data[i].amount)
              //console.log(data.resultData.data.data[i].productId)
              if (data.resultData.data.data[i].amount < 50){
                await gateExchange(data.resultData.data.data[i].productId,parseFloat(data.resultData.data.data[i].name.match(/([1-9]\d*\.?\d*)|(0\.\d*[1-9])/)[0]),3000)
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

function gateExchange(productId,briefAmount,timeout = 0) {
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let reqData = {"productId" : productId,"channel":"gcmall-floorId-30","appType":"JR_APP" }
      let url = {
        url: `https://ms.jr.jd.com/gw/generic/hy/h5/m/gateExchange?reqData=${encodeURI(JSON.stringify(reqData))}`,
        headers: {
          'Cookie' : cookie,
          'Origin' : `https://m.jr.jd.com`,
          'Connection' : `keep-alive`,
          'Accept' : `application/json`,
          'Referer' : `https://m.jr.jd.com/`,
          'Host' : `ms.jr.jd.com`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        }
      }
      //console.log(url.url)
      $.get(url, async(err, resp, data) => {
        try {
          if (printDetail) console.log(data);
          data = JSON.parse(data);
          if (data.resultData.code === "0000") {
            $.prize["dailyCoupon"] += briefAmount.toFixed(1) + '元;'
          } else if (data.resultData.code === "2906") {
            lackCoin = true
          } else {
            console.log(data.resultData.msg)
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
  if ($.prize["dailyCoupon"] !== "") {
    $.message += "扫码券：" + $.prize["dailyCoupon"].substr(0,$.prize["dailyCoupon"].length - 1) + '\n'
  }
  $.message += $.prize.addMsg ? $.prize.addMsg : "";
  $.msg($.name, '', `${$.message.substr(0,$.message.length - 1)}`, url);
}


function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,g=-8){ let f=new Date().getTimezoneOffset();let d=new Date().getTime()+ f * 60 * 1000 - (g * 60 * 60 * 1000); let n = new Date(d);let e={"M+":n.getMonth()+1,"d+":n.getDate(),"H+":n.getHours(),"m+":n.getMinutes(),"s+":n.getSeconds(),"q+":Math.floor((n.getMonth()+3)/3),S:n.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(n.getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r)));let h=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];h.push(e),s&&h.push(s),i&&h.push(i),console.log(h.join("\n")),this.logs=this.logs.concat(h)}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
