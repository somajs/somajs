((clock) ->

	"use strict"

	class clock.SelectorView

		constructor: (scope, dispatcher) ->
			views =
				digital: clock.DigitalView
				analog: clock.AnalogView
				polar: clock.PolarView
			scope.select = (event, id) ->
				dispatcher.dispatch 'create', views[id]

) window.clock = window.clock or {}
