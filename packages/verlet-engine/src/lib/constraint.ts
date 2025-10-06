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

import type { Particle } from './verlet';
import { Vec2 } from './vec2';
import type { ConstraintStyle } from './types';


/**
 * Constrains two particles to a specific distance from each other.
 */
export class DistanceConstraint {
	/** The first particle. */
	a: Particle;
	/** The second particle. */
	b: Particle;
	/** The required distance between the two particles. */
	distance: number;
	/** The stiffness of the constraint (a value from 0.0 to 1.0). */
	stiffness: number;
	/** Optional style for rendering */
	style?: ConstraintStyle;

	/**
	 * @param a The first particle.
	 * @param b The second particle.
	 * @param stiffness A value from 0.0 to 1.0, where 1.0 is the most stiff.
	 * @param [distance] Optional. The distance to maintain. If not provided, the initial distance between the particles is used.
	 */
	constructor(a: Particle, b: Particle, stiffness: number, distance?: number) {
		this.a = a;
		this.b = b;
		this.distance = typeof distance !== "undefined" ? distance : a.pos.sub(b.pos).length();
		this.stiffness = stiffness;
	}

	/**
	 * Relaxes the constraint, attempting to satisfy it by moving the particles.
	 * @param stepCoef A coefficient for the relaxation step.
	 */
	relax(stepCoef: number) {
		const normal = this.a.pos.sub(this.b.pos);
		const m = normal.length2();
		normal.mutableScale(((this.distance * this.distance - m) / m) * this.stiffness * stepCoef);
		this.a.pos.mutableAdd(normal);
		this.b.pos.mutableSub(normal);
	}

	/**
	 * Draws the constraint on a 2D canvas context.
	 * @param ctx The canvas context to draw on.
	 */
	draw(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.moveTo(this.a.pos.x, this.a.pos.y);
		ctx.lineTo(this.b.pos.x, this.b.pos.y);
		ctx.strokeStyle = this.style?.color || "#d8dde2";
		ctx.lineWidth = this.style?.lineWidth || 1;
		ctx.stroke();
	}
}

/**
 * Constrains two particles to prevent them from overlapping.
 */
export class CollisionConstraint {
	/** The first particle. */
	a: Particle;
	/** The second particle. */
	b: Particle;
	/** The stiffness of the constraint (a value from 0.0 to 1.0). */
	stiffness: number;
	/** Optional style for rendering */
	style?: ConstraintStyle;

	/**
	 * @param a The first particle.
	 * @param b The second particle.
	 * @param stiffness A value from 0.0 to 1.0, where 1.0 is the most stiff.
	 */
	constructor(a: Particle, b: Particle, stiffness: number) {
		this.a = a;
		this.b = b;
		this.stiffness = stiffness;
	}

	/**
	 * Relaxes the constraint, attempting to satisfy it by moving the particles.
	 * @param stepCoef A coefficient for the relaxation step.
	 */
	relax(stepCoef: number) {
		const normal = this.a.pos.sub(this.b.pos);
		const m = normal.length();
		const r1 = this.a.style?.radius || 1;
		const r2 = this.b.style?.radius || 1;
		const minDistance = r1 + r2;

		if (m < minDistance) {
			const diff = (minDistance - m) / m;
			normal.mutableScale(diff * this.stiffness * stepCoef);
			this.a.pos.mutableAdd(normal);
			this.b.pos.mutableSub(normal);
		}
	}

	/**
	 * Draws the constraint on a 2D canvas context.
	 * @param ctx The canvas context to draw on.
	 */
	draw(ctx: CanvasRenderingContext2D) {
		// Collisions are not typically drawn, but you could draw a line for debugging.
		/*
		ctx.beginPath();
		ctx.moveTo(this.a.pos.x, this.a.pos.y);
		ctx.lineTo(this.b.pos.x, this.b.pos.y);
		ctx.strokeStyle = this.style?.color || 'red';
		ctx.lineWidth = this.style?.lineWidth || 1;
		ctx.stroke();
		*/
	}
}

/**
 * Constrains a particle to a fixed point in space.
 */
export class PinConstraint {
	/** The particle to be pinned. */
	a: Particle;
	/** The fixed point in space where the particle is pinned. */
	pos: Vec2;
	/** Optional style for rendering */
	style?: ConstraintStyle;

	/**
	 * @param a The particle to be pinned.
	 * @param pos The position to pin the particle to.
	 */
	constructor(a: Particle, pos: Vec2) {
		this.a = a;
		this.pos = new Vec2().mutableSet(pos);
	}

	/**
	 * Relaxes the constraint by forcing the particle to the pinned position.
	 * @param stepCoef A coefficient for the relaxation step (unused for PinConstraint).
	 */
	relax(stepCoef: number) {
		this.a.pos.mutableSet(this.pos);
	}

	/**
	 * Draws the constraint on a 2D canvas context.
	 * @param ctx The canvas context to draw on.
	 */
	draw(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.style?.radius || 6, 0, 2 * Math.PI);
		ctx.fillStyle = this.style?.color || "rgba(0,153,255,0.1)";
		ctx.fill();
	}
}

/**
 * Constrains the angle between three particles.
 */
export class AngleConstraint {
	/** The first particle of the angle. */
	a: Particle;
	/** The center particle (the vertex of the angle). */
	b: Particle;
	/** The third particle of the angle. */
	c: Particle;
	/** The angle to be maintained (in radians). */
	angle: number;
	/** The stiffness of the constraint (a value from 0.0 to 1.0). */
	stiffness: number;
	/** Optional style for rendering */
	style?: ConstraintStyle;

	/**
	 * @param a The first particle.
	 * @param b The center particle (the vertex of the angle).
	 * @param c The third particle.
	 * @param stiffness A value from 0.0 to 1.0.
	 */
	constructor(a: Particle, b: Particle, c: Particle, stiffness: number) {
		this.a = a;
		this.b = b;
		this.c = c;
		this.angle = this.b.pos.angle2(this.a.pos, this.c.pos);
		this.stiffness = stiffness;
	}

	/**
	 * Relaxes the constraint by rotating the particles to satisfy the.
	 * @param stepCoef A coefficient for the relaxation step.
	 */
	relax(stepCoef: number) {
		let angle = this.b.pos.angle2(this.a.pos, this.c.pos);
		let diff = angle - this.angle;

		if (diff <= -Math.PI)
			diff += 2 * Math.PI;
		else if (diff >= Math.PI)
			diff -= 2 * Math.PI;

		diff *= stepCoef * this.stiffness;

		this.a.pos = this.a.pos.rotate(this.b.pos, diff);
		this.c.pos = this.c.pos.rotate(this.b.pos, -diff);
		this.b.pos = this.b.pos.rotate(this.a.pos, diff);
		this.b.pos = this.b.pos.rotate(this.c.pos, -diff);
	}

	/**
	 * Draws the constraint on a 2D canvas context.
	 * @param ctx The canvas context to draw on.
	 */
	draw(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.moveTo(this.a.pos.x, this.a.pos.y);
		ctx.lineTo(this.b.pos.x, this.b.pos.y);
		ctx.lineTo(this.c.pos.x, this.c.pos.y);
		const tmp = ctx.lineWidth;
		ctx.lineWidth = this.style?.lineWidth || 5;
		ctx.strokeStyle = this.style?.color || "rgba(255,255,0,0.2)";
		ctx.stroke();
		ctx.lineWidth = tmp;
	}
}

/**
 * Constrains two particles to a specific distance from each other.
 */
export class MinMaxDistanceConstraint {
	/** The first particle. */
	a: Particle;
	/** The second particle. */
	b: Particle;
	/** The minimum distance between the two particles. */
	minDistance: number;
	/** The maximum distance between the two particles. */
	maxDistance: number;
	/** The stiffness of the constraint (a value from 0.0 to 1.0). */
	stiffness: number;
	/** Optional style for rendering */
	style?: ConstraintStyle;

	/**
	 * @param a The first particle.
	 * @param b The second particle.
	 * @param stiffness A value from 0.0 to 1.0, where 1.0 is the most stiff.
	 * @param minDistance The minimum distance to maintain.
	 * @param maxDistance The maximum distance to maintain.
	 */
	constructor(a: Particle, b: Particle, minDistance: number, maxDistance: number, stiffness: number) {
		this.a = a;
		this.b = b;
		this.stiffness = stiffness;
		this.minDistance = minDistance;
		this.maxDistance = maxDistance;
	}

	/**
	 * Relaxes the constraint, attempting to satisfy it by moving the particles.
	 * @param stepCoef A coefficient for the relaxation step.
	 */
	relax(stepCoef: number) {
		const normal = this.a.pos.sub(this.b.pos);
		const m = normal.length();
		let diff = 0;

		if (m < this.minDistance) {
			diff = (this.minDistance - m) / m;
		} else if (m > this.maxDistance) {
			diff = (this.maxDistance - m) / m;
		} else {
			return;
		}

		normal.mutableScale(diff * this.stiffness * stepCoef);
		this.a.pos.mutableAdd(normal);
		this.b.pos.mutableSub(normal);
	}

	/**
	 * Draws the constraint on a 2D canvas context.
	 * @param ctx The canvas context to draw on.
	 */
	draw(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.moveTo(this.a.pos.x, this.a.pos.y);
		ctx.lineTo(this.b.pos.x, this.b.pos.y);
		ctx.strokeStyle = this.style?.color || '#d8dde2';
		ctx.lineWidth = this.style?.lineWidth || 1;
		ctx.stroke();
	}
}