
class Vec2 {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	normalized() {
		var magnitude = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
		//returns a vector 2 with the same direction as this but
		//with a specified magnitude
		return this.multiply(magnitude / this.distance());
	}

	multiply(factor) {
		//returns this multiplied by a specified factor    
		return new Vec2(this.x * factor, this.y * factor);
	}

	plus(vec) {
		//returns the result of this added to another
		//specified 'vec2' object
		return new Vec2(this.x + vec.x, this.y + vec.y);
	}

	minus(vec) {
		//returns the result of this subtracted by another
		//specified 'vec2' object
		return this.plus(vec.inverted);
	}

	rotate(rot) {
		//rotates the vector by the specified angle
		var ang = this.direction;
		var mag = this.distance();
		ang += rot;
		return Vec2.fromAng(ang, mag);
	}

	toPhysVector() {
		//converts this to a vector compatible with the
		//matter.js physics engine
		return Matter.Vector.create(this.x, this.y);
	}

	distance() {
		var vec = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Vec2();
		//returns the distance between this and a specified
		//'vec2' object
		var d = Math.sqrt(Math.pow(this.x - vec.x, 2) + Math.pow(this.y - vec.y, 2));
		return d;
	}

	clone() {
		//returns a new instance of a 'vec2' object with the
		//same value
		return new Vec2(this.x, this.y);
	}

	toString() {
		return "vector<" + this.x + ", " + this.y + ">";
	}

	get inverted() {
		//returns the opposite of this vector
		return this.multiply(-1);
	}

	get direction() {
		//returns the angle this vector is pointing in radians
		return Math.atan2(this.y, this.x);
	}

	static fromAng(angle) {
		var magnitude = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
		//returns a vector which points in the specified angle
		//and has the specified magnitude
		return new Vec2(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
	}

	static fromOther(vector) {
		//converts other data types that contain 'x' and 'y'
		//properties to a 'vec2' object type
		return new Vec2(vector.x, vector.y);
	}
}
