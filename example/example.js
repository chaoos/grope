/**
 * If you're using typescript you can import the module with:
 * import grope from '../grope'
 */
window.onload = function () {
    var body = grope([document.getElementById("container")], {
        elements: ['#container > *'],
        tossCallback: function () { return false; },
        copy: true
    });
    var basics = grope([document.getElementById("basics_1"), document.getElementById("basics_2")]);
};
//# sourceMappingURL=example.js.map