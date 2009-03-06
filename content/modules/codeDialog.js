/*******************************************************************************
 * ***** BEGIN LICENSE BLOCK Version: MPL 1.1/GPL 2.0/LGPL 2.1
 * 
 * The contents of this file are subject to the Mozilla Public License Version
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for
 * the specific language governing rights and limitations under the License.
 * 
 * The Original Code is Pirate Questing.
 * 
 * The Initial Developer of the Original Code is Jonathan Fingland. Portions
 * created by the Initial Developer are Copyright (C) 2008 the Initial
 * Developer. All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or the
 * GNU Lesser General Public License Version 2.1 or later (the "LGPL"), in which
 * case the provisions of the GPL or the LGPL are applicable instead of those
 * above. If you wish to allow use of your version of this file only under the
 * terms of either the GPL or the LGPL, and not to allow others to use your
 * version of this file under the terms of the MPL, indicate your decision by
 * deleting the provisions above and replace them with the notice and other
 * provisions required by the GPL or the LGPL. If you do not delete the
 * provisions above, a recipient may use your version of this file under the
 * terms of any one of the MPL, the GPL or the LGPL.
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
 * @function
 */
function codeDialogOnLoad() {
	var data = window.arguments[0];
	// Use the arguments passed to us by the caller
	document.getElementById("codeImage").setAttribute('src',
			data.image);
	document.getElementById("codeImage").setAttribute('alt',
			data.image);
	if (data.failure) 
		document.getElementById("failure").setAttribute('style', 'display:block;');
	// getCodeImage(window.arguments[0].inn.site);
}

// Called once if and only if the user clicks OK
/**
 * 
 * @return {Boolean}
 */
function onOK() {
	// Return the changed arguments.
	// Notice if user clicks cancel, window.arguments[0].out remains null
	// because this function is never called
	window.arguments[0].out = document.getElementById("codeValue").value;
	return true;
}