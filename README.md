![Anurag’s github stats](https://github-readme-stats.vercel.app/api?username=yangtingxiao&show_icons=true&icon_color=CE1D2D&text_color=718096&bg_color=ffffff&hide_title=true)
# QuantumultX
脚本，自用，仅限于学习和调试接口，请勿进行商业用途。所有下载、使用、复制本库所导致的后果，由使用人自行承担，如不同意，请立即停用并删除脚本，否则视为认可以上条件  

如果本项目对您有帮助，欢迎大家打赏一下以资鼓励

<div align=center><img width="250" height="250" src="https://raw.githubusercontent.com/yangtingxiao/QuantumultX/master/image/thanks.jpg"/></div>

QuantumultX 订阅链接（1.0.17以上）：https://raw.githubusercontent.com/yangtingxiao/QuantumultX/master/box/yangtingxiao.gallery.json  
BoxJs 订阅链接 ： https://raw.githubusercontent.com/yangtingxiao/QuantumultX/master/box/yangtingxiao.boxjs.json

## 友情提醒
国内访问Github不顺畅的，无法访问raw的，可通过修改host解决。具体修改方式请自行百度  
添加如下地址

52.69.239.207 api.github.com  
13.114.40.48 github.com  
52.74.223.119 gist.github.com  
151.101.88.133    assets-cdn.github.com  
151.101.88.133    raw.githubusercontent.com  
151.101.88.133    gist.githubusercontent.com  
151.101.88.133    cloud.githubusercontent.com  
151.101.88.133    camo.githubusercontent.com  
151.101.88.133    avatars.githubusercontent.com  
151.101.88.133    avatars0.githubusercontent.com  
151.101.88.133    avatars1.githubusercontent.com  
151.101.88.133    avatars2.githubusercontent.com  
151.101.88.133    avatars3.githubusercontent.com  
151.101.88.133    avatars4.githubusercontent.com  
151.101.88.133    avatars5.githubusercontent.com  
151.101.88.133    avatars6.githubusercontent.com  
151.101.88.133    avatars7.githubusercontent.com  
151.101.88.133    avatars8.githubusercontent.com  

指定的为日本服务器，速度还可以，国内可以直连

## 关于智能替换（受可能被禁用的影响，不再提供自动化运行文件，请自行处理）

受到[@sazs34](https://github.com/sazs34/MyActions)使用的smartReplace.js启发，重写了smartReplace.js，
可以在env中使用CUSTOM_REPLACE和MULT_CUSTOM_REPLACE自定义进行替换操作。

**CUSTOM_REPLACE用法**

1、CUSTOM_REPLACE: '[{key : /匹配需要替换字符串正则/,value : "替换后字符串"}]'  
2、CUSTOM_REPLACE: '[{key : "替换前字符串",value : "替换后字符串"}]'

注意：如果字符串中有单引号'，请用''（两个单引号）进行转义，不要使用\\'，因为此处使用的是YAML语法而不是JS

**CUSTOM_REPLACE示例**

替换是否需要通知 CUSTOM_REPLACE: '[{key : /let jdNotify.+/,value : "let jdNotify = true"}]'

替换是否需要通知,同时替换蓝币换京豆数量CUSTOM_REPLACE: '[{key : /let jdNotify.+/,value : "let jdNotify = true"},{key : /const coinToBeans.+/,value : "const coinToBeans = 20"}]'
以此类推，可以同时增加多个替换操作

**MULT_CUSTOM_REPLACE示例**

为解决多账户多助力码问题，使用MULT_CUSTOM_REPLACE来进行替换，顺序同cookies顺序保持一致。MULT_CUSTOM_REPLACE是CUSTOM_REPLACE的集合，使用方法请参考CUSTOM_REPLACE

替换助力码 MULT_CUSTOM_REPLACE: '[[{key : /const jdFruitShareCodes.+/,value : "const jdFruitShareCodes = [''e3ff185ff53643308ab2b1a6afb3533e@323dbdbbfc824faa81b8927cd95bf975@732c806d465d427aab0c948e2ef8de17@5fe4179a7903433b898e6849409ad885''] "}],[{key : /const jdFruitShareCodes.+/,value : "const jdFruitShareCodes = [''967a8e63fa2148208c1385ed34641ede@b8359db44d244b1f8c36e399926eb5d5@6d7041df49b14747b7ea240efcbe3b59@7b6a724115984e968ec962bf333c0d3b'']"}],[{key : /const jdFruitShareCodes.+/,value : "const jdFruitShareCodes = [''b4f36c1c632746a8bcc3899a11cc19f6@11705719f6e34c6a95913acc5d23d640'']"}]]'

替换时需要注意引号问题，记得转义，确保替换正确。YAML允许字符串换行，过长的替换可以适当换行提高可读性。

通知模块使用了[@lxk0301](https://github.com/lxk0301/jd_scripts)的sendNotify.js

优点：

1、替换灵活，仅需要掌握少量知识，基本上无脑替换即可，即可实现自己想要的效果。

2、使用 [@chavyleung](https://github.com/chavyleung)Env开发的脚本，smartReplace中自动替换notify模块，实现可以自动调用sendNotify来实现推送通知到手机上。

3、使用方便，基本上维护一次，可以长期使用无需更新。想修改只需自己研究替换即可。

### Thanks to(排名不分先后)：
* [@NobyDa](https://github.com/NobyDa)

* [@chavyleung](https://github.com/chavyleung)

* [@lxk0301](https://github.com/lxk0301/jd_scripts)

* [@sazs34](https://github.com/sazs34/MyActions)
