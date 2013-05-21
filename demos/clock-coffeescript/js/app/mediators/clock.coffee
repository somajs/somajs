((clock) ->

	"use strict"

	class clock.ClockMediator

		constructor: (target, dispatcher, mediators, timer) ->

			currentClock = null

			dispatcher.addEventListener 'create', (event) ->

				# destroy previous clock
				if currentClock
					timer.remove currentClock.update
					currentClock.dispose()

				# create clock
				currentClock = mediators.create event.params, target

				# register clock with timer model
				timer.add currentClock.update
				currentClock.update timer.time

) window.clock = window.clock or {}