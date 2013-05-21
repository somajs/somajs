var clock;
(function (clock) {
    var SelectorView = (function () {
        function SelectorView(scope, dispatcher) {
            this.views = {
                'digital': clock.DigitalView,
                'analog': clock.AnalogView,
                'polar': clock.PolarView
            };
            scope.select = function (event, id) {
                dispatcher.dispatch('create', this.views[id]);
            }.bind(this);
        }
        return SelectorView;
    })();
    clock.SelectorView = SelectorView;    
})(clock || (clock = {}));
//@ sourceMappingURL=selector.js.map
