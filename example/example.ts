/**
 * If you're using typescript you can import the module with:
 * import grope from '../grope'
 */

/* needed to suppress tsc errors TS2304, saying "cannot find swoosh" */
declare var grope: any;

window.onload = function () {

  var basics = grope([document.getElementById("basics_1"), document.getElementById("basics_2")]);

}