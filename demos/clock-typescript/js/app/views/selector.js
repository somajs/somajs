///<reference path='../../../../../build/soma.d.ts'/>
var clock;
(function (clock) {
    var SelectorView = (function () {
        function SelectorView(scope, dispatcher) {
            scope.select = function (event, id) {
                dispatcher.dispatch('create', clock[id]);
            }.bind(this);
        }
        return SelectorView;
    })();
    clock.SelectorView = SelectorView;
})(clock || (clock = {}));
//# sourceMappingURL=selector.js.map
