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

import { VerletJS, Particle, Composite } from './verlet';
import { DistanceConstraint } from './constraint';
import { Vec2 } from './vec2';

// Declaration merging to add methods to the VerletJS class
declare module './verlet' {
    interface VerletJS {
        point(pos: Vec2): Composite;
        lineSegments(vertices: Vec2[], stiffness: number): Composite;
        cloth(origin: Vec2, width: number, height: number, segments: number, pinMod: number, stiffness: number): Composite;
        tire(origin: Vec2, radius: number, segments: number, spokeStiffness: number, treadStiffness: number): Composite;
    }
}

VerletJS.prototype.point = function(this: VerletJS, pos: Vec2): Composite {
	const composite = new Composite();
	composite.particles.push(new Particle(pos));
	this.composites.push(composite);
	return composite;
}

VerletJS.prototype.lineSegments = function(this: VerletJS, vertices: Vec2[], stiffness: number): Composite {
	const composite = new Composite();

	for (let i = 0; i < vertices.length; i++) {
		composite.particles.push(new Particle(vertices[i]));
		if (i > 0)
			composite.constraints.push(new DistanceConstraint(composite.particles[i], composite.particles[i - 1], stiffness));
	}

	this.composites.push(composite);
	return composite;
}

VerletJS.prototype.cloth = function(this: VerletJS, origin: Vec2, width: number, height: number, segments: number, pinMod: number, stiffness: number): Composite {
	const composite = new Composite();

	const xStride = width / segments;
	const yStride = height / segments;

	for (let y = 0; y < segments; ++y) {
		for (let x = 0; x < segments; ++x) {
			const px = origin.x + x * xStride - width / 2 + xStride / 2;
			const py = origin.y + y * yStride - height / 2 + yStride / 2;
			composite.particles.push(new Particle(new Vec2(px, py)));

			if (x > 0)
				composite.constraints.push(new DistanceConstraint(composite.particles[y * segments + x], composite.particles[y * segments + x - 1], stiffness));

			if (y > 0)
				composite.constraints.push(new DistanceConstraint(composite.particles[y * segments + x], composite.particles[(y - 1) * segments + x], stiffness));
		}
	}

	for (let x = 0; x < segments; ++x) {
		if (x % pinMod === 0) {
			composite.pin(x);
        }
	}

	this.composites.push(composite);
	return composite;
}

VerletJS.prototype.tire = function(this: VerletJS, origin: Vec2, radius: number, segments: number, spokeStiffness: number, treadStiffness: number): Composite {
	const stride = (2 * Math.PI) / segments;

	const composite = new Composite();

	// particles
	for (let i = 0; i < segments; ++i) {
		const theta = i * stride;
		composite.particles.push(new Particle(new Vec2(origin.x + Math.cos(theta) * radius, origin.y + Math.sin(theta) * radius)));
	}

	const center = new Particle(origin);
	composite.particles.push(center);

	// constraints
	for (let i = 0; i < segments; ++i) {
		composite.constraints.push(new DistanceConstraint(composite.particles[i], composite.particles[(i + 1) % segments], treadStiffness));
		composite.constraints.push(new DistanceConstraint(composite.particles[i], center, spokeStiffness));
		composite.constraints.push(new DistanceConstraint(composite.particles[i], composite.particles[(i + 5) % segments], treadStiffness));
	}

	this.composites.push(composite);
	return composite;
}