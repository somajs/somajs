function clock(){
	// get current time from client
	var now = new Date();

	// get 2D context from the canvas element
	var ctx = document.getElementById('clockCanvas').getContext('2d');

	// You'll see a save and restore all over the place. These are because we
	// are redrawing the entire image every time, so we have to save the existing
	// state of the canvas and then add our other shape and then restore what we
	// saved.
	ctx.save();
	ctx.clearRect(0,0,800,800);
	ctx.translate(400,300);
	ctx.scale(2,2);
	// this rotates the canvas so that the arcs we draw will start at the middle
	// top rather than horizontally.
	ctx.rotate(-Math.PI/2);
	// sets the width of all lines we're going to draw
	ctx.lineWidth = 18;
	// gives our lines a rounded edge.
	// it also supports "butt" and "square"
	ctx.lineCap = "round";

	// I wanted to get a smooth movement so I'm basing all time measurments off
	// of the millisecond and building partial seconds and minutes by adding the
	// smaller increment to the larger one. For example getting current millisecond
	// count and adding that to the current second to build a partial second.
	var milliSec = now.getMilliseconds();
	var sec = now.getSeconds();
	sec = milliSec/1000+sec;
	var min = now.getMinutes();
	min = sec/60 + min;
	// this is a 24 hour clock
	var hr  = now.getHours();
	// if you uncomment the following line, it'd become a 12 hour clock.
	// hr = hr>=12 ? hr-12 : hr;
	hr = min/60 + hr;
	var dow = now.getDay() + 1;
	var day = now.getDate();
	var month = now.getMonth() + 1;

	// turn times into percentages
	var secPer = sec/60;
	var minPer = min/60;
	// if you wanted a 12 hour clock, you'd have to change this to 12 too.
	var hrPer = hr/24;
	var dowPer = dow/7;
	var monthPer = month/12;
	var dayPer = 0;

	// handles the fact that there are different amount of total days in different months
	if (month == 2){
		dayPer = day/29;
	}
	else if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12){
		dayPer = day/31;
	}
	else {
		dayPer = day/30;
	}

	// call the functions that draw each arc and pass in the radius of the circle we want
	// and the calculated percentages from above.
	writeTime(ctx,40,monthPer);
	writeTime(ctx,60,dayPer);
	writeTime(ctx,80,dowPer);
	writeTime(ctx,100,hrPer);
	writeTime(ctx,120,minPer);
	writeTime(ctx,140,secPer);

	ctx.restore();
}

// draws arcs and sets color based on percentages
function writeTime(ctx,radius,per){
	ctx.save();
	ctx.strokeStyle = calculateColor(per);
	ctx.beginPath();
	partialCircle(ctx,0,0,radius,per);
	ctx.stroke();
	ctx.restore();
}

// turns a percentage into an RGB color string
function calculateColor(per){
	var brightness = 255;
	var red = 0;
	var green = 0;
	var blue = 0;

	blue = per * brightness;
	green = brightness - blue;

	result = 'rgba('+ Math.round(red) + ',' + Math.round(green) + ',' + Math.round(blue) + ',1)';
	return result;
}

// helper function for partial circles
function partialCircle(ctx,x,y,rad,percentage){
	ctx.arc(x,y,rad,0,percentage*(Math.PI*2),false);
	return ctx;
}

// call the function repeatedly. 66 is the equivalent of about 15 frames per second
// this seemed enough to make the animation look smooth look without overdoing it.
setInterval(clock,66);