/*
京东星店长
更新时间：2020-11-04 08:27
脚本说明：
第一次执行会循环 8--86号店铺，时间比较长，后面会判断，做完86的不再全部做，每天运行一次即可
使用前请先看下活动介绍，可能会关注店铺，入会是假入会，入会任务可能不会完成
此脚本仅做任务，需要拉人头才能参与瓜分，请按需使用
活动进入方式：京东app搜索【星店长】
5 9 * * * https://raw.githubusercontent.com/yangtingxiao/QuantumultX/master/scripts/jd/jd_starStore.js, tag=京东星店长, img-url=https://raw.githubusercontent.com/yangtingxiao/QuantumultX/master/image/jd.png, enabled=true

*/
const $ = new Env('京东星店长');
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
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
const JD_API_HOST = `https://api.m.jd.com/client.action?functionId=`;
!(async () => {
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
      if (Date.now() > Date.parse('2020-11-12')){
        $.msg($.Name,"","活动已结束，请删除或禁用脚本！");
        return
      }
      let shopId = 0;
      let now = new Date();
      //await mcxhd_starmall_taskList(86); //做最后一个，看是否做完
      //if (!merge.end) {
      for (shopId = 8; shopId <87 ; shopId ++ ) {
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
        url : `${JD_API_HOST}mcxhd_starmall_taskList&appid=jd_mp_h5&body=%7B%22shopId%22:%22${shopId}%22,%22token%22:%22jd6df03bd53f0f292f%22%7D&loginType=2`,
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
          data = JSON.parse(data);
          if (data.retCode !== "200") {
            console.log(data.retMessage)
            return
          }
          console.log('\n星店长:'+data.result.starName)
          for (let i in data.result.tasks) {
            if (merge.end) return ;
            //if (data.result.tasks[i].taskType !== "7"){
             // continue
            //} else {
            //  console.log(data.result.tasks[i].subItem[0].itemId)
            //  return
            //}
            if (data.result.tasks[i].taskType !== "7") console.log('\n开始做任务：' + data.result.tasks[i].taskName)
            if (data.result.tasks[i].status === 0 ) {
              for (let j in data.result.tasks[i].subItem) {
                await mcxhd_starmall_doTask(shopId,data.result.tasks[i].taskType,data.result.tasks[i].subItem[j].itemId)
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
function mcxhd_starmall_doTask(shopId,taskType,itemId,timeout = 0){
  return new Promise((resolve) => {
    setTimeout( ()=>{
      if (taskType === "7") itemId = shareCode[shopId];// '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWf8zYv7WVIxFMVj1lV2pKDjARLLbNU_JV-gpnPfE9HW-02KqFUKGtvxAhB0qpzIrZwdSu-yZTRWQMbBwd4k2XPmFHDqa';
      let url = {
        url : `${JD_API_HOST}mcxhd_starmall_doTask&appid=jd_mp_h5&body=%7B%22itemId%22:%22${itemId}%22,%22taskType%22:%22${taskType}%22,%22shopId%22:%22${shopId}%22,%22token%22:%22jd6df03bd53f0f292f%22%7D&loginType=2`,
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
          if (taskType !== "7") console.log(data.retMessage)
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve()
        }
      })
    },timeout)
  })
}

var shareCode = [
  '',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfwzfupaUAaCzThSWkJH-rWzkE1CiSqcKjixdbItXLI36wd2PRn53FF3Qd83QaH-eksFJaOtrv6OeY7ZPZxBlToRqbNRrw',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWf8zYv7WVIxFMVj1lV2pKDjARLLbNU_JV-gpnPfE9HW-02KqFUKGtvxAhB0qpzIrZwdSu-yZTRWQMbBwd4k2XPmFHDqa',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWf4zzIuAP9ftTzuEao3sXWuGLLpFCZ5icB_-WvBMpD6Go5-HLIIV5iGRwTgj8stXlkisI8N_5JhwQsD7GQ4LGsgvJ_Wruw',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfkzagijopM6HP9i8jM8Hvo2CfFhtPmUIBcG2gmTDdvOg_bCvQS9LROdHNxp2CaqYwdqkm5goAePm-yVeRUMoYj_dRnugg',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfgzSEllgoZFO2Qm8oFmt0Q4mow9dCzWpinng8olsX7EMifKAGeDMVk7_oaIVQPCbC9-VtlD_hzdK811DMzScm33McGt',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfszf6XfbSkVmvZ41eDovmsK1hM-13auIalW_2Mj5eLGaScrZA_euWAVL3G95wbuAV8viZaEFCcUPGUmCwe5VZd-mTzilw',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfoza8K0IpL9mvWLveI1os5oJp2dTVcxqcNGK_we7REPVSOQHIRX47scO74cIkYQOB6T_S6RhuILYyMUbS4BPjRvYbO06g',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfUzFOD-4F8YdcGyLhJdtLVbkV1zpvhNUdZVO_auO4PKrbCS3XQffPgTvdVQpelJiK3roby2J2TZV9EBDwmkaotEL7jQSQ',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfQzcjir8SeH7RnnwOFgXTwfTeoyrdK7ZaR-SBmLf3RsY--v7DpVA7H5rjSgRFZCgbfm-Z0M6nvxkVmWAzsU3B97Gcw7iA',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfwhwhxjv9goOzjcVIHpVqBrcgAu1QDzjWRmis99vVsRXHAfdITKHZWgSKYP4rTiNmILf3hhGBKRt3nwWYelfcfx3tByzQ',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfwg1GkpMYts8kEYMM2UgyMYF8s7hGmA3s9SGNYAns7xhs_og6O6QR7O-JtMWGMcG1iEPf-H9L85wein_wFn1mVM-sCA0V8',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfwj5lnjD6wrhVGo0oN2nUU-aYNeqA-PDItHq9HQhFppDm8vvcs622gpz-0BVf5ftyaVigNkqZLf2veMaRgeGcEUXv7h8N0',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfwiej9xjZP0LbnLloPCge1bsVtIH7k2tYk4mUw-ntWz2Cn46Iy1E4tOhSOL-Dyx-tfnhAPyy2adQ8Jln8-NlLp6iToiNTw',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfwlOWoIwiLSKbuDSbp6V-f6tZd5dZ7pHcl1Rmw5UYW8ugOuFtG1obW1eMGitMUo87QRUbPSKilOxYXXGTKDYSU-PU4KTg',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfwkEyo_2Xqhtn8UM5huWU49Yu2ogT4bguZxlaguPeK5l2Qj88DZeTmPUVVHY0zW4ov2geKLvKHqO4wHoOFL7Oa1ruI59TQ',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfwniukeK0jGMdPRHf7_w5TEv4yKLIq5ifuYOHX9Nv2wVUkOp2OnXrhrMdIuFpPuqY_wUgIgXbV7J1mOnQpHr2dd4SYldQ',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfwmXvcUbGY9LbbkDifMWqHOdmpi9ks5VS1KiGauQZjnyuGH8S-1_GTd5IKrecfzbAE24D0QtfSGw8XVQDZv8alrDZ1iFA',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfwpBn9H4cZ55ZHQXbHyK64A6XkWjfzxsJNIl7_cgBfmqDGnnQRs2FNDxi-gJ1m-LoBHAYDuaW47H_ON8aBYJDEZohEiLGY',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfwoDFjEn_bARCtQnOAU-aQtTTdvLHbUeMcdncaUPqMVCCzAJekDdSDcoFvRdYfLvbGKvnqNfRT1Ra1EjKoNqVzxurhcCw',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWf8hYAlTUnHWn0lIqm0wmbkyMT_ZiCBePGEwwqUOUokFoSk1PMMwmYHmkd_cq_0uWHy0tEwLkCwBSBRrqTaDDSp80h2aEKo',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWf8g-ERlkoyFzDfwGNc4ujzFPPpVPDav6KLvNJToaZyngBY1gX8i3LpYkFYTG7UsC0HsdBeHmy_xvECm84qlXHwIoGBV2rk',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWf8jg4H-3mtslFtHHj5odslZizbzquoy0KJPp_ZcaPJfmEWGakJGkXr0xuLh-5pzESdP7DZDDPuyx7TOk-Vr-GdD9d4MzQ',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWf8iaLgHXA9kP1Gab0-LjixH1XbYRSyvDh8U_Bz0U2Tjc5JpjuM3Zrub4EcS-nFbaObQiOKOCHIKZuBn1Q91hLblDfQtYx0',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWf8luvOmnSUBSuwwQV_84Z8bcEt3CRzSTz2RQS016aI8wuaCzgjpnxUxCOtD8lGIGSQfkERRzxW1T2t2qSaOjb4aPEJ-Jx0',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWf8kbKT3QJERdmecdKDkHSoMoXSniWOQsn-QIAxV6DdMFtaCVtSkaN8ZAbAYsq4ASWNiBuNGGR8kD2cmoSvmIdKnuhztNw',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWf8nNTbJHovvbC-2gPbI5KOgt2zghQehOj9cRCiG4vCC7JoRTNqmIkjSLhRbbI-UhQQ4qV6VoZuc2opMo3DqGmVV5buJycQ',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWf8mQGt4VfZKRvRhI5ILdBLkxXar2g51KytOYsbHkHdExbreOWA54eVdlkiPEoaJJMG8LUBZ7iZ8-E5INsHrdA1ZG7deRh4',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWf8pLXJYHI-a8nHXvxfeGZ4Wx9xbU7BcN19iGczuIIrUqFOS38wC2KeBH1oChm-JIH0EhtlEmUnqzhVLRE-K4mMLWQh72w',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWf8okmHdcCdskP7LmeBLQiN9reOaSydRb1rl1SrM8gMHJTci93Pjvcls9dqlWalYLm8sBFzieqAVD6nCyBB2G2sPu-PiUmg',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWf4hOcHPA4zCjLnErqe9LD5c8E8gRs4rBf4KkPYCbKVvgF68nefvxa0BS5SFumwHJsT8wW6RdTd867QCewf4Udlp7-ygiA',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWf4gv7ktxxXawJyq73ZXSDDO3K3W4XdaPCHnm9Fhi2bH9kAj7wOd_FPpHhoLc9oEHW6JHBVkC15igau8ppEDn6b9PADFmgo',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWf4jSN_mDWvfNa5RrLTavB-U9YOF-6G0HyZa5RXdQ-QrNmVT9Oo0_SjPOtDWAeBC2hYdlAx-QmhHAXS4yB-3YEGDRJiwf54',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWf4i59rZPbyugO3dSl_y3r71j5kre0TVzA8Mn_ejcxaF9nszVzBmMcWNFJCv4qR9j9C6y-m4EOA27TJE6lIse8pIqPtiGzM',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWf4le55QaxXu2zOLDO53A0S5tDUVyoQjqihzMn43fMRajKaMeobc3_lYTJNWRbuufGpzZjbSJqODeeJSIOTkSm-NhFMnsL4',
  '活动不存在或已结束，试试其他活动吧~',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWf4nVvBWxlihhrqqtJhrVGMzep75ykmRsh0RYafgHWA1DJhDcZn12n6L-82KG5NFY3gD7UI5IxliqAoKSj6vhJy7FAtSwA',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWf4mLJGS2hwyI05jqfoxqpX_fLOBWLhLJedkAZCNWZe_N7n5xIm5_K17KyNSTK2B5Xd-xVXC-vktUvxHJt8QbYDVcRL4OIY',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWf4pljzS2kzg32QlbdWIhIm4DcTeqsZ46Xehmm3-X5Nk5ZkAwXgLXY98IGZYKVqBmnqetu8iXtOcWKeA3BUeuyjwk2_TiKc',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWf4oEBZPcxERcmVGNMEUXy8y6E-cqbbfnR63aUrz5H7Yo6vc8L1E0SyHbI3d6N4b2CrQ_cLS8Voux-npXu8WbABWYfrUmQ',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfkhDsSrdkcVGK3VTommsDKAvYw0l6HweWIWVOjHViJGyWGC38WVh963S5Ud1PAt4EQlV1MmI7jNTdQ5sk1iG8ZomoiZazQ',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfkgy97snot-BF6Y0n9yUo6v0AN7ylo5Jbe0cB5T8A0783IPCGqMCm3yn-rOL395ebEQaM-nw6Da5Ap3Ias-VLHpIxeB8NE',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfkjXCW2KTTC26wxgkilM-7gp6oP-EceBlbS7SH5xeHFkR4RmW3VotHe-F9kJFDZRbdGIPd5ATI38KQ6QHShR1zFb0Q3CQU',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfkiBmW2WsEkjXxdxhQfNXDc8wfa-p9jwesxxnCOZZ0jBWF1gW5VespnUODpkyKDhz3g2LeKhup9EEdyp0kHoNe-Tm3bDyk',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfklnO45rRYZjmyo0tMWIEQIt2PjL0cEZWiUop4NmuzSvoMvQwamflWB2nR0HUzAq7JBA_lCgRGgpO7f-OSSu4y_bkZXZA',
  '活动不存在或已结束，试试其他活动吧~',
  '活动不存在或已结束，试试其他活动吧~',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfkmCjT4RXQOEO1JuKHUbhTy4jTDchNxUn5-n5HNHX6Mqptvx2i8lOe_cfYziWW_KbwN5iZfGd0mEiOM2qrPkWFayz-VMaw',
  '活动不存在或已结束，试试其他活动吧~',
  '活动不存在或已结束，试试其他活动吧~',
  '活动不存在或已结束，试试其他活动吧~',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfggMxZjZNCAb9v9v2mWjs7bl2RxHBJWrCEV4xjJ9NBSese836v2mfKFfc2tv9SrjmhycjvhTqXR3CBmCrWEVbw_fljmrQ',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfgj6GYEtRUHqfbhnsvLlCTSV-jTYvQR_t8SCOOABo2vxzkDDCaRXDDv2MUrOps5NumniB5MDKkoU5BVCxEikisRgsnPYd0',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfgitlDQvhA0gqfgXU0UfYkrTuOXJnst9JYdbW5yHLe41n6RtD_pMMp2zc1SBIloFjmNFaeaUP1clWcOGqtV4wbLTeGLAKY',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfgl0vbXXC9JdSAWkC-vVrO9vmU82R3qkl1oBmb9pNdjxgiDaklmSNZzhKSfieRcJ-Mn8y0o01XmiLQ6lWg7Tj-RdDyrig',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfgkvQ0bu6XWOuaKd5H28f-yXxgdhMmK5RyAW9TzjtIskHb4QHYhqNATons0UdM3YjqizMaOKb5o373TDItVq5gvTG8fat0',
  '活动不存在或已结束，试试其他活动吧~',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfgmVp8WCv8r_aeQECSQZLMnp4ZxgGpbkZazZQETws2UMPvcMJeYaXH6SBG3ax6bwcmDW73vzOd9Qqcea625puk_oTdAln8',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfgpHAaEY1G-5u_B-Hh6N0ua6psMP8lmBLSikCLnYmc5RONZxeHqyruE7TPlV44cwrCYYlS2lakReHT9HZqJ9EZyRhBBN_w',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfgozwf1YShpYwumLKrL2ds-Ag81fYt_1cAv52t7qDr42NdQFFaopeqjh6VRtU_aiNImgvJJ32UbedSst8YDL5JSEQ8Jl0Q',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfshzgVN_NDaq8FF1xcXks1Of81nzViBaivBA1KiwyeHh_cXdtE9jJbEpTStq8KmaT9B-LjEJNlR-7sBpUDHhZww7B6iCXM',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfsgP4D0AfC15vH5HIIregOPLqDnr78boGgwDTgIynX7z-CPYc0V5w4G8zRgtIABHbj872nCBjsjr-wsWv1uUZCRMrBs-zk',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfsj0X_ymCa6ASuH9tD9XzpcnvT70DQJ2uYV9vnfYD0eGFFvspksrWau9vCgvsqtg6MUpdoylM6iP27zWfi1Viout7gBv1Y',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfsi-uUhG9sLfW9OhsLAFSwzLYKUWYRV6EzyrqbaOQqgc4gavlWUThHlBPJXBXYgV6Cq318pd01uwwnTdHCmuyePmFGp7w',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfslOA7UpZCFo6gy9F9tsvVD5GIjYRFPS4p9DUzpnlipH-R6Ov_GrQ7t1aUcr7aguuCVti_gXDboLJBrZkCDp_Ck1-zL04w',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfskmMFFOF1YzpVZ-2NGA0v5nDJ5DFdEf24JLCi9vi2RLagqxaIeOEf_cQdqCNyZI3EwfsStEvLuC8wd-bZWpWYDy6Fscr0',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfsnd9UbKcTL-Uh4IvNj847UoVCCAysL3HRqrIqbgYVVuS0A1K9x3IZOfvtLSnjtzpGOMzzcu5XjTB4NT7BQGQx2hjOj9GQ',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfsmTZ3cgqFDSKt8YjYAgC13jJqcd-rNZDUamX1Kpf6rTaQMnben4JpS7OaO0zwwBHmnVBWBnQrciL9uUjKy0G1Rc-Ii3ec',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfspw6HcZ5vYwG8WHB2lVJz-sxaAb05U7A05tsQpb_ni_ec-_W6W2xOjWDXlKXZtUrKvg9K62yVrUpDpZgi6v4wIBP3i_A',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfso47WwFIl3VWc_YDFC-othyiQJe6toaODA3bAzRj8R-2XS40j3HI90wvW4mFtodnVkiGY7CgFcg8Ery0q-Jrm2SzUno0g',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfohrXzwpKGQht1jOwZEQRhHVi2kxj_hzvgj9nEzYftgVXgYal5gjmwchuHxJVr4zOxHxfPvImrZniHDDXuJuATC1h4qQlc',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfoglaRdeBfYHV_Rqhy6V0OpX2pemE-YlxdpmRgy_3C8ZEVjwp6gyK-XfDFYmtXpJsLBE48CiflFoP2yAvXGUdlr0iZh0g',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfojhnbJMryxC2HOwz_Ek2tydOLzdQTvynbTfaR_N2vXRMfDnxQBppvnBjCW-DScTQKKUkytI6xOyqRBCk1Z4Z4eXL_owCk',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfoiYwCuF_2kpo674jSO7Qx5IpVjyd-_uJorWExZavT2jyrB8GS36erI2h9kFgYLwCInekTISNM9gykIZswvQ4SxPR9hAzw',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfolX68uJtWXPwReKCDo6vOdfwaqN-UZs9FpX4SjCVgLqmiPUR4QzIvGNyLfPm-wrNwC2fpsWyjHcFcrAiXQqzgUCZzeVUk',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfokpv63ZoN0iHyfMZo1SVajHKX2otxF4ze0mmw9ssKUorC--5bMjSHBALhA8_D9UHGKj2OOYxT37CTzCZesDz5n2FzQW5U',
  '活动不存在或已结束，试试其他活动吧~',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfomGcx4Npir_v8wdomXvxUIhXD-MeaCmqOkFaqPFcwbmTcV8FCVSBJg0gkVFrotgMRMOzJp-Gl10zmjugQGIIxalBb0HwA',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfopmj6UNaaQf1RH3-j34B_k37p3W_NWW_ll-iqiYn0HehoderoVHNUxSuwLceQWStwSWx2m27ix2Y8MkpHBQ5Lg0Jt3nQY',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfooaxiDKISznvTYePbE3lOzASLuXPP8XWysr1MAYZ0KVZ7_HKiPlCSOAmOC5Skxcti8s_5sFtRIORHkRAHrFjyTQNXpjAM',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfUhzydZiUwrQA-YYMy56oIDc_oCnNI-N6oSpCbCu2qxRcRLqp6Kp1GEmoAWDwSpq_NZxhDsqZHsHlk0_8qL_yFlMFbrYCw',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfUgZwLfqVLDdWMlTpUkB4of3IHJLvvSpytixo0m-Re4R396shpCtt8IbN3zXYy1pMMfbVZR7kPgi9BSK5ST8G_K0ZSrFZA',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfUjoOIj6OgMFLBamYLJ3HW8ad1nqLoj1D6NmlFnkGuyAzY5HsOFhsraGonP2B1Tx2nuJPZuJAwapb43a0WxRkKA3HSsXA',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfUiRpJ9C08JwP3F2pMpRSWrVmOFj-6wM3wvABiP3AxpYGI1tjr4XIYZkFeMeUstUeifdvNES7Sgx1XXsIVxcD8dlJ8FfqQ',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfUlnpdQctIkBIPCE-KoLw6aLglNbHq1qUUBhiT_2BfEFqX0sCJOpxd2ucp_E6syRQ9mW8pSKuTNo7kInnVSO28uaC_LluE',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfUkmXh_RTbFx8L_BcJVAtEU78aNcj1OdAsxsTxnDn5jpw72bkx064VI86qV0HpdCbeDo4qPptTDz1m5Ydxb7cxzmeZyWM4',
  '9HId9Z2m6CsyDV00EzbubGvFewAM3GwBiqLEr9J70c7yglxRrYXbB76sxU8dWfUnHohneTsnYM52nK570112qiiBTQKwEI-OLwFtqDgI2tM5zXpA_1AZDrYeFv4AczU53pMEPZBTWHeQMKWOqCrOrfM-AA'
]


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
  let url ={ "open-url" : `openjd://virtual?params=%7B%20%22category%22:%20%22jump%22,%20%22des%22:%20%22m%22,%20%22url%22:%20%22https://h5.m.jd.com/babelDiy/Zeus/4DEZi5iUgrNLD9EWknrGZhCjNv7V/index.html%22%20%7D`}
  $.msg($.name, "", message, url);
}


function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r)));let h=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];h.push(e),s&&h.push(s),i&&h.push(i),console.log(h.join("\n")),this.logs=this.logs.concat(h)}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}