// Configuration
var emissionFrequency = 0.25;
var particleColor = 'red';
var scaleRate = 1.05;
var particleSize = 5;
var particleDuration = 0.5;

// State
var lastEmissionTime = 0;
var faceRectangles = [];

function onFrame(event) {
	if (event.time - lastEmissionTime > emissionFrequency) {
		for (var i = 0; i < faceRectangles.length; i++) {
			var point = randomPerimeterPointOnRectangle(faceRectangles[i]);
			emitParticle(point, event.time);
		}
		lastEmissionTime = event.time;
	}
}

function onMouseMove(event) {
	// This mocks the presence of a detected face.
	faceRectangles = [new Rectangle(event.point.x - 50, event.point.y - 50, 100, 100)];
}

function emitParticle(point, timeStamp) {
	var particle = Path.Circle(point, particleSize);
	particle.fillColor = particleColor;
	particle.timeStamp = timeStamp;
	particle.onFrame = function(event) {
		particle.scale(scaleRate);
		if (event.time > particleDuration) particle.remove();
	}
}

function randomPerimeterPointOnRectangle(rectangle) {
	var random = Point.random();
	if (random.x < 0.25) {
		return new Point(rectangle.topLeft.x, rectangle.y + random.y * rectangle.height);
	} else if (random.x < 0.5) {
		return new Point(rectangle.x + random.y * rectangle.width, rectangle.topLeft.y);
	} else if (random.x < 0.75) {
		return new Point(rectangle.bottomRight.x, rectangle.y + random.y * rectangle.height);
	} else {
		return new Point(rectangle.x + random.y * rectangle.width, rectangle.bottomRight.y);
	}
}
