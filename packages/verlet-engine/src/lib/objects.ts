import { VerletJS, Particle, Composite } from './verlet';
import { DistanceConstraint } from './constraint';
import { Vec2 } from './vec2';

/**
 * Creates a new composite containing a single particle.
 * @param {VerletJS} sim The simulation instance.
 * @param {Vec2} pos The position of the particle.
 * @returns {Composite} The created composite.
 */
export function point(sim: VerletJS, pos: Vec2): Composite {
	const composite = new Composite();
	composite.particles.push(new Particle(pos));
	sim.composites.push(composite);
	return composite;
}

/**
 * Creates a new composite containing a line of particles connected by constraints.
 * @param {VerletJS} sim The simulation instance.
 * @param {Vec2[]} vertices An array of points for the line segments.
 * @param {number} stiffness The stiffness of the constraints.
 * @returns {Composite} The created composite.
 */
export function lineSegments(sim: VerletJS, vertices: Vec2[], stiffness: number): Composite {
	const composite = new Composite();

	for (let i = 0; i < vertices.length; i++) {
		composite.particles.push(new Particle(vertices[i]));
		if (i > 0)
			composite.constraints.push(new DistanceConstraint(composite.particles[i], composite.particles[i - 1], stiffness));
	}

	sim.composites.push(composite);
	return composite;
}

/**
 * Creates a new composite representing a piece of cloth.
 * @param {VerletJS} sim The simulation instance.
 * @param {Vec2} origin The center point of the cloth.
 * @param {number} width The width of the cloth.
 * @param {number} height The height of the cloth.
 * @param {number} segments The number of segments.
 * @param {number} pinMod A modifier for pinning particles.
 * @param {number} stiffness The stiffness of the constraints.
 * @returns {Composite} The created composite.
 */
export function cloth(sim: VerletJS, origin: Vec2, width: number, height: number, segments: number, pinMod: number, stiffness: number): Composite {
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

	sim.composites.push(composite);
	return composite;
}

/**
 * Creates a new composite representing a tire.
 * @param {VerletJS} sim The simulation instance.
 * @param {Vec2} origin The center of the tire.
 * @param {number} radius The radius of the tire.
 * @param {number} segments The number of segments.
 * @param {number} spokeStiffness The stiffness of the spokes.
 * @param {number} treadStiffness The stiffness of the tread.
 * @returns {Composite} The created composite.
 */
export function tire(sim: VerletJS, origin: Vec2, radius: number, segments: number, spokeStiffness: number, treadStiffness: number): Composite {
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

	sim.composites.push(composite);
	return composite;
}
