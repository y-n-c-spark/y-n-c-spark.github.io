function init(args) {
var requestAnimationFrame = window.requestAnimationFrame || 
                            window.mozRequestAnimationFrame || 
                            window.webkitRequestAnimationFrame || 
                            window.msRequestAnimationFrame;
	
	var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext("2d");
	var stage = new createjs.Stage("myCanvas");
	
	var images = {};
	var baseX = 0;
	var baseY = 0;
	
	function loadImage(name, x, y, xRotTransScale, yRotTransScale) {
		var image = new Image();
		image.src = "dog/" + name + ".png";
		image.onload = function(event) {
			var bitmap = new createjs.Bitmap("dog/" + name + ".png")
			var xPivot = bitmap.x + ((xRotTransScale||0) * bitmap.getBounds().width);
			var yPivot = bitmap.y + ((yRotTransScale||0) * bitmap.getBounds().height);
			
			bitmap.setTransform(x, y, 
			  regX=xPivot, regY=yPivot)
					
			stage.addChildAt(bitmap, stage.numChildren);
			stage.update();
		}
		images[name] = image;
	}
	
	function loadImageOld(name, x, y, rotWidthScale, rotHeightScale) {
		var image = new Image();
		image.onload = function() { 
			redraw();
		}
		// Properties that don't change with loaded image:
		image.src = "dog/" + name + ".png";
		image.xOrigin = x;
		image.yOrigin = y;
		image.xRotTransScale = rotWidthScale;
		image.yRotTransScale = rotHeightScale;
		images[name] = image;
	}
	
	function loadImages(args) {
			loadImage("backleg", 0, 130);
			loadImage("leftleg", 25, 180);
			loadImage("rightleg", 125, 180);
			loadImage("torso", 28, 110);
			loadImage("head", -5, 0, .5, 1.0); // rotate from bottom of head
			stage.update();
	}

  function drawImage(x, y, name, rotation) {
		var imgPart = images[name]
		// save the old canvas state so we can restore it after changing it.
		ctx.save();
		if (rotation > 0) {
			// Move the canvas so that the "pivotpoint" is the new center. This
			// is the point we rotate around.
			var xPivot = x + imgPart.xOrigin + (imgPart.xRotTransScale * imgPart.width);
			var yPivot = y + imgPart.yOrigin + (imgPart.yRotTransScale * imgPart.height);
			ctx.translate(transX, transY);
			ctx.rotate((Math.PI/180)*rotation);
			ctx.translate(-transX, -transY);
		}
		// Draw the image in its correct location.
		ctx.drawImage(imgPart, x + imgPart.xOrigin, y + imgPart.yOrigin);
		// restore the old canvas state
		ctx.restore();
  }
    
	function redraw() {
		canvas.width = canvas.width; // clears the canvas
		drawImage(baseX, baseY, "backleg", 0);
		drawImage(baseX, baseY, "leftleg", 0);
		drawImage(baseX, baseY, "rightleg", 0);
		drawImage(baseX, baseY, "torso", 0);
		drawImage(baseX, baseY, "head", -20);

	}
	loadImages();
}