/*
京东大赢家 双11活动
更新时间：2020-11-09 13:10
修复火爆问题，第一次还有可能个别的火爆，再次运行即可
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
// quantumultx
[task_local]
#京东大赢家
5 0-22/2 * * * https://raw.githubusercontent.com/yangtingxiao/QuantumultX/master/scripts/jd/jd_bigWinner.js, tag=京东大赢家, img-url=https://raw.githubusercontent.com/yangtingxiao/QuantumultX/master/image/jd.png, enabled=true
// Loon
[Script]
cron "5 0-22/2 * * *" script-path=https://raw.githubusercontent.com/yangtingxiao/QuantumultX/master/scripts/jd/jd_bigWinner.js,tag=京东大赢家
// Surge
京东大赢家 = type=cron,cronexp=5 0-22/2 * * *,wake-system=1,timeout=500,script-path=https://raw.githubusercontent.com/yangtingxiao/QuantumultX/master/scripts/jd/jd_bigWinner.js
*/
const $ = new Env('京东大赢家');
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '',secretp = '';
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
} else {
  cookiesArr.push($.getdata('CookieJD'));
  cookiesArr.push($.getdata('CookieJD2'));
}

const JD_API_HOST = `https://api.m.jd.com/client.action?functionId=`;
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {"open-url": "https://bean.m.jd.com/"});
    return;
  }
  //console.log('提示-1002的账号是因为京东对入参进行了强校验，并不是黑号，目前无法使用脚本，请手动去APP做吧，不提示-1002的可以继续使用')
  //console.log('目前京东已全面判断入参校验，所有账号都不能用，手动做吧')
  //console.log('请删除或禁用脚本！')
  //return


  for (let i = 0; i < cookiesArr.length; i++) {
    cookie = cookiesArr[i];
    if (cookie) {
      if (Date.now() > Date.parse('2020-11-12')) {
        $.msg($.Name,"","活动已结束，请删除或禁用脚本！")
        return
      }
      initial();
      await  QueryJDUserInfo();
      if (!merge.enabled)  //cookie不可用
      {
        $.setdata('', `CookieJD${i ? i + 1 : "" }`);//cookie失效，故清空cookie。
        $.msg($.name, `【提示】京东账号${i ? i + 1 : "" } cookie已过期！请先获取cookie\n直接使用NobyDa的京东签到获取`, 'https://bean.m.jd.com/', {"open-url": "https://bean.m.jd.com/"});
        continue;
      }
      console.log('\n\n京东账号：'+merge.nickname + ' 任务开始')
      await stall_pk_getHomeData();
      await stall_getHomeData();
      //if (merge.black)  continue ;
      //await stall_pk_assistGroup()
      await stall_myShop()
      await qryCompositeMaterials()
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

//查询任务 "appSign":"2","channel":1,
function stall_getTaskDetail(shopSign = "",appSign = "",timeout = 0){
  return new Promise((resolve) => {
    setTimeout( ()=>{
      appSign = appSign&&'"appSign":"2","channel":1,'
      let url = {
        url : `${JD_API_HOST}stall_getTaskDetail`,
        headers : {
          'Origin' : `https://wbbny.m.jd.com`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Accept' : `application/json, text/plain, */*`,
          'Host' : `api.m.jd.com`,
          'User-Agent' : `jdapp;iPhone;9.2.0;14.1;`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        },
        body : `functionId=stall_getTaskDetail&body={${appSign}"shopSign":"${shopSign}"}&client=wh5&clientVersion=1.0.0`
      }

      $.post(url, async (err, resp, data) => {
        try {
          //console.log('stall_getTaskDetail:' + data)
          data = JSON.parse(data);
          if (shopSign === "") {
            shopSign = '""'
            //if (appSign === "") console.log(`您的个人助力码：${data.data.result.inviteId}`)
          }
          for (let i = 0;i < data.data.result.taskVos.length;i ++) {
            //if (merge.black)  return ;
            console.log( "\n" + data.data.result.taskVos[i].taskType + '-' + data.data.result.taskVos[i].taskName + (appSign&&"（微信小程序）") + '-'  +  (data.data.result.taskVos[i].status === 1 ? `已完成${data.data.result.taskVos[i].times}-未完成${data.data.result.taskVos[i].maxTimes}` : "全部已完成")  )
            let rnd = Math.round(Math.random()*1e6)
            let nonstr = randomWord(false,10)
            let time = Date.now()
            let key = minusByByte(nonstr.slice(0,5),String(time).slice(-5))
            let msg = `inviteId=-1&rnd=${rnd}&stealId=-1&taskId=${data.data.result.taskVos[i].taskId}&token=dzbn7uttoxf3v6kowburzrashgxz9jpq&time=${time}&nonce_str=${nonstr}&key=${key}&is_trust=true`
            let sign = bytesToHex(wordsToBytes(getSign(msg))).toUpperCase()
            if ([1,3,7,9].includes(data.data.result.taskVos[i].taskType) && data.data.result.taskVos[i].status === 1 ) {
              let list = data.data.result.taskVos[i].brandMemberVos||data.data.result.taskVos[i].followShopVo||data.data.result.taskVos[i].shoppingActivityVos||data.data.result.taskVos[i].browseShopVo
              //console.log(list)
              //if (data.data.result.taskVos[i].taskType === 9) continue
              for (let k = data.data.result.taskVos[i].times; k < data.data.result.taskVos[i].maxTimes; k++) {
                //body : `functionId=stall_collectProduceScore&body={"ss":"{\\"extraData\\":{\\"is_trust\\":true,\\"sign\\":\\"${sign}\\",\\"fpb\\":\\"xAX3mMUyCgH120XCrQXIZUw==\\",\\"time\\":${time},\\"encrypt\\":\\"3\\",\\"nonstr\\":\\"${nonstr}\\",\\"jj\\":\\"\\",\\"token\\":\\"dzbn7uttoxf3v6kowburzrashgxz9jpq\\",\\"cf_v\\":\\"1.0.1\\",\\"client_version\\":\\"2.1.3\\",\\"sceneid\\":\\"homePageh5\\",\\"appid\\":\\"50073\\"},\\"businessData\\":{\\"taskId\\":\\"collectProducedCoin\\",\\"rnd\\":\\"${rnd}\\",\\"inviteId\\":\\"-1\\",\\"stealId\\":\\"-1\\"},\\"secretp\\":\\"${secretp}\\"}"}&client=wh5&clientVersion=1.0.0`
                for (let j in list) {
                  if (list[j].status === 1) {
                    let  taskBody = `functionId=stall_collectScore&body={"taskId":${data.data.result.taskVos[i].taskId},"itemId":"${list[j].itemId}","ss":"{\\"extraData\\":{\\"is_trust\\":true,\\"sign\\":\\"${sign}\\",\\"time\\":${time},\\"encrypt\\":\\"3\\",\\"nonstr\\":\\"${nonstr}\\",\\"jj\\":\\"\\",\\"token\\":\\"dzbn7uttoxf3v6kowburzrashgxz9jpq\\",\\"cf_v\\":\\"1.0.1\\",\\"client_version\\":\\"2.1.3\\",\\"sceneid\\":\\"homePageh5\\",\\"appid\\":\\"50073\\"},\\"businessData\\":{\\"taskId\\":\\"${data.data.result.taskVos[i].taskId}\\",\\"rnd\\":\\"${rnd}\\",\\"inviteId\\":\\"-1\\",\\"stealId\\":\\"-1\\"},\\"secretp\\":\\"${secretp}\\"}","actionType":"1","shopSign":${shopSign}}&client=wh5&clientVersion=1.0.0`
                    console.log("\n"+(list[j].title||list[j].shopName))
                    await stall_collectScore(taskBody,2000)
                    //}
                    list[j].status = 2;
                    break;
                  } else {
                    continue;
                  }
                }
              }
            }

            if ([12,13].includes(data.data.result.taskVos[i].taskType) && data.data.result.taskVos[i].status === 1) {
              //let  taskBody = `functionId=stall_collectScore&body={"taskId":${data.data.result.taskVos[i].taskId},"itemId":"1","ss":"{\\"extraData\\":{},\\"businessData\\":{},\\"secretp\\":\\"${secretp}\\"}","shopSign":${shopSign}}&client=wh5&clientVersion=1.0.0`
              let  taskBody = `functionId=stall_collectScore&body={"taskId":${data.data.result.taskVos[i].taskId},"itemId":"1","ss":"{\\"extraData\\":{\\"is_trust\\":true,\\"sign\\":\\"${sign}\\",\\"time\\":${time},\\"encrypt\\":\\"3\\",\\"nonstr\\":\\"${nonstr}\\",\\"jj\\":\\"\\",\\"token\\":\\"dzbn7uttoxf3v6kowburzrashgxz9jpq\\",\\"cf_v\\":\\"1.0.1\\",\\"client_version\\":\\"2.1.3\\",\\"sceneid\\":\\"homePageh5\\",\\"appid\\":\\"50073\\"},\\"businessData\\":{\\"taskId\\":\\"${data.data.result.taskVos[i].taskId}\\",\\"rnd\\":\\"${rnd}\\",\\"inviteId\\":\\"-1\\",\\"stealId\\":\\"-1\\"},\\"secretp\\":\\"${secretp}\\"}","actionType":"1","shopSign":${shopSign}}&client=wh5&clientVersion=1.0.0`
              for (let k = data.data.result.taskVos[i].times; k < data.data.result.taskVos[i].maxTimes; k++) {
                  if (merge.black)  return ;
                  //if (typeof data.data.result.taskVos[i].simpleRecordInfoVo !== "undefined"){
                  //  taskBody = encodeURIComponent(`{"dataSource":"newshortAward","method":"getTaskAward","reqParams":"{\\"taskToken\\":\\"${data.data.result.taskVos[i].simpleRecordInfoVo.taskToken}\\"}","sdkVersion":"1.0.0","clientLanguage":"zh"}`)
                  //  await qryViewkitCallbackResult(taskBody,1000)
                  //} else {
                  await stall_collectScore(taskBody,3000)
                  //}
                }
            }

            if ([2].includes(data.data.result.taskVos[i].taskType) && data.data.result.taskVos[i].status === 1) {
              for (let k = data.data.result.taskVos[i].times; k < data.data.result.taskVos[i].maxTimes; k++) {
                await stall_getFeedDetail(data.data.result.taskVos[i].taskId)
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

//获取我的城市
function stall_myShop(timeout = 0){
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}stall_myShop`,
        headers : {
          'Origin' : `https://wbbny.m.jd.com`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Accept' : `application/json, text/plain, */*`,
          'Host' : `api.m.jd.com`,
          'User-Agent' : `jdapp;iPhone;9.2.0;14.1;`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        },
        body : `functionId=stall_myShop&body={"ss":"{\\"extraData\\":{},\\"businessData\\":{},\\"secretp\\":\\"${secretp}\\"}"}&client=wh5&clientVersion=1.0.0`
      }
      $.post(url, async (err, resp, data) => {
        try {
          //console.log('stall_myShop:' + data)
          data = JSON.parse(data);
          for (let i in data.data.result.shopList) {
            // (data.data.result.shopList[i].status === 1) {
              //console.log(data.data.result.shopList[i])
            console.log('\n开始城市任务：'+ data.data.result.shopList[i].name)// + '-' + data.data.result.shopList[i].shopId
            await stall_getTaskDetail(data.data.result.shopList[i].shopId)
            //}
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

//逛商城
function stall_shopSignInWrite(shopSign,timeout = 0){
  return new Promise((resolve) => {

    let rnd = Math.round(Math.random()*1e6)
    let nonstr = randomWord(false,10)
    let time = Date.now()
    let key = minusByByte(nonstr.slice(0,5),String(time).slice(-5))
    let msg = `inviteId=-1&rnd=${rnd}&stealId=-1&taskId=${shopSign}&token=dzbn7uttoxf3v6kowburzrashgxz9jpq&time=${time}&nonce_str=${nonstr}&key=${key}&is_trust=true`
    let sign = bytesToHex(wordsToBytes(getSign(msg))).toUpperCase()

    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}stall_shopSignInWrite`,
        headers : {
          'Origin' : `https://wbbny.m.jd.com`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Accept' : `application/json, text/plain, */*`,
          'Host' : `api.m.jd.com`,
          'User-Agent' : `jdapp;iPhone;9.2.0;14.1;`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        },
        body : `functionId=stall_shopSignInWrite&body={"shopSign":"${shopSign}","ss":"{\\"extraData\\":{\\"is_trust\\":true,\\"sign\\":\\"${sign}\\",\\"time\\":${time},\\"encrypt\\":\\"3\\",\\"nonstr\\":\\"${nonstr}\\",\\"jj\\":\\"\\",\\"token\\":\\"dzbn7uttoxf3v6kowburzrashgxz9jpq\\",\\"cf_v\\":\\"1.0.1\\",\\"client_version\\":\\"2.1.3\\",\\"sceneid\\":\\"homePageh5\\",\\"appid\\":\\"50073\\"},\\"businessData\\":{\\"taskId\\":\\"${shopSign}\\",\\"rnd\\":\\"${rnd}\\",\\"inviteId\\":\\"-1\\",\\"stealId\\":\\"-1\\"},\\"secretp\\":\\"${secretp}\\"}"}&client=wh5&clientVersion=1.0.0`
      }
      $.post(url, async (err, resp, data) => {
        try {
          //console.log(data)
          data = JSON.parse(data);
          if (data.data.bizCode !== 0) {
            console.log(data.data.bizMsg)
            merge.end = true
          } else {
            console.log('获得金币' + data.data.result.score)
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

//逛商城
function stall_shopSignInRead(shopSign,timeout = 0){
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}stall_shopSignInRead`,
        headers : {
          'Origin' : `https://wbbny.m.jd.com`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Accept' : `application/json, text/plain, */*`,
          'Host' : `api.m.jd.com`,
          'User-Agent' : `jdapp;iPhone;9.2.0;14.1;`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        },
        body : `functionId=stall_shopSignInRead&client=wh5&clientVersion=1.0.0&body={"shopSign":"${shopSign}"}`
      }
      $.post(url, async (err, resp, data) => {
        try {
          data = JSON.parse(data);
          //console.log(shopSign)
          if (data.data.result.signInTag === 0) {
             secretp = secretp||data.data.result.secretp
             await stall_shopSignInWrite(shopSign)
          } else {
            console.log('已逛过')
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

//收金币
function stall_collectProduceScore(timeout = 0){
  return new Promise((resolve) => {
    let rnd = Math.round(Math.random()*1e6)
    let nonstr = randomWord(false,10)
    let time = Date.now()
    let key = minusByByte(nonstr.slice(0,5),String(time).slice(-5))
    let msg = `inviteId=-1&rnd=${rnd}&stealId=-1&taskId=collectProducedCoin&token=dzbn7uttoxf3v6kowburzrashgxz9jpq&time=${time}&nonce_str=${nonstr}&key=${key}&is_trust=true`
    let sign = bytesToHex(wordsToBytes(getSign(msg))).toUpperCase()
    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}stall_collectProduceScore`,
        headers : {
          'Origin' : `https://wbbny.m.jd.com`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Accept' : `application/json, text/plain, */*`,
          'Host' : `api.m.jd.com`,
          'User-Agent' : `jdapp;iPhone;9.2.0;14.1;`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        },
        body : `functionId=stall_collectProduceScore&body={"ss":"{\\"extraData\\":{\\"is_trust\\":true,\\"sign\\":\\"${sign}\\",\\"fpb\\":\\"xAX3mMUyCgH120XCrQXIZUw==\\",\\"time\\":${time},\\"encrypt\\":\\"3\\",\\"nonstr\\":\\"${nonstr}\\",\\"jj\\":\\"\\",\\"token\\":\\"dzbn7uttoxf3v6kowburzrashgxz9jpq\\",\\"cf_v\\":\\"1.0.1\\",\\"client_version\\":\\"2.1.3\\",\\"sceneid\\":\\"homePageh5\\",\\"appid\\":\\"50073\\"},\\"businessData\\":{\\"taskId\\":\\"collectProducedCoin\\",\\"rnd\\":\\"${rnd}\\",\\"inviteId\\":\\"-1\\",\\"stealId\\":\\"-1\\"},\\"secretp\\":\\"${secretp}\\"}"}&client=wh5&clientVersion=1.0.0`
      }
      //console.log(url.body)
      $.post(url, async (err, resp, data) => {
        try {
          //console.log(data)
          data = JSON.parse(data);
          if (data.data.bizCode === -1002) {
            //console.log('此账号暂不可使用脚本，脚本终止！')
            //merge.black = true;
            return ;
          }
          console.log(`\n收取金币：${data.data.result.produceScore}`)
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve()
        }
      })
    },timeout)
  })
}

//获取可偷
function stall_pk_getStealForms(taskBody,timeout = 0){
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}stall_pk_getStealForms`,
        headers : {
          'Origin' : `https://wbbny.m.jd.com`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Accept' : `application/json, text/plain, */*`,
          'Host' : `api.m.jd.com`,
          'User-Agent' : `jdapp;iPhone;9.2.0;14.1;`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        },
        body : taskBody
      }
      $.post(url, async (err, resp, data) => {
        try {
          console.log(data)
          data = JSON.parse(data);
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
function stall_collectScore(taskBody,timeout = 0){
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}stall_collectScore`,
        headers : {
          'Origin' : `https://wbbny.m.jd.com`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Accept' : `application/json, text/plain, */*`,
          'Host' : `api.m.jd.com`,
          'User-Agent' : `jdapp;iPhone;9.2.0;14.1;`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        },
        body : taskBody
      }
      //console.log(url.body)
      $.post(url, async (err, resp, data) => {
        try {
          //console.log(data)
          data = JSON.parse(data);
          console.log('任务执行结果：' + data.data.bizMsg)
          if (data.data.bizCode === -1002) {
            await $.wait(1000)
            //console.log('此账号暂不可使用脚本，脚本终止！')
            //merge.black = true;
            return ;
          }
          if (data.data.bizCode === 0 && typeof data.data.result.taskToken !== "undefined") {
            //console.log('需要再次执行,如提示活动异常请多次重试，个别任务多次执行也不行就去APP做吧！')
            let taskBody = encodeURIComponent(`{"dataSource":"newshortAward","method":"getTaskAward","reqParams":"{\\"taskToken\\":\\"${data.data.result.taskToken}\\"}","sdkVersion":"1.0.0","clientLanguage":"zh"}`)
            //console.log(taskBody)
            await qryViewkitCallbackResult(taskBody,8000)
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

//查询甄选任务
function stall_getFeedDetail(taskId,timeout = 0){
  return new Promise((resolve) => {

    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}stall_getFeedDetail`,
        headers : {
          'Origin' : `https://wbbny.m.jd.com`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Accept' : `application/json, text/plain, */*`,
          'Host' : `api.m.jd.com`,
          'User-Agent' : `jdapp;iPhone;9.2.0;14.1;`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        },
        body : `functionId=stall_getFeedDetail&body={"taskId":"${taskId}"}&client=wh5&clientVersion=1.0.0`
      }
      //console.log(url)
      $.post(url, async (err, resp, data) => {
        try {
          //console.log(data)
          data = JSON.parse(data);
          let list =  data.data.result.viewProductVos||data.data.result.addProductVos
          for (let i in list) {
            if (list[i].status === 1) {
              for (let j in list[i].productInfoVos) {
                if (j >= 5)  break;

                let rnd = Math.round(Math.random()*1e6)
                let nonstr = randomWord(false,10)
                let time = Date.now()
                let key = minusByByte(nonstr.slice(0,5),String(time).slice(-5))
                let msg = `inviteId=-1&rnd=${rnd}&stealId=-1&taskId=${taskId}&token=dzbn7uttoxf3v6kowburzrashgxz9jpq&time=${time}&nonce_str=${nonstr}&key=${key}&is_trust=true`
                let sign = bytesToHex(wordsToBytes(getSign(msg))).toUpperCase()
                let taskBody = `functionId=stall_collectScore&body={"taskId":${list[i].taskId},"itemId":"${list[i].productInfoVos[j].skuId}","ss":"{\\"extraData\\":{\\"is_trust\\":true,\\"sign\\":\\"${sign}\\",\\"time\\":${time},\\"encrypt\\":\\"3\\",\\"nonstr\\":\\"${nonstr}\\",\\"jj\\":\\"\\",\\"token\\":\\"dzbn7uttoxf3v6kowburzrashgxz9jpq\\",\\"cf_v\\":\\"1.0.1\\",\\"client_version\\":\\"2.1.3\\",\\"sceneid\\":\\"homePageh5\\",\\"appid\\":\\"50073\\"},\\"businessData\\":{\\"taskId\\":\\"${taskId}\\",\\"rnd\\":\\"${rnd}\\",\\"inviteId\\":\\"-1\\",\\"stealId\\":\\"-1\\"},\\"secretp\\":\\"${secretp}\\"}","shopSign":""}&client=wh5&clientVersion=1.0.0`
                console.log(list[i].productInfoVos[j].skuName)
                await stall_collectScore(taskBody,1000)
              }
              list[i].status = 2
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

//做任务2
function qryViewkitCallbackResult(taskBody,timeout = 0) {
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `https://api.m.jd.com/?functionId=qryViewkitCallbackResult&client=wh5&clientVersion=1.0.0&body=${taskBody}&_timestamp=`+Date.now(),
        headers : {
          'Origin' : `https://bunearth.m.jd.com`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Accept' : `*/*`,
          'Host' : `api.m.jd.com`,
          'User-Agent' : `jdapp;iPhone;9.2.0;14.1;`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`,
          'Content-Type' : 'application/x-www-form-urlencoded',
          'Referer' : 'https://bunearth.m.jd.com/babelDiy/Zeus/4SJUHwGdUQYgg94PFzjZZbGZRjDd/index.html?jmddToSmartEntry=login'
        }
       }

      $.get(url, async (err, resp, data) => {
        try {
          //console.log(url.url)
          //console.log(data)
          data = JSON.parse(data);
          console.log(data.toast.subTitle)
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve()
        }
      })
    },timeout)
  })
}

//群组助力
function stall_pk_assistGroup(inviteId = "XUkkFpUhDG0OdMYzp22uY_lyEaiFin-OxTLmhqosoNJHNIHp84xOJxNmUElr71Un",timeout = 0) {
  return new Promise((resolve) => {
    let rnd = Math.round(Math.random()*1e6)
    let nonstr = randomWord(false,10)
    let time = Date.now()
    let key = minusByByte(nonstr.slice(0,5),String(time).slice(-5))
    let msg = `inviteId=${inviteId}&rnd=${rnd}&stealId=-1&taskId=2&token=dzbn7uttoxf3v6kowburzrashgxz9jpq&time=${time}&nonce_str=${nonstr}&key=${key}&is_trust=true`
    let sign = bytesToHex(wordsToBytes(getSign(msg))).toUpperCase()
    //let taskBody = `functionId=stall_collectScore&body={"taskId":2,"itemId":"${data.data.result.homeMainInfo.guestInfo.itemId}","inviteId": "${body}","ss":"{\\"extraData\\":{\\"is_trust\\":true,\\"sign\\":\\"${sign}\\",\\"time\\":${time},\\"encrypt\\":\\"3\\",\\"nonstr\\":\\"${nonstr}\\",\\"jj\\":\\"\\",\\"token\\":\\"dzbn7uttoxf3v6kowburzrashgxz9jpq\\",\\"cf_v\\":\\"1.0.1\\",\\"client_version\\":\\"2.1.3\\",\\"sceneid\\":\\"homePageh5\\",\\"appid\\":\\"50073\\"},\\"businessData\\":{\\"taskId\\":\\"2\\",\\"rnd\\":\\"${rnd}\\",\\"inviteId\\":\\"${body}\\",\\"stealId\\":\\"-1\\"},\\"secretp\\":\\"${secretp}\\"}"}&client=wh5&clientVersion=1.0.0`

    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}stall_pk_assistGroup`  ,
        headers : {
          'Origin' : `https://wbbny.m.jd.com`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Accept' : `application/json, text/plain, */*`,
          'Host' : `api.m.jd.com`,
          'User-Agent' : `jdapp;iPhone;9.2.0;14.1;`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`,
          'Refer' : `https://bunearth.m.jd.com/babelDiy/Zeus/4SJUHwGdUQYgg94PFzjZZbGZRjDd/index.html?jmddToSmartEntry=login`
        },
        body : `functionId=stall_pk_assistGroup&client=wh5&clientVersion=1.0.0&body={"confirmFlag":1,"inviteId": "${inviteId}","ss":"{\\"extraData\\":{\\"is_trust\\":true,\\"sign\\":\\"${sign}\\",\\"time\\":${time},\\"encrypt\\":\\"3\\",\\"nonstr\\":\\"${nonstr}\\",\\"jj\\":\\"\\",\\"token\\":\\"dzbn7uttoxf3v6kowburzrashgxz9jpq\\",\\"cf_v\\":\\"1.0.1\\",\\"client_version\\":\\"2.1.3\\",\\"sceneid\\":\\"homePageh5\\",\\"appid\\":\\"50073\\"},\\"businessData\\":{\\"taskId\\":\\"2\\",\\"rnd\\":\\"${rnd}\\",\\"inviteId\\":\\"${inviteId}\\",\\"stealId\\":\\"-1\\"},\\"secretp\\":\\"${secretp}\\"}"}`
      }
      //console.log(url.body)
      $.post(url, async (err, resp, data) => {
        try {
          //console.log('商圈助力：' + data)
          data = JSON.parse(data);
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve()
        }
      })
    },timeout)
  })
}


//获取首页信息
function stall_getHomeData(body= "",timeout = 0) {
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}stall_getHomeData`  ,
        headers : {
          'Origin' : `https://wbbny.m.jd.com`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Accept' : `application/json, text/plain, */*`,
          'Host' : `api.m.jd.com`,
          'User-Agent' : `jdapp;iPhone;9.2.0;14.1;`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        },
        body : `functionId=stall_getHomeData&body={${body ? "\"inviteId\":\"" + body +'\"': ""}}&client=wh5&clientVersion=1.0.0`
      }
      $.post(url, async (err, resp, data) => {
        try {
          //console.log(url.body)
          //if (merge.black)  return ;
          data = JSON.parse(data);
          if (data.code === 0) {
            if (body !== "") {
              //console.log('stall_getHomeData2:' + JSON.stringify(data))
              if (data.data.result.homeMainInfo.guestInfo.status === 0) {

                let rnd = Math.round(Math.random()*1e6)
                let nonstr = randomWord(false,10)
                let time = Date.now()
                let key = minusByByte(nonstr.slice(0,5),String(time).slice(-5))
                let msg = `inviteId=${body}&rnd=${rnd}&stealId=-1&taskId=2&token=dzbn7uttoxf3v6kowburzrashgxz9jpq&time=${time}&nonce_str=${nonstr}&key=${key}&is_trust=true`
                let sign = bytesToHex(wordsToBytes(getSign(msg))).toUpperCase()
                let taskBody = `functionId=stall_collectScore&body={"taskId":2,"itemId":"${data.data.result.homeMainInfo.guestInfo.itemId}","inviteId": "${body}","ss":"{\\"extraData\\":{\\"is_trust\\":true,\\"sign\\":\\"${sign}\\",\\"time\\":${time},\\"encrypt\\":\\"3\\",\\"nonstr\\":\\"${nonstr}\\",\\"jj\\":\\"\\",\\"token\\":\\"dzbn7uttoxf3v6kowburzrashgxz9jpq\\",\\"cf_v\\":\\"1.0.1\\",\\"client_version\\":\\"2.1.3\\",\\"sceneid\\":\\"homePageh5\\",\\"appid\\":\\"50073\\"},\\"businessData\\":{\\"taskId\\":\\"2\\",\\"rnd\\":\\"${rnd}\\",\\"inviteId\\":\\"${body}\\",\\"stealId\\":\\"-1\\"},\\"secretp\\":\\"${secretp}\\"}"}&client=wh5&clientVersion=1.0.0`
                //console.log(taskBody)
                //let taskBody = `functionId=stall_collectScore&body={"taskId":2,"itemId":"${data.data.result.homeMainInfo.guestInfo.itemId}","inviteId": "${body}","ss":"{\\"secretp\\":\\"${secretp}\\"}"}&client=wh5&clientVersion=1.0.0`
                //console.log(taskBody)
                //console.log('开始助力：')
                await stall_collectScore(taskBody, 1000)
              }
              return
            }
            //console.log('stall_getHomeData:' + JSON.stringify(data))
            secretp = data.data.result.homeMainInfo.secretp
            await stall_collectProduceScore();
            await stall_pk_assistGroup()
            if (data.data.result.homeMainInfo.raiseInfo.buttonStatus === 2 ) await stall_raise(1000)
            await stall_getHomeData('Vl4ISNZnRyNVJf028W76ZuyTXfbtGlbVhbQEF3XxyFux9uadYgA0uao');
            await stall_getTaskDetail("","app")
            await stall_getTaskDetail()
          } else {
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


//助力
function collectFriendRecordColor(timeout = 0) {
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}collectFriendRecordColor`  ,
        headers : {
          'Origin' : `https://wbbny.m.jd.com`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Accept' : `application/json, text/plain, */*`,
          'Host' : `api.m.jd.com`,
          'User-Agent' : `jdapp;iPhone;9.2.0;14.1;`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        },
        body : `functionId=collectFriendRecordColor&body={"mpin":"RnFgwWRbPDGKy9RP--twXV_3bZt2p2ZADl2v","businessCode":"20118","assistType":"1"}&client=wh5&clientVersion=1.0.0`
      }
      $.post(url, async (err, resp, data) => {
        try {
          console.log(data)
          //data = JSON.parse(data);
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve()
        }
      })
    },timeout)
  })
}

function getEncryptedPinColor(timeout = 0) {
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}getEncryptedPinColor`  ,
        headers : {
          'Origin' : `https://wbbny.m.jd.com`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Accept' : `application/json, text/plain, */*`,
          'Host' : `api.m.jd.com`,
          'User-Agent' : `jdapp;iPhone;9.2.0;14.1;`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        },
        body : `functionId=getEncryptedPinColor&body={}&client=wh5&clientVersion=1.0.0`
      }
      $.post(url, async (err, resp, data) => {
        try {
          data = JSON.parse(data);
          console.log('助力码:'+ data.result)
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve()
        }
      })
    },timeout)
  })
}

function stall_raise(timeout = 0) {
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}stall_raise`  ,
        headers : {
          'Origin' : `https://wbbny.m.jd.com`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Accept' : `application/json, text/plain, */*`,
          'Host' : `api.m.jd.com`,
          'User-Agent' : `jdapp;iPhone;9.2.0;14.1;`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        },
        body : `functionId=stall_raise&body={}&client=wh5&clientVersion=1.0.0`
      }
      $.post(url, async (err, resp, data) => {
        try {
          //console.log(data)
          data = JSON.parse(data);
          console.log('解锁结果：'+ data.data.bizMsg)
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve()
        }
      })
    },timeout)
  })
}

function qryCompositeMaterials(timeout = 0) {
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}qryCompositeMaterials`  ,
        headers : {
          'Origin' : `https://wbbny.m.jd.com`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Accept' : `application/json, text/plain, */*`,
          'Host' : `api.m.jd.com`,
          'User-Agent' : `jdapp;iPhone;9.2.0;14.1;`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        },
        body : `functionId=qryCompositeMaterials&client=wh5&clientVersion=1.0.0&body={"qryParam":"[{\\"type\\":\\"advertGroup\\",\\"mapTo\\":\\"homeFeedBanner\\",\\"id\\":\\"04891279\\"},{\\"type\\":\\"advertGroup\\",\\"mapTo\\":\\"homeBottomBanner\\",\\"id\\":\\"04888981\\"}]","activityId":"4SJUHwGdUQYgg94PFzjZZbGZRjDd","pageId":"","reqSrc":"","applyKey":"raiders_venue_lite"}`
      }
      $.post(url, async (err, resp, data) => {
        try {
          //console.log(data)
          data = JSON.parse(data);
          for (let i in data.data.homeBottomBanner.list) {
            if (merge.end) break;
            console.log('\n开始逛'+data.data.homeBottomBanner.list[i].name)
            await stall_shopSignInRead(data.data.homeBottomBanner.list[i].link)
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

function stall_pk_getHomeData(body = "",timeout = 0) {
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}stall_pk_getHomeData`  ,
        headers : {
          'Origin' : `https://wbbny.m.jd.com`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Accept' : `application/json, text/plain, */*`,
          'Host' : `api.m.jd.com`,
          'User-Agent' : `jdapp;iPhone;9.2.0;14.1;`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        },
        body : `functionId=stall_pk_getHomeData&body={}&client=wh5&clientVersion=1.0.0`
      }
      $.post(url, async (err, resp, data) => {
        try {
          if (body !== "") {
            await stall_pk_assistGroup();
          } else {
            data = JSON.parse(data);
            if (data.data.result.groupInfo.groupAssistInviteId.match(/XUkkFpUhDG0OdMYzp22uY_lyEaiFin/)){
              console.log('您的商圈助力码：' + data.data.result.groupInfo.groupAssistInviteId)
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

function minusByByte(t, n) {
  var e = t.length
    , r = n.length
    , o = Math.max(e, r)
    , i = toAscii(t)
    , a = toAscii(n)
    , s = ""
    , u = 0;
  for (e !== r && (i = add0(i, o),
    a = this.add0(a, o)); u < o; )
    s += Math.abs(i[u] - a[u]),
      u++;
  return s
}

function toAscii (t) {
  var n = "";
  for (var e in t) {
    var r = t[e]
      , o = /[a-zA-Z]/.test(r);
    if (t.hasOwnProperty(e))
      if (o)
        n += getLastAscii(r);
      else
        n += r
  }
  return n
}
function add0 (t, n) {
  return (Array(n).join("0") + t).slice(-n)
}

function getLastAscii(t) {
  var n = t.charCodeAt(0).toString();
  return n[n.length - 1]
}

function wordsToBytes(t) {
  for (var n = [], e = 0; e < 32 * t.length; e += 8)
    n.push(t[e >>> 5] >>> 24 - e % 32 & 255);
  return n
}

function bytesToHex(t) {
  for (var n = [], e = 0; e < t.length; e++)
    n.push((t[e] >>> 4).toString(16)),
      n.push((15 & t[e]).toString(16));
  return n.join("")
}

function stringToBytes(t) {
  t = unescape(encodeURIComponent(t))
  for (var n = [], e = 0; e < t.length; e++)
    n.push(255 & t.charCodeAt(e));
  return n
}

function bytesToWords(t) {
  for (var n = [], e = 0, r = 0; e < t.length; e++,
    r += 8)
    n[r >>> 5] |= t[e] << 24 - r % 32;
  return n
}
function getSign (t) {
  t = stringToBytes(t)
  var e = bytesToWords(t)
    , i = 8 * t.length
    , a = []
    , s = 1732584193
    , u = -271733879
    , c = -1732584194
    , f = 271733878
    , h = -1009589776;
  e[i >> 5] |= 128 << 24 - i % 32,
    e[15 + (i + 64 >>> 9 << 4)] = i;
  for (var l = 0; l < e.length; l += 16) {
    for (var p = s, g = u, v = c, d = f, y = h, m = 0; m < 80; m++) {
      if (m < 16)
        a[m] = e[l + m];
      else {
        var w = a[m - 3] ^ a[m - 8] ^ a[m - 14] ^ a[m - 16];
        a[m] = w << 1 | w >>> 31
      }
      var _ = (s << 5 | s >>> 27) + h + (a[m] >>> 0) + (m < 20 ? 1518500249 + (u & c | ~u & f) : m < 40 ? 1859775393 + (u ^ c ^ f) : m < 60 ? (u & c | u & f | c & f) - 1894007588 : (u ^ c ^ f) - 899497514);
      h = f,
        f = c,
        c = u << 30 | u >>> 2,
        u = s,
        s = _
    }
    s += p,
      u += g,
      c += v,
      f += d,
      h += y
  }
  return [s, u, c, f, h]
}
//初始化
function initial() {
  merge = {
    nickname: "",
    enabled: true,
    end: false,
    black: false
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
  console.log("\n\n京东账号："+merge.nickname + ' 任务已做完！\n如有未完成的任务，请多执行几次')
 //$.msg($.Name,"","京东账号："+merge.nickname + ' 任务已做完！\n如有未完成的任务，请多执行几次')
}

function Env(t,s){return new class{constructor(t,s){this.name=t,this.data=null,this.dataFile="box.dat",this.logs=[],this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}getScript(t){return new Promise(s=>{$.get({url:t},(t,e,i)=>s(i))})}runScript(t,s){return new Promise(e=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=s&&s.timeout?s.timeout:o;const[h,a]=i.split("@"),r={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":h,Accept:"*/*"}};$.post(r,(t,s,i)=>e(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),o=JSON.stringify(this.data);e?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(s,o):this.fs.writeFileSync(t,o)}}lodash_get(t,s,e){const i=s.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return e;return o}lodash_set(t,s,e){return Object(t)!==t?t:(Array.isArray(s)||(s=s.toString().match(/[^.[\]]+/g)||[]),s.slice(0,-1).reduce((t,e,i)=>Object(t[e])===t[e]?t[e]:t[e]=Math.abs(s[i+1])>>0==+s[i+1]?[]:{},t)[s[s.length-1]]=e,t)}getdata(t){let s=this.getval(t);if(/^@/.test(t)){const[,e,i]=/^@(.*?)\.(.*?)$/.exec(t),o=e?this.getval(e):"";if(o)try{const t=JSON.parse(o);s=t?this.lodash_get(t,i,""):s}catch(t){s=""}}return s}setdata(t,s){let e=!1;if(/^@/.test(s)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(s),h=this.getval(i),a=i?"null"===h?null:h||"{}":"{}";try{const s=JSON.parse(a);this.lodash_set(s,o,t),e=this.setval(JSON.stringify(s),i)}catch(s){const h={};this.lodash_set(h,o,t),e=this.setval(JSON.stringify(h),i)}}else e=$.setval(t,s);return e}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,s){return this.isSurge()||this.isLoon()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,s=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,s)=>{try{const e=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(e,null),s.cookieJar=this.ckjar}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)))}post(t,s=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t));else if(this.isNode()){this.initGotEnv(t);const{url:e,...i}=t;this.got.post(e,i).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t))}}time(t){let s={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in s)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?s[e]:("00"+s[e]).substr((""+s[e]).length)));return t}msg(s=t,e="",i="",o){const h=t=>!t||!this.isLoon()&&this.isSurge()?t:"string"==typeof t?this.isLoon()?t:this.isQuanX()?{"open-url":t}:void 0:"object"==typeof t&&(t["open-url"]||t["media-url"])?this.isLoon()?t["open-url"]:this.isQuanX()?t:void 0:void 0;this.isSurge()||this.isLoon()?$notification.post(s,e,i,h(o)):this.isQuanX()&&$notify(s,e,i,h(o)),this.logs.push("","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="),this.logs.push(s),e&&this.logs.push(e),i&&this.logs.push(i)}log(...t){t.length>0?this.logs=[...this.logs,...t]:console.log(this.logs.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();e?$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t={}){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,s)}
