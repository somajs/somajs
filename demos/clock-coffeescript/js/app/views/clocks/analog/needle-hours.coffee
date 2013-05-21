((clock) ->

	"use strict"

	class clock.NeedleHours

		constructor: () ->
			@seconds = 0
			@minutes = 0
			@hours = 0
			@radius = 0
			@center = 0
			@size = 0

		initialize: (@radius) ->
			@center = @radius / 2
			@size = @center * 0.4

		update: (@hours, @minutes, @seconds) ->

		draw: (context) ->
			theta = (30 * Math.PI / 180)
			x = @center + @size * Math.cos(((@hours + @minutes/60 + @seconds/3600) * theta) - Math.PI/2)
			y = @center + @size * Math.sin(((@hours + @minutes/60 + @seconds/3600) * theta) - Math.PI/2)
			context.save()
			context.lineWidth = 5
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