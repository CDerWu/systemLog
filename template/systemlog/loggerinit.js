const systemLog = require('systemLog').init;

const logSetting = {
    appenders: {
        console: {
            type: 'console',
            level: 'debug'
        }
    }
}

class LoggerBase extends systemLog.getLoggerCore() {
    constructor() {
        super();
        //此為default設定
        this.categories = {
            //會使用到的log形式
            appenders: ['console'],
            //會顯示的最低層級
            level: 'info'
        }
    }

    info(...param) {
        //正常log
        super.info(...param);
    }

    debug(...param) {
        //偵錯專用log
        super.debug(...param);
    }

    error(...param) {
        //錯誤發生log
        super.error(...param);
    }
}

systemLog.setConfigure(logSetting, LoggerBase);

//設定自動讀取的起始位置
//systemLog.autoLoadBySystem(`${process.cwd()}/script/${SERVER_TYPE}/system`);
systemLog.autoLoadByFolder(`${process.cwd()}/systemlog/logger`);

systemLog.initStart();

//-----確認服務關閉時機點應呼叫-----
//systemLog.systemLogShutDown();
//--------------------------------