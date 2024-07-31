const fs = require('fs');
const log4js = require("log4js");
const common = require('./common.js');

exports.init = {};

class fakeCollecter {
    get() { }
    getdynamic() { }
    collect() { }
}

const config = common.tryRequire(new fakeCollecter(), 'config_collect');
config.collect();

let logSetting = {};
let logClassStore = {};

let fixedcategories = function (categories) {
    let target = null;
    for (let idx in categories.appenders) {
        if (categories.appenders[idx] === 'logstash') {
            target = idx;
        }
    }
    if (target !== null) {
        categories.appenders.splice(target, 1);
    }
}

let defaultLoggerClass = class { };

exports.init.setConfigure = function (info, defaultClass) {
    logSetting = info;

    // let logstash = logSetting.appenders.logstash
    // if (logstash) {
    //     for (let key in logstash) {
    //         try {
    //             logstash[key] = config.get(`systemlog.logstash.${key}`) || logstash[key];
    //         } catch (e) { }
    //     }
    // }

    if (logSetting.appenders.logstash) {
        delete logSetting.appenders.logstash;
    }

    defaultLoggerClass = defaultClass;

    logSetting.categories = {};
    let defaultObj = new defaultClass();
    fixedcategories(defaultObj.categories);
    logSetting.categories.default = defaultObj.categories;
};

exports.init.getLoggerCore = function () {
    return require('./loggercore.js');
};

exports.init.autoLoadBySystem = function (path) {
    if (!fs.existsSync(path)) {
        throw `require ${path} error!!`;
        return null;
    }

    let files = fs.readdirSync(path);

    files.forEach(function (filename) {
        if (filename.lastIndexOf('.') !== -1) {
            //不是資料夾 跳過
            return;
        }
        let systemfiles = fs.readdirSync(`${path}/${filename}`);
        systemfiles.forEach(function (systemFileName) {
            if (systemFileName !== "systemlog.js") {
                //不是目標檔案 跳過
                return;
            }
            let logClass = require(`${path}/${filename}/systemlog.js`);
            registerSystem(logClass);
        });
    });
};

exports.init.autoLoadByFolder = function (path) {
    if (!fs.existsSync(path)) {
        return null;
    }

    let files = fs.readdirSync(path);

    files.forEach(function (filename) {
        if (filename.lastIndexOf('.') == -1) {
            //跳過
            return;
        }
        let logClass = require(`${path}/${filename}`);
        registerSystem(logClass);
    });
};


exports.init.initStart = function () {
    log4js.configure(logSetting);
};

exports.getBase = function () {
    return defaultLoggerClass;
};

exports.getLogger = function (systemName) {
    return log4js.getLogger(systemName);
};

exports.realLog = function (obj, level, param) {
    let logger = obj.getLogger();
    obj.fillingContext(logger);
    logger[level].apply(logger, param);
    logger.clearContext();
};

exports.getLoggerShell = function () {
    let LoggerShell = require('./loggershell.js');
    let loggerShell = new LoggerShell(logClassStore);

    //Auto Static
    let list = loggerShell.getAllLoggerClass();
    for (let loggerName in list) {
        let loggerClass = list[loggerName];
        for (let funcName in loggerClass) {
            loggerClass[funcName] = function (...param) {
                //呼叫到這的時候已經備齊所有資料
                let logger = loggerShell.getAutoLogger(loggerName);
                logger[funcName].apply(logger, param);
            }
        }
    }
    //-----------

    return loggerShell;
};

exports.setLevel = function (systemName, level) {
    let logger = exports.getLogger(systemName);
    logger.level = level;
};

exports.getObj = function (objName) {
    let LoggerShell = require('./loggershell.js');
    let loggerShell = new LoggerShell(logClassStore);
    return loggerShell.getLogger(objName);
};

let registerSystem = function (logClass) {
    try {
        let logObj = new logClass();
        let objName = logObj.getName();
        fixedcategories(logObj.categories);
        logSetting.categories[objName] = logObj.categories;

        //Auto Static 只建立方法 不實作內容
        let staticList = logObj.autoStatic;
        for (let idx in staticList) {
            let funcName = staticList[idx];
            logClass[funcName] = function (...param) {
            }
        }
        //-----------

        logClassStore[objName] = logClass;
    } catch (err) {
        if (err) {
            return;
        }
    }
};

exports.init.systemLogShutDown = async function () {
    let todo = function () {
        return new Promise((resolve, reject) => {
            log4js.shutdown(function () {
                resolve();
            });
        });
    }
    await todo();
};