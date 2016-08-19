function onMouseDown(event) {
	emitParticle(event.point, event.timeStamp);
}

var particles = [];

function emitParticle(location, timeStamp) {
	var particle = Path.Circle(location, 50);
	particle.fillColor = 'red';
	particle.timeStamp = timeStamp;
	particles.push(particle);
}
