/*
Copyright 2013 Sub Protocol and other contributors
http://subprotocol.com/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, 
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// A simple 2-dimensional vector implementation

export class Vec2 {
	x: number;
	y: number;

	constructor(x?: number, y?: number) {
		this.x = x || 0;
		this.y = y || 0;
	}

	add(v: Vec2): Vec2 {
		return new Vec2(this.x + v.x, this.y + v.y);
	}

	sub(v: Vec2): Vec2 {
		return new Vec2(this.x - v.x, this.y - v.y);
	}

	mul(v: Vec2): Vec2 {
		return new Vec2(this.x * v.x, this.y * v.y);
	}

	div(v: Vec2): Vec2 {
		return new Vec2(this.x / v.x, this.y / v.y);
	}

	scale(coef: number): Vec2 {
		return new Vec2(this.x * coef, this.y * coef);
	}

	mutableSet(v: Vec2): this {
		this.x = v.x;
		this.y = v.y;
		return this;
	}

	mutableAdd(v: Vec2): this {
		this.x += v.x;
		this.y += v.y;
		return this;
	}

	mutableSub(v: Vec2): this {
		this.x -= v.x;
		this.y -= v.y;
		return this;
	}

	mutableMul(v: Vec2): this {
		this.x *= v.x;
		this.y *= v.y;
		return this;
	}

	mutableDiv(v: Vec2): this {
		this.x /= v.x;
		this.y /= v.y;
		return this;
	}

	mutableScale(coef: number): this {
		this.x *= coef;
		this.y *= coef;
		return this;
	}

	mutableRotate(origin: Vec2, theta: number): this {
		const x = this.x - origin.x;
		const y = this.y - origin.y;
		this.x = x * Math.cos(theta) - y * Math.sin(theta) + origin.x;
		this.y = x * Math.sin(theta) + y * Math.cos(theta) + origin.y;
		return this;
	}

	equals(v: Vec2): boolean {
		return this.x === v.x && this.y === v.y;
	}

	epsilonEquals(v: Vec2, epsilon: number): boolean {
		return Math.abs(this.x - v.x) <= epsilon && Math.abs(this.y - v.y) <= epsilon;
	}

	length(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	length2(): number {
		return this.x * this.x + this.y * this.y;
	}

	dist(v: Vec2): number {
		return Math.sqrt(this.dist2(v));
	}

	dist2(v: Vec2): number {
		const x = v.x - this.x;
		const y = v.y - this.y;
		return x * x + y * y;
	}

	normal(): Vec2 {
		const m = Math.sqrt(this.x * this.x + this.y * this.y);
		return new Vec2(this.x / m, this.y / m);
	}

	dot(v: Vec2): number {
		return this.x * v.x + this.y * v.y;
	}

	angle(v: Vec2): number {
		return Math.atan2(this.x * v.y - this.y * v.x, this.x * v.x + this.y * v.y);
	}

	angle2(vLeft: Vec2, vRight: Vec2): number {
		return vLeft.sub(this).angle(vRight.sub(this));
	}

	rotate(origin: Vec2, theta: number): Vec2 {
		const x = this.x - origin.x;
		const y = this.y - origin.y;
		return new Vec2(x * Math.cos(theta) - y * Math.sin(theta) + origin.x, x * Math.sin(theta) + y * Math.cos(theta) + origin.y);
	}

	toString(): string {
		return `(${this.x}, ${this.y})`;
	}
}