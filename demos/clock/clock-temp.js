/*
 Analog Clock in HTML5 Canvas + Javascript

 Author: Vishnu Haridas
 Contact: hvishnu999@gmail.com
 Follow: twitter.com/hvishnu999

 Dated: 07-01-2012

 The descriptive tutorial will appear soon on my blog - www.iamvishnu.com, on
 how to draw the clock, and more on HTML5 canvas. This is a sneak preview only.
 */

// Set the radius of the clock dial
var rad = 250;

// Get the Canvas Element!
var cv = document.getElementById("ca");
var cx;

// We need the '2d' context to draw in.
if(cv.getContext('2d')){
	cx = cv.getContext('2d');
}

// Set the WxH size of the canvas element.
cv.width = cv.height = rad;

// Just fill a light blue rectangle. In-case any of the functions below
// fails, you will see this rectangle, to understand that "at-least, it can work!"
// (I picked the color in random!)
cx.fillStyle = "rgba(55,133,144,0.5)";
cx.fillRect(0,0,rad,rad);

// Before going forward:
/**
 * How the analog clock works:
 *   >> Each minute is 6 degrees. (That is, 360deg / 60min = 6deg/min)
 *   >> Second Needle Angle = (sec * 6) degrees
 *   >> Minute Needle Angle = (min * 6) + (sec/60) degrees
 *   >> Hour Needle Angle = (hour * 30) + (min/60) + (sec/3600) degrees
 *
 * In Javascript Sin(), Cos() functions accept angles in Radians only.
 *
 *   >> Angle in Radians = Degrees * 3.14 / 180
 *
 * Once we find the angles, calculate X and Y positions of the needle ends from (0,0) as -
 *
 *   >> X = D + A * cos(Theta)
 *   >> Y = D + A * sin(Theta)
 *
 * A = size of the needle
 * D = displacement from (0,0)
 * Theta = Angle in Radians
 *
 * All are old-skool math, I think you get this.
 *
 * In canvas, first we draw the clock face, then draw each needle on top. Then we update time.
 * We will contine the process every 1 sec, that is, cleaning and drawing again and again.
 **/

// Create a new Clock Face object
var _clock_face = new (function(ctx, rad){

	this.radius = rad/2 - 5;
	this.center = rad/2;
	this.canvas = ctx;

	this.draw = function(){
		this.canvas.clearRect(0,0,this.center*2,this.center*2);

		this.canvas.lineWidth = 4.0;
		this.canvas.strokeStyle = "#567";
		this.canvas.beginPath();
		this.canvas.arc(this.center,this.center,this.radius,0,Math.PI * 2,true);
		this.canvas.closePath();
		this.canvas.stroke();

		this.drawDotes();
		this.drawHourDotes();
	}

	this.drawDotes = function(){
		/*
		 we need to draw dots in every 6 degrees (6 * PI / 180 radians)
		 Total 60 dots. (One minute = 6 degrees)
		 */
		var theta = 0;
		var distance = this.radius * 0.9; // 90% from the center

		this.canvas.lineWidth = 0.5;
		this.canvas.strokeStyle = "#137";

		for(var i=0; i<60; i++){
			// calculate Theta
			theta = theta + (6 * Math.PI / 180);
			// calculate x,y
			x = this.center + distance * Math.cos(theta);
			y = this.center + distance * Math.sin(theta);

			this.canvas.beginPath();
			this.canvas.arc(x,y,1,0,Math.PI * 2,true);
			this.canvas.closePath();
			this.canvas.stroke();
		} // for(i:0..60)
	}

	this.drawHourDotes = function(){
		/*
		 we need to draw dots in every 30 degrees (30 * PI / 180 radians)
		 Total 12 dots.
		 */
		var theta = 0;
		var distance = this.radius * 0.9; // 90% from the center

		this.canvas.lineWidth = 5.0;
		this.canvas.strokeStyle = "#137";

		for(var i=0; i<12; i++){
			// calculate Theta
			theta = theta + (30 * Math.PI / 180);
			// calculate x,y
			x = this.center + distance * Math.cos(theta);
			y = this.center + distance * Math.sin(theta);

			this.canvas.beginPath();
			this.canvas.arc(x,y,1,0,Math.PI * 2,true);
			this.canvas.closePath();
			this.canvas.stroke();
		} // for(i:0..60)
	}
})(cx,rad); // Immediately create an object in the Canvas Context, with given Radius.

// Create a Second Needle Object.
var _second_needle = new (function(ctx,rad,sec){ // Accepts "sec" value
	this.sec = sec;
	this.canvas = ctx;
	this.center = rad / 2;
	this.size = this.center * 0.80; // 80% of the radius

	this.update = function(s){
		this.sec = s;
	}

	this.draw = function(){
		theta = (6 * Math.PI / 180);// - (Math.PI / 2);
		x = this.center + this.size * Math.cos(this.sec * theta - Math.PI/2);
		y = this.center + this.size * Math.sin(this.sec * theta - Math.PI/2);

		this.canvas.lineWidth = 2.0;
		this.canvas.strokeStyle = "#423";
		this.canvas.lineCap = "round";

		this.canvas.beginPath();
		this.canvas.moveTo(x,y);
		this.canvas.lineTo(this.center,this.center);
		this.canvas.closePath();
		this.canvas.stroke();

		this.next();

	} // draw()

	this.next = function(){
		// Up next second!!!
		this.sec++;
		if(this.sec==60) this.sec=0;
	}
})(cx,rad,0); // Immediately create an object with "0" sec

// Same as above, minute needle!
var _minute_needle = new (function(ctx,rad,min,sec){
	this.sec = sec;
	this.min = min;
	this.canvas = ctx;
	this.center = rad / 2;
	this.size = this.center * 0.65; // 65% of the face size

	this.update = function(m,s){
		this.sec = s;
		this.min = m;
	}

	this.draw = function(){
		theta = (6 * Math.PI / 180);// - (Math.PI / 2);
		x = this.center + this.size * Math.cos(((this.min + this.sec/60) * theta) - Math.PI/2);
		y = this.center + this.size * Math.sin(((this.min + this.sec/60) * theta) - Math.PI/2);

		this.canvas.lineWidth = 3.0;
		this.canvas.strokeStyle = "#423";
		this.canvas.lineCap = "round";

		this.canvas.beginPath();
		this.canvas.moveTo(x,y);
		this.canvas.lineTo(this.center,this.center);
		this.canvas.closePath();
		this.canvas.stroke();

		this.next();

	} // draw()

	this.next = function(){
		// Up next second!!!
		this.sec++;
		if(this.sec==60){
			this.min++;
			this.sec = 0;
			if(this.min == 60){
				this.min = 0;
			}
		}
	}
})(cx,rad,0,0); // "0" min, "0" sec

// Create Hour Needle Object
var _hour_needle = new (function(ctx,rad,hour,min,sec){
	this.sec = sec;
	this.min = min;
	this.hour = hour;
	this.canvas = ctx;
	this.center = rad / 2;
	this.size = this.center * 0.40; // 40% of the face size

	this.update = function(h,m,s){
		this.sec = s;
		this.min = m;
		this.hour = h;
	}

	this.draw = function(){
		theta = (30 * Math.PI / 180);
		x = this.center + this.size * Math.cos(((this.hour + this.min/60 + this.sec/3600) * theta) - Math.PI/2);
		y = this.center + this.size * Math.sin(((this.hour + this.min/60 + this.sec/3600) * theta) - Math.PI/2);

		this.canvas.lineWidth = 5.0;
		this.canvas.strokeStyle = "#423";
		this.canvas.lineCap = "round";

		this.canvas.beginPath();
		this.canvas.moveTo(x,y);
		this.canvas.lineTo(this.center,this.center);
		this.canvas.closePath();

		this.canvas.stroke();

		this.next();

	} // draw()

	this.next = function(){
		// Up next second!!!
		this.sec++;
		if(this.sec==60){
			this.sec = 0;
			this.min++;
			if(this.min == 60){
				this.min = 0;
				// On every 60 minutes, increase the hour
				this.hour++;
				if(this.hour == 12){
					this.hour = 0;
				}
			}
		}
	}
})(cx,rad,1,0,0); // 1 hour, 0 min, 0 sec

// For the real-time-based clock, we need to get the current Time details.
var _dateObject = new (function(){
	this.dateObject = new Date(); // Javascript Date Object

	this.hours = this.dateObject.getHours();
	this.minutes = this.dateObject.getMinutes();
	this.seconds = this.dateObject.getSeconds();

	this.refresh = function(){
		this.hours = this.dateObject.getHours();
		this.minutes = this.dateObject.getMinutes();
		this.seconds = this.dateObject.getSeconds();
	}
})();

// This function will initialize the clock needles.
var _init = function(){
	_dateObject.refresh();
	_second_needle.update(_dateObject.seconds);
	_minute_needle.update(_dateObject.minutes,_dateObject.seconds);
	_hour_needle.update(_dateObject.hours,_dateObject.minutes,_dateObject.seconds);
}

// The core function, which co-ordinates all the functions together.
var _clock = function(){

	// Draw the face
	_clock_face.draw();

	// Draw the needles
	_second_needle.draw();
	_minute_needle.draw();
	_hour_needle.draw();

	// Execute the function every 1 sec. (In FPS, 1fps. That is, 1000ms/1fps)
	setTimeout(_clock,1000/1);
}

// You can avoid this line to start the clock as a stop-watch!
_init();

// Make the first call, and rest will be handled by the clock itself..!!!
_clock();

// The detailed tutorial will come soon on www.iamvishnu.com
// Thanks for watching!
// Contact at : hvishnu999@gmail.com