const common = require('./common.js');

class fakeCollecter {
	get () {}
	getdynamic () {}
    collect() { }
}

const config = common.tryRequire(new fakeCollecter(),'config_collect');
config.collect();

exports.fixLevel = function (logger) {
	let loggerName = logger;
	if (typeof logger !== "string") {
		loggerName = logger.getName();
	}

	let level = "";
	try {
		level = config.getdynamic(`systemlog.${loggerName}`);
    } catch (e) {}

	if (level) {
		setLoggerLevel(loggerName, level);
	}
};