let SPLITSTR = '&';
const Secrets = {
  COOKIE: process.env.COOKIE, //cokie,多个用&隔开即可
  REMOTE_URL: process.env.REMOTE_URL, //签到地址,方便随时变动
  CUSTOM_REPLACE : process.env.CUSTOM_REPLACE || '[]',  // 通用自定义替换 格式[{key : key1 ,value : value1},{key : key1 ,value : value2}]
  MULT_CUSTOM_REPLACE : process.env.MULT_CUSTOM_REPLACE || '[]' //多账号自定义替换  //需要和cookie相对应 //比如多账号替换助力码
};

async function replaceText(content, index) {
  const SPLITARR = ['&','@','\n'];
  for (let i = 0;i < SPLITARR.length;i ++) {
    if (Secrets.COOKIE.indexOf(SPLITARR[i]) > -1) {
      SPLITSTR = SPLITARR[i];
      break;
    }
  }

  const replacements = eval(Secrets.CUSTOM_REPLACE) ;
  //console.log(replacements)
  const replacementslist = eval(Secrets.MULT_CUSTOM_REPLACE);
  //console.log(replacementslist)
  if (replacementslist.length > 0 && replacementslist.length > index) {
    for (let i = 0; i < replacementslist[index].length; i++) {
      replacements.push(replacementslist[index][i])
    }
  }

  if (content) {
    if (!content.match(/sendNotify\.js/)) {
      replacements.push({
        key:/function Env\((\w),(\w)\)/,
        value : 'let remotenotify = require(\'./sendNotify\');\nfunction Env($1,$2)'
      })
      replacements.push({
        key: /(this\.isMute\|\|\()?this\.isSurge\(\)\|\|this\.isLoon\(\)\?\$notification\.post\((\w),(\w),(\w).*?\)(;|,)/,
        value: 'this.isMute||remotenotify.sendNotify(`${$2}\\n${$3}\\n${$4}`,``)$5'
      });
    }
    if (content.match(/jdCookie\.js/)) {
      replacements.push({key: "require('./jdCookie.js')", value: `['${Secrets.COOKIE.split(SPLITSTR)[index]}']` });
    }
  }
  return batchReplace(content, replacements);
}
function batchReplace(content, replacements) {
  for (let i = 0; i < replacements.length; i++) {
    content = content.replace(replacements[i].key, replacements[i].value);
  }
  return content;
}

module.exports = {
  replaceText,
};
