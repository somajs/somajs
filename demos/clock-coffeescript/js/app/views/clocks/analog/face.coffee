((clock) ->

	"use strict"

	class clock.FaceView

		constructor: () ->
			@radius = 0
			@center = 0

		initialize: (radius) ->
			@radius = radius / 2 - 5
			@center = radius / 2

		draw: (context) ->
			context.save()
			context.clearRect(0, 0, @center*2, @center*2)
			context.lineWidth = 4.0
			context.strokeStyle = '#015666'
			context.beginPath()
			context.arc(@center, @center, @radius, 0, Math.PI * 2, true)
			context.closePath()
			context.stroke()
			@drawDots context
			@drawHourDots context
			@drawCenter context
			context.restore()

		drawCenter: (context) ->
			context.fillStyle = '#015666'
			context.beginPath()
			context.arc(@center, @center, 5, 0, Math.PI * 2, false)
			context.closePath()
			context.fill()

		drawDots: (context) ->
			theta = 0
			distance = @radius * 0.9 # 90% from the center
			context.lineWidth = 0.5
			context.strokeStyle = '#04859D'
			i = 0
			while i++ < 60
				theta = theta + (6 * Math.PI / 180)
				x = @center + distance * Math.cos(theta)
				y = @center + distance * Math.sin(theta)
				context.beginPath()
				context.arc(x, y, 1, 0, Math.PI * 2, true)
				context.closePath()
				context.stroke()

		drawHourDots: (context) ->
			theta = 0
			distance = @radius * 0.9 # 90% from the center
			context.lineWidth = 5.0
			context.strokeStyle = '#137'
			i = 0
			while i++ < 60
				theta = theta + (30 * Math.PI / 180)
				x = @center + distance * Math.cos(theta)
				y = @center + distance * Math.sin(theta)
				context.beginPath()
				context.arc(x, y, 1, 0, Math.PI * 2, true)
				context.closePath()
				context.stroke()

		dispose: () ->

) window.clock = window.clock or {}