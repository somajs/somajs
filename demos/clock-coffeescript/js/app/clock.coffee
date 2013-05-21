((clock) ->

	"use strict"

	class clock.ClockApplication extends soma.Application

		constructor: (@element) ->
			super()

		init: ->
			# mapping rules
			@injector.mapClass 'timer', clock.TimerModel, true
			@injector.mapClass 'face', clock.FaceView
			@injector.mapClass 'needleSeconds', clock.NeedleSeconds
			@injector.mapClass 'needleMinutes', clock.NeedleMinutes
			@injector.mapClass 'needleHours', clock.NeedleHours
			# clock mediator
			@mediators.create clock.ClockMediator, @element.querySelector('.clock')
			# clock selector template
			@createTemplate clock.SelectorView, @element.querySelector('.clock-selector')

		start: ->
			@dispatcher.dispatch 'create', clock.AnalogView

) window.clock = window.clock or {}

new clock.ClockApplication document.querySelector '.clock-app'
