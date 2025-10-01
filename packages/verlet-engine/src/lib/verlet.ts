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

import { Vec2 } from './vec2';
import { DistanceConstraint, PinConstraint, AngleConstraint } from './constraint';
import type { ParticleStyle } from './types';


/**
 * Represents a simple particle in the physics simulation.
 */
export class Particle {
	/** Current position of the particle. @type {Vec2} */
	pos: Vec2;
	/** Position of the particle in the previous frame, used to calculate velocity. @type {Vec2} */
	lastPos: Vec2;
  /** Optional style for rendering */
  style?: ParticleStyle;

	constructor(pos: Vec2) {
		this.pos = new Vec2().mutableSet(pos);
		this.lastPos = new Vec2().mutableSet(pos);
	}
}

/**
 * A collection of particles and constraints that form a single entity.
 */
export class Composite {
	particles: Particle[] = [];
	constraints: (DistanceConstraint | PinConstraint | AngleConstraint)[] = [];

	/**
	 * Pins a particle in the composite to a specific location.
	 * @param {number} index The index of the particle to pin.
	 * @param {Vec2} [pos] Optional. The position to pin the particle to. If not provided, the particle's current position is used.
	 * @returns {PinConstraint} The created PinConstraint.
	 */
	pin(index: number, pos?: Vec2): PinConstraint {
		pos = pos || this.particles[index].pos;
		const pc = new PinConstraint(this.particles[index], pos);
		this.constraints.push(pc);
		return pc;
	}
}

/**
 * The main class for the headless physics simulation.
 * It manages the simulation state and advances the physics engine.
 */
export class VerletJS {
	/** The width of the simulation world. */
	width: number;
	/** The height of the simulation world. */
	height: number;

	/** Global gravity vector applied to all particles. */
	gravity = new Vec2(0, 0.2);
	/** Friction factor to apply to particle velocities. A value of 1 means no friction. */
	friction = 0.99;
	/** Friction factor applied when a particle is on the ground. */
	groundFriction = 0.8;

	/** A list of all composite entities in the simulation. */
	composites: Composite[] = [];

	/**
	 * Creates a new physics simulation world.
	 * @param {number} width The width of the simulation world.
	 * @param {number} height The height of the simulation world.
	 */
	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
	}

	/**
	 * A function that enforces the simulation boundaries on a particle.
	 * @param {Particle} particle The particle to constrain.
	 */
	bounds = (particle: Particle) => {
		if (particle.pos.y > this.height - 1)
			particle.pos.y = this.height - 1;

		if (particle.pos.x < 0)
			particle.pos.x = 0;

		if (particle.pos.x > this.width - 1)
			particle.pos.x = this.width - 1;
	}

	/**
	 * Advances the simulation by one time step.
	 * @param {number} step The duration of the time step, e.g., 16.
	 */
	frame(step: number) {
		for (const c of this.composites) {
			for (const p of c.particles) {
				const velocity = p.pos.sub(p.lastPos).scale(this.friction);

				if (p.pos.y >= this.height - 1 && velocity.length2() > 0.000001) {
					const m = velocity.length();
					velocity.x /= m;
					velocity.y /= m;
					velocity.mutableScale(m * this.groundFriction);
				}

				p.lastPos.mutableSet(p.pos);
				p.pos.mutableAdd(this.gravity);
				p.pos.mutableAdd(velocity);
			}
		}

		const stepCoef = 1 / step;
		for (const c of this.composites) {
			for (let i = 0; i < step; ++i) {
				for (const constraint of c.constraints) {
					constraint.relax(stepCoef);
                }
            }
		}

		for (const c of this.composites) {
			for (const p of c.particles) {
				this.bounds(p);
            }
		}
	}
}