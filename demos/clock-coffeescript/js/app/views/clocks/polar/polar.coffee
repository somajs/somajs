((clock) ->

	"use strict"

	class clock.PolarView

		constructor: (target) ->
			@element = target
			width = 300
			height = 300
			canvas = document.createElement('canvas')
			context = canvas.getContext('2d')
			canvas.width = width
			canvas.height = height
			target.appendChild(canvas)

			tick = (time) ->
				context.save()
				context.clearRect(0, 0, width, height)
				context.translate(width * 0.5, width * 0.5)
				context.rotate(-Math.PI / 2)
				context.lineWidth = 18
				milliSec = time.milliseconds
				sec = milliSec / 1000 + time.seconds
				min = sec / 60 + time.minutes
				hr = min / 60 + time.hours
				dow = time.day
				day = time.date
				month = time.month
				secPer = sec / 60
				minPer = min / 60
				hrPer = hr / 24
				dowPer = dow / 7
				monthPer = month / 12
				dayPer = 0
				if month is 2
					dayPer = day / 29
				else if month is 1 or month is 3 or month is 5 or month is 7 or month is 8 or month is 10 or month is 12
					dayPer = day / 31
				else
					dayPer = day / 30
				writeTime(context, 40, monthPer)
				writeTime(context, 60, dayPer)
				writeTime(context, 80, dowPer)
				writeTime(context, 100, hrPer)
				writeTime(context, 120, minPer)
				writeTime(context, 140, secPer)
				context.restore()

			writeTime = (context, radius, per) ->
				context.save()
				context.strokeStyle = calculateColor(per)
				context.beginPath()
				context.arc(0, 0, radius, 0, per * (Math.PI * 2), false)
				context.stroke()
				context.restore()

			calculateColor = (per) ->
				brightness = 255
				red = 0
				blue = per * brightness
				green = brightness - blue
				return 'rgba(' + Math.round(red) + ',' + Math.round(green) + ',' + Math.round(blue) + ',1)'

			@update = tick.bind @

		dispose: () ->
			@element.removeChild @element.firstChild

) window.clock = window.clock or {}