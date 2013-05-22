((clock) ->

	"use strict"

	class clock.AnalogView

		constructor: (target, face, needleSeconds, needleMinutes, needleHours) ->
			@element = target
			radius = 250
			canvas = document.createElement('canvas')
			context = canvas.getContext('2d')
			canvas.width = canvas.height = radius
			target.appendChild canvas
			face.initialize radius
			needleSeconds.initialize radius
			needleMinutes.initialize radius
			needleHours.initialize radius
			tick = (time) =>
				face.draw context
				needleSeconds.update time.seconds
				needleSeconds.draw context
				needleMinutes.update time.minutes, time.seconds
				needleMinutes.draw context
				needleHours.update time.hours, time.minutes, time.seconds
				needleHours.draw context
			@update = tick.bind @

		dispose: () ->
			@element.removeChild @element.firstChild

) window.clock = window.clock or {}