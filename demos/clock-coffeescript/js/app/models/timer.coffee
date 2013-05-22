((clock) ->

	"use strict"

	class clock.TimerModel

		constructor: () ->
			@callbacks = []
			@time = {}
			i = 0
			l = 0
			tick = () =>
				@update()
				i = 0
				l = @callbacks.length
				while i < l
					@callbacks[i] @time
					i++
			setInterval tick, 1000
			@update()

		update: () ->
			@time.now = new Date()
			@time.hours = @time.now.getHours()
			@time.minutes = @time.now.getMinutes()
			@time.seconds = @time.now.getSeconds()
			@time.milliseconds = @time.now.getMilliseconds()
			@time.day = @time.now.getDay() + 1
			@time.date = @time.now.getDate()
			@time.month = @time.now.getMonth() + 1

		add: (callback) ->
			@callbacks.push callback

		remove: (callback) ->
			@callbacks.splice @callbacks.indexOf callback, 1

) window.clock = window.clock or {}