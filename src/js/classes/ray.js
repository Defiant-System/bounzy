
class Ray {
	constructor(start, end) {
		this.start = start;
		this.end = end;
	}

	yValueAt(x) {
		//returns the y value on the ray at the specified x
		//slope-intercept form:
		//y = m * x + b
		return this.offsetY + this.slope * x;
	}

	xValueAt(y) {
		//returns the x value on the ray at the specified y
		//slope-intercept form:
		//x = (y - b) / m
		return (y - this.offsetY) / this.slope;
	}

	pointInBounds(point) {
		//checks to see if the specified point is within
		//the ray's bounding box (inclusive)
		var minX = Math.min(this.start.x, this.end.x);
		var maxX = Math.max(this.start.x, this.end.x);
		var minY = Math.min(this.start.y, this.end.y);
		var maxY = Math.max(this.start.y, this.end.y);
		return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
	}

	calculateNormal(ref) {
		//calulates the normal based on a specified
		//reference point
		var dif = this.difference; //gets the two possible normals as points that lie
		//perpendicular to the ray
		var norm1 = dif.normalized().rotate(Math.PI / 2);
		var norm2 = dif.normalized().rotate(Math.PI / -2); //returns the normal that is closer to the provided
		//reference point
		if (this.start.plus(norm1).distance(ref) < this.start.plus(norm2).distance(ref)) return norm1;
		return norm2;
	}

	get difference() {
		//pretty self explanitory
		return this.end.minus(this.start);
	}

	get slope() {
		var dif = this.difference;
		return dif.y / dif.x;
	}

	get offsetY() {
		//the y-offset at x = 0, in slope-intercept form:
		//b = y - m * x
		//offsetY = start.y - slope * start.x
		return this.start.y - this.slope * this.start.x;
	}

	get isHorizontal() {
		return Ray.compareNum(this.start.y, this.end.y);
	}

	get isVertical() {
		return Ray.compareNum(this.start.x, this.end.x);
	}

	static compareNum(a, b) {
		var leniency = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.00001;
		return Math.abs(b - a) <= leniency;
	}

	static intersect(rayA, rayB) {
		//returns the intersection point between two rays
		//null if no intersection
		//conditional checks for axis aligned rays
		if (rayA.isVertical && rayB.isVertical) return null;
		if (rayA.isVertical) return new Vec2(rayA.start.x, rayB.yValueAt(rayA.start.x));
		if (rayB.isVertical) return new Vec2(rayB.start.x, rayA.yValueAt(rayB.start.x));
		if (Ray.compareNum(rayA.slope, rayB.slope)) return null;
		if (rayA.isHorizontal) return new Vec2(rayB.xValueAt(rayA.start.y), rayA.start.y);
		if (rayB.isHorizontal) return new Vec2(rayA.xValueAt(rayB.start.y), rayB.start.y); //slope intercept form:
		var x = (rayB.offsetY - rayA.offsetY) / (rayA.slope - rayB.slope);
		return new Vec2(x, rayA.yValueAt(x));
	}

	static collisionPoint(rayA, rayB) {
		//returns the collision point of two rays
		//null if no collision
		var intersection = Ray.intersect(rayA, rayB);
		if (!intersection) return null;
		if (!rayA.pointInBounds(intersection)) return null;
		if (!rayB.pointInBounds(intersection)) return null;
		return intersection;
	}

	static bodyEdges(body) {
		//returns all of the edges of a body in the
		//form of an array of ray objects
		var r = [];
		for (var i = body.parts.length - 1; i >= 0; i--) {
			for (var k = body.parts[i].vertices.length - 1; k >= 0; k--) {
				var k2 = k + 1;
				if (k2 >= body.parts[i].vertices.length) k2 = 0;
				var tray = new Ray(Vec2.fromOther(body.parts[i].vertices[k]), Vec2.fromOther(body.parts[i].vertices[k2])); //stores the vertices inside the edge
				//ray for future reference
				tray.verts = [body.parts[i].vertices[k], body.parts[i].vertices[k2]];
				r.push(tray);
			}
		}
		return r;
	}

	static bodyCollisions(rayA, body) {
		//returns all the collisions between a specified ray
		//and body in the form of an array of 'raycol' objects
		var r = []; //gets the edge rays from the body
		var edges = Ray.bodyEdges(body); //iterates through each edge and tests for collision
		for (var i = edges.length - 1; i >= 0; i--) {
			//gets the collision point
			var colpoint = Ray.collisionPoint(rayA, edges[i]); //if there is no collision, then go to next edge
			if (!colpoint) continue; //calculates the edge's normal
			r.push(colpoint);
		}
		return r;
	}
}
