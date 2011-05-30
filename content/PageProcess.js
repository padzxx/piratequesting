/**
 * Class for creating processing to be run when PQ pages are loaded
 * @class 
 * @param {RegExp} pattern
 * @param {Function} func
 */
function PageProcess(pattern, func, context) {
	/**
	 * @private
	 * @type RegExp
	 */
	var _pattern;
	
	var _context;
	if (context) {
		_context = context;
	} else {
		_context = this;
	}
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
	  	pqdump("PQ: Running Page Processor\n", PQ_DEBUG_EXTREME);
	  	var args = Array.prototype.slice.call(arguments,4);
	  	pqdump("\tinput: " + input + "\n\targs: " + args.length);

	  	var lr = _func.lastRequest;
	  	var lrt = _func.lastRequestTime;
	  	if (typeof lr == "undefined") _func.lastRequest = 0;
	  	if (typeof lrt == "undefined") _func.lastRequestTime = 0;
	  	if (this.test(input)) {
	    	if (!requestNumber || requestTime > _func.lastRequestTime || requestNumber > _func.lastRequest) {
	    		if (requestNumber) _func.lastRequest = requestNumber;
	    		if (requestTime) _func.lastRequestTime = requestTime;
	    		args.unshift(param,input);
	    		/*for (part in args) {
  					dump ("\nargs." + part + ":\t" + args[part]);
  				}*/
	  	
	    		_func.apply(_context,args);
	    	} 
	    }
	  },
	  /**
	   * Forces the function to run without the test. (caution) this could have undesirable side-effects. Only use this in exceptional cases
	   * @param {string} input
	   * @param {mixed} param
	   */
	  force: function(input,param) {
	    pqdump("PQ: Forcing Run of Page Processor\n", PQ_DEBUG_EXTREME);
	  	_func.call(_context,param,input);
	  }
  }
}
