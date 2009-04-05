/**
 * Class for creating processing to be run when PQ pages are loaded
 * @class 
 * @param {RegExp} pattern
 * @param {Function} func
 */
function PageProcess(pattern, func) {
	/**
	 * @private
	 * @type RegExp
	 */
	var _pattern;
	/**
	 * callback function
	 * @private 
	 * @type Function 
	 */
	var _func = func; 
	_func.lastRequest = 0;
	_func.lastRequestTime = 0;
  if (pattern instanceof RegExp) {
    _pattern = pattern;
  }
  else {
    _pattern = new RegExp(pattern,"");
  }
  
  return {
  	/**
  	 * Regex tests the input against the stored pattern
  	 * @param {string} input
  	 * @return {Boolean}
  	 */
	  test: function(input) {
	  	return (_pattern.test(input));
	  },
	  /**
	   * Regex tests the input against the stored pattern then runs the associated function
	   * @param {string} input
	   * @param {mixed} param
	   */
	  run: function(input, param, requestNumber, requestTime) {
	  	var lr = _func.lastRequest;
	  	var lrt = _func.lastRequestTime;
	  	if (typeof lr == "undefined") _func.lastRequest = 0;
	  	if (typeof lrt == "undefined") _func.lastRequestTime = 0;
	  	if (this.test(input)) {
	    	if (!requestNumber || requestTime > _func.lastRequestTime || requestNumber > _func.lastRequest) {
	    		if (requestNumber) _func.lastRequest = requestNumber;
	    		if (requestTime) _func.lastRequestTime = requestTime;
	    		_func(param,input);
	    	} 
	    }
	  },
	  /**
	   * Forces the function to run without the test. (caution) this could have undesirable side-effects. Only use this in exceptional cases
	   * @param {string} input
	   * @param {mixed} param
	   */
	  force: function(input,param) {
	    _func(param,input);
	  }
  }
}
