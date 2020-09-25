![Anurag’s github stats](https://github-readme-stats.vercel.app/api?username=yangtingxiao&show_icons=true&icon_color=CE1D2D&text_color=718096&bg_color=ffffff&hide_title=true)
# QuantumultX
脚本，自用

## 关于Actions自动化执行

受到([@sazs34](https://github.com/sazs34/MyActions))使用的smartReplace.js启发，重写了smartReplace.js，
可以在env中使用CUSTOM_REPLACE和MULT_CUSTOM_REPLACE自定义进行替换操作。

**CUSTOM_REPLACE示例**

替换是否需要通知 CUSTOM_REPLACE: '[{key : /let jdNotify.+/,value : "let jdNotify = true"}]'

替换是否需要通知,同时替换蓝币换京豆数量CUSTOM_REPLACE: '[{key : /let jdNotify.+/,value : "let jdNotify = true"},{key : /const coinToBeans.+/,value : "const coinToBeans = 20"}]'
以此类推，可以同时增加多个替换操作

**MULT_CUSTOM_REPLACE示例**

为解决多账户多助力码问题，使用MULT_CUSTOM_REPLACE来进行替换，顺序同cookies顺序保持一致

替换助力码 MULT_CUSTOM_REPLACE: '[[{key : /const jdFruitShareCodes.+/,value : "const jdFruitShareCodes = [`e3ff185ff53643308ab2b1a6afb3533e`,`323dbdbbfc824faa81b8927cd95bf975`,`732c806d465d427aab0c948e2ef8de17`,`5fe4179a7903433b898e6849409ad885`] "}],[{key : /const jdFruitShareCodes.+/,value : "const jdFruitShareCodes = [`967a8e63fa2148208c1385ed34641ede`,`b8359db44d244b1f8c36e399926eb5d5`,`6d7041df49b14747b7ea240efcbe3b59`,`7b6a724115984e968ec962bf333c0d3b`]"}],[{key : /const jdFruitShareCodes.+/,value : "const jdFruitShareCodes = [`b4f36c1c632746a8bcc3899a11cc19f6`,`11705719f6e34c6a95913acc5d23d640`]"}]]'

注意替换时需要注意引号问题，注意转义，确保替换正确。

通知模块使用了([@lxk0301](https://github.com/lxk0301/scripts))的sendNotify.js

优点：

1、替换灵活，仅需要掌握少量知识，基本上无脑替换即可，即可实现自己想要的效果

2、使用 ([@chavyleung](https://github.com/chavyleung))Env开发的脚本，smartReplace中自动替换notify模块，实现可以自动调用sendNotify来实现推送通知到手机上


### Thanks to(排名不分先后)：
* [@NobyDa](https://github.com/NobyDa)

* [@chavyleung](https://github.com/chavyleung)

* [@lxk0301](https://github.com/lxk0301/scripts)

* [@sazs34](https://github.com/sazs34/MyActions)
