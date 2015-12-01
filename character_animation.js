(function($){
$.fn.character = function(options) {
var requestAnimationFrame = window.requestAnimationFrame || 
                            window.mozRequestAnimationFrame || 
                            window.webkitRequestAnimationFrame || 
                            window.msRequestAnimationFrame;
	
	var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext("2d");
	
	var fps = 30;
	
	var images = {};
	var baseX = 0;
	var baseY = 0;
	
	function loadImage(name, x, y, rotWidthScale, rotHeightScale, minRot, maxRot) {
		var image = new Image();
		image.id = name;
		image.onload = function() { 
			loadResources();
		}
		// Properties that don't change with loaded image:
		image.src = "dog/" + name + ".png";
		image.xOrigin = x;
		image.yOrigin = y;
		image.xRotTransScale = rotWidthScale;
		image.yRotTransScale = rotHeightScale;
		image.currRotation = 0;
		image.nextRotationUpdate = 1; // increment or decrement?
		image.minRot = minRot;
		image.maxRot = maxRot;
		images[name] = image;
	}
	
	var numResourcesLoaded = 0;
	var totalResources = 5;
	function loadResources() {
		numResourcesLoaded += 1;
		console.log(numResourcesLoaded)
		if(numResourcesLoaded === totalResources) {
		  setInterval(redraw, 1000 / fps);
		}
	}
	
	function init(args) {
		loadImage("backleg", 0, 130, 1, 0, -5, 5); // rotate from inner top.
		loadImage("leftleg", 25, 180, 1, 0, -5, 5); // rotate from top
		loadImage("rightleg", 125, 180, 0, 0, -10, 10); // rotate from top
		loadImage("torso", 28, 110); // no rotate.
		loadImage("head", -5, 0, .5, 1.0, -3, 10); // rotate from bottom of head
	}
	
	function drawEllipse(centerX, centerY, width, height) {
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(centerX, centerY - height/2);
		ctx.bezierCurveTo(
			centerX + width/2, centerY - height/2,
			centerX + width/2, centerY + height/2,
			centerX, centerY + height/2);
		ctx.bezierCurveTo(
			centerX - width/2, centerY + height/2,
			centerX - width/2, centerY - height/2,
			centerX, centerY - height/2);
		ctx.fillStyle = "black";
		ctx.fill();
		ctx.closePath();
		ctx.restore();
	}
	
  function drawImage(name) {
		var x = baseX, y = baseY;
		var imgPart = images[name]
		// save the old canvas state so we can restore it after changing it.
		ctx.save();
		if (imgPart.currRotation != 0) {
			// Move the canvas so that the "pivotpoint" is the new center. This
			// is the point we rotate around.
			//var transX = x + imgPart.xOrigin + (imgPart.xRotTransScale * imgPart.width);
			//var transY = y + imgPart.yOrigin + (imgPart.yRotTransScale * imgPart.height);
			doImgRotate(x, y, imgPart);
		}
		// Draw the image in its correct location.
		ctx.drawImage(imgPart, x + imgPart.xOrigin, y + imgPart.yOrigin);
		// restore the old canvas state
		ctx.restore();
  }
	
	function drawEye(x, y) {
		ctx.save();
		 doImgRotate(baseX, baseY, images["head"])
		 drawEllipse(x, y, 30, blinkState.currEyeHeight);
		 ctx.restore();
	}
	
	function doImgRotate(x, y, imgPart) {
		doRotate(x + imgPart.xOrigin, y + imgPart.yOrigin,
					 imgPart.xRotTransScale, imgPart.yRotTransScale,
					 imgPart.width, imgPart.height,
					 imgPart.currRotation);
	}
	
	function doRotate(x, y, xRotTransScale, yRotTransScale, width, height, rotation) {
		var transX = x + (xRotTransScale * width);
		var transY = y + (yRotTransScale * height);
		ctx.translate(transX, transY);
	  ctx.rotate((Math.PI/180) * rotation);
		ctx.translate(-transX, -transY);
		helpingGuideLines();
	}
	
		function helpingGuideLines() {
	  ctx.beginPath();
		ctx.moveTo(-100, 0);
		ctx.lineTo(100, 0);
		ctx.moveTo(0, -100);
		ctx.lineTo(0, 100);
		ctx.stroke();
	}
	
	var blinkState = {
		maxEyeHeight : 20,
		currEyeHeight : 20,
		eyeOpenTime : 0,
		timeBtwBlinks : 4000,
		blinkUpdateTime : 200
	}
	function maybeBlink() { 										
		blinkState.eyeOpenTime += blinkState.blinkUpdateTime;
		if(blinkState.eyeOpenTime >= blinkState.timeBtwBlinks){
			blink();
		}
	}
	function blink() {
		// decrement eye height
		blinkState.currEyeHeight -= 1;
		// eye is fully decremented, open all the way.
		if (blinkState.currEyeHeight <= 1) {
			blinkState.eyeOpenTime = 0;
			blinkState.currEyeHeight = blinkState.maxEyeHeight;
		} else {
			// recursively increment again after 10ms
			setTimeout(blink, 10);
		}
	}
	blinkTimer = setInterval(maybeBlink, blinkState.blinkUpdateTime);
	
	minRot = -10;
	maxRot = 10;
	
	function doRotation(name) {
		var img = images[name];
		img.currRotation += img.nextRotationUpdate;
		if (img.currRotation === 0) {
			return
		}	else if (img.currRotation >= maxRot) {
			img.nextRotationUpdate = -1;
			setTimeout(function() {doRotation(name);}, 300);
		} else if (img.currRotation <= minRot) {
			img.nextRotationUpdate = 1;
			setTimeout(function() {doRotation(name);}, 300);
		} else {
			setTimeout(function() {doRotation(name);}, 50);
		}
	}
	headRotationTimer = setInterval(function() {doRotation("head");}, 5000);
	leftlegRotationTimer = setInterval(function() {doRotation("leftleg");}, 8000);
	rightlegRotationTimer = setInterval(function() {doRotation("rightleg");}, 9000);
	backlegRotationTimer = setInterval(function() {doRotation("backleg");}, 15000);

	function redraw() {
		canvas.width = canvas.width; // clears the canvas
		drawImage("backleg");
		drawImage("leftleg");
		drawImage("rightleg");
		drawImage("torso");
		drawImage("head");
		
		// Update eyes.
		//drawEllipse(baseX + 70, baseY + 95, 30, blinkState.currEyeHeight);
		//drawEllipse(baseX + 150, baseY + 90, 30, blinkState.currEyeHeight);
		drawEye(baseX + 70, baseY + 95);
		drawEye(baseX + 150, baseY + 90);
	}
	init();
}
})(jQuery);