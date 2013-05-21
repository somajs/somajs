((clock) ->

	"use strict"

	class clock.DigitalView

		constructor: (target) ->
			@element = target
			tick = (time) ->
				@element.innerHTML = format(time.hours) + ":" + format(time.minutes) + ":" + format(time.seconds)
			format = (value) ->
				return "0" + value  if value < 10
				value
			@update = tick.bind @

		dispose: ->
			@element.innerHTML = ""

) window.clock = window.clock or {}
