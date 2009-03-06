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
	  run: function(input, param) {
	    if (this.test(input))
	      _func(param,input);
	  },
	  /**
	   * Forces the function to run without the test. (caution) this could have undesirable side-effects. Only use this  
	   * @param {string} input
	   * @param {mixed} param
	   */
	  force: function(input,param) {
	    _func(param,input);
	  }
  }
}
