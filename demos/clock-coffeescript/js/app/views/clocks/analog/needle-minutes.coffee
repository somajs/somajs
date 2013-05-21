((clock) ->

	"use strict"

	class clock.NeedleMinutes

		constructor: () ->
			@seconds = 0
			@minutes = 0
			@radius = 0
			@center = 0
			@size = 0

		initialize: (@radius) ->
			@center = @radius / 2
			@size = @center * 0.65

		update: (@minutes, @seconds) ->

		draw: (context) ->
			theta = (6 * Math.PI / 180)
			x = @center + @size * Math.cos(((@minutes + @seconds/60) * theta) - Math.PI/2)
			y = @center + @size * Math.sin(((@minutes + @seconds/60) * theta) - Math.PI/2)
			context.save()
			context.lineWidth = 2
			context.strokeStyle = '#015666'
			context.lineJoin = 'round'
			context.lineCap = 'round'
			context.beginPath()
			context.moveTo(x, y)
			context.lineTo(@center, @center)
			context.closePath()
			context.stroke()
			context.restore()

		dispose: () ->

) window.clock = window.clock or {}