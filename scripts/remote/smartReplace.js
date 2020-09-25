
const Secrets = {
  JD_COOKIE: process.env.JD_COOKIE, //cokie,多个用&隔开即可
  REMOTE_URL: process.env.REMOTE_URL, //签到地址,方便随时变动
  CUSTOM_REPLACE : eval(process.env.CUSTOM_REPLACE)  // 自定义替换 格式[{key : key1 ,value : value1},{key : key1 ,value : value2}]
};

async function replaceText(content, index) {
  const replacements = Secrets.CUSTOM_REPLACE || [];
  if (content) {
    if (Secrets.REMOTE_URL.match(/JD_DailyBonus/)) {              //京东多合一签到
      replacements.push({key : /var Name.+/, value : 'var Name = "【签到帐号】:  " + DName +"\\n"'});
      replacements.push({key : '!$nobyda.isNode', value :'$nobyda.isNode'});
      replacements.push({key : /if \(isNode\) (console.log\(.+?\))/, value : 'if (isNode) {\nlet remotenotify = require(\'./sendNotify\');\n remotenotify.sendNotify(`${title}\\n${subtitle}\\n${message}`,``)\n}'});
      replacements.push({key : /(var Key = )'.*?'/, value : `$1'${(Secrets.JD_COOKIE.split('&')[index])}'`});
    } else {
      if (!content.match(/sendNotify\.js/)) {
        replacements.push({
          key: /(this\.isMute\|\|\()?this\.isSurge\(\)\|\|this\.isLoon\(\)\?\$notification\.post\((\w),(\w),(\w).*?\)(;|,)/,
          value: 'let remotenotify = require(\'./sendNotify\');remotenotify.sendNotify(`${$2}\\n${$3}\\n${$4}`,``)$5'
        });
      }
      if (content.match(/jdCookie\.js/)) {
        replacements.push({ key: "require('./jdCookie.js')", value: `['${Secrets.JD_COOKIE.split("&")[index]}']` });
      }
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
