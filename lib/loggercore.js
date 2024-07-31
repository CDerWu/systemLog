const systemLog = require('./index.js');
const loggerlevel = require('./loggerlevel.js');

class LoggerCore {
    constructor() {
    	this.autoStatic = [
    		"info",
    		"debug", 
    		"error", 
    		"addContext", 
    		"removeContext"
    	];
    	this.context = {
    		system: this.getName()
    	};
    }

    info(...param){
        loggerlevel.fixLevel(this.getName());
    	this.addGlobalContext(this);
    	systemLog.realLog(this, 'info', param);
    }

    debug(...param){
        loggerlevel.fixLevel(this.getName());
    	this.addGlobalContext(this);
    	systemLog.realLog(this, 'debug', param);
    }

    error(...param){
        loggerlevel.fixLevel(this.getName());
    	this.addGlobalContext(this);
    	systemLog.realLog(this, 'error', param);
    }

    fillingContext(logger){
    	for(let key in this.context)
    	{
	    	logger.addContext(key, this.context[key])
	    }
    }

    addContext(key, val){
    	this.context[key] = val;
    }
    removeContext(key){
    	let logger = this.getLogger();
    	logger.removeContext(key);
    }

    setLoggerLevel(level){
    	systemLog.setLoggerLevel(this.getName(), level);
    }

    getLogger(){
    	return systemLog.getLogger(this.getName());
    }

    getName(){
    	return this.constructor.name;
    }

    addGlobalContext(obj) {
    	//架空 由loggershell給內容
    }
}

module.exports = LoggerCore;