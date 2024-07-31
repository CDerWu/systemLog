#
# 複製模板
copy template
```
.\node_modules\systemLog\copytemplate.bat
```

# 前言
這本模組是將log4js包裝起來 並提供各種便捷的用法及設定方式
為了達到這樣的目的 需要在專案內做一次性(**非常繁瑣**)的規劃設定

目前本模組規劃三個層級的log方式 分別是
 - error
 - info
 - debug

其中error層級最高必定會印出 debug層級最低沒有開啟不會印出

# 基礎設定
在模板中 有個loggerinit.js檔案 基礎設定大概都在這了
請找一個適合地方require他
### 1.appenders
需要設定一些輸出相關的東西
詳情請參考log4js
```
https://log4js-node.github.io/log4js-node/appenders.html
```
**請不要直接設定categories**
categories會由各系統的logger物件設定

基本上模板裡都已經設定完成 需要注意的就是appenders.logChannel **請改成自己的server name**

### 2.設定各系統LoggerObj
這邊提供兩種讀入方式 基本上都是自動的
 - 方法一
```
systemLog.autoLoadBySystem(`${process.cwd()}/script/${SERVER_TYPE}/system`);
```
這種方式是 在**system內的資料夾中**存在**systemlog.js**
系統會自動讀入

 - 方法二
```
systemLog.autoLoadByFolder(`${process.cwd()}/systemlog`);
```
可以設定一個資料夾 **資料夾內的所有檔案**都會被自動讀入
範例上的資料夾將會跟著模板複製一並被複製出來
 - 注意
logger物件必須繼承**LogObj.LoggerBase**
並將整個class從js檔案傳出
如下所示
```
class ServerLog extends LogObj.LoggerBase{
    constructor() {
        super();
    }
}
module.exports = ServerLog;
```

---
**麻煩一次而已 應該還算划算吧**

---


# 建議用法

取得logger大概會長得像這樣
```
const serverLog = require('systemLog').getLogger("ServerLog");
```

之後的系統用法就會是這樣
```
exports.something = function (req, res, next) {
    serverLog.info("這個是要寫出去的log內容");
};
```

# 細項

### loggerShell

從ctx中取得logger

 - 建立一個中介軟體攔截ctx
 - 從本模組中取出loggerShell
 - 從loggerShell中取出loggerlist
 - 把loggerShell和loggerlist一起塞入req

大概會長得像這樣
```
function (ctx, next) {
    const systemLog = require('systemLog');
    let loggerShell = systemLog.getLoggerShell();
    let loggerList = loggerShell.getAllLoggerClass();
    for (let name in loggerList) {
        ctx[name] = loggerList[name];
    }
    ctx.loggerShell = loggerShell;
    next();
}
```

之後的系統用法就會是這樣
```
exports.something = function (ctx, next) {
    //假設有個logger叫system_A
    ctx.system_A.info("這個是要寫出去的log內容");
};
```

### addContext

這是log4js原生加入額外內容的方法
本模組也有保留 並強化了功能
取得loggerShell
```
    //如果你這麼做...
    loggerShell.addContext("keyA", 123);
    //那麼接下來所有的logger都會額外添加這個Context

    //你也可以選擇自己額外添加
    ctx.system_A.addContext("keyB", "OOXXOO");
    ctx.system_A.info("那這個log就會有keyA和keyB的Context了");
```

### setLoggerLevel

本模組提供可以動態變更logger物件會印出的最低等級log
```
    //假設ServerLog預設可印出的最低層級是error(表示info印不出來)
    let logger = getLoggerObj("ServerLog");
    logger.info("這條log就不會被印出來");
    
    setLoggerLevel("ServerLog", "debug"); //變更層級的方法
    
    logger.info("在變更層級之後 這條log就會被印出來");
```
