class LoggerShell {
	constructor(classStore) {
		this.classStore = classStore;
		this.objList = {};
		this.context = {};
	}

    addContext(key, val) {
		this.context[key] = val;
    }
    
    initAllLogger(){
		for (let name in this.classStore){
			this.objList[name] = new this.classStore[name]();
			this.needGlobalContext(name);
		}
    }

    needGlobalContext(name){
		this.objList[name].addGlobalContext = this.addGlobalContext.bind(this);
    }

    getLogger(name){
    	return new this.classStore[name]();
    }

    getAutoLogger(name){
    	if (!this.objList[name])
    		this.objList[name] = this.getLogger(name);
    	
    	this.needGlobalContext(name);
    	return this.objList[name];
    }

    getAllLogger(){
    	return this.objList;
    }

    getAllLoggerClass(){
    	return this.classStore;
    }

    addGlobalContext(obj) {
    	for(let key in this.context){
    		obj.addContext(key, this.context[key]);
    	}
    }
}

module.exports = LoggerShell;