# verlet-engine

A JavaScript/TypeScript library for 2D Verlet physics simulations.

**[Live Documentation](https://verlet.pages.dev/)**

This project is a fork of the original [Verlet.js by Sub Protocol](https://subprotocol.com/system/verlet-hello-world.html). It has been updated to be type-safe with TypeScript and includes modern script practices.

## Installation

```bash
npm install verlet-engine
# or
yarn add verlet-engine
```

## Usage

```typescript
import { VerletJS, Vec2, point, lineSegments } from 'verlet-engine';

const sim = new VerletJS(640, 480);

// Create a point
const p = point(sim, new Vec2(100, 100));

// Create a line segment
const segment = lineSegments(sim, [new Vec2(20,300), new Vec2(40,300), new Vec2(60,300)], 0.02);

// Run the simulation
function animate() {
  sim.frame(16); // Advance the simulation by 16ms
  requestAnimationFrame(animate);
}
animate();
```

## API

-   `VerletJS`: The main simulation class.
-   `Vec2`: A 2D vector class.
-   `Particle`: Represents a particle in the simulation.
-   `Composite`: A collection of particles and constraints.
-   `DistanceConstraint`: A constraint that maintains a fixed distance between two particles.
-   `PinConstraint`: A constraint that fixes a particle's position.
-   `AngleConstraint`: A constraint that maintains a fixed angle between three particles.
-   `point(sim, pos)`: Creates a composite with a single particle.
-   `lineSegments(sim, vertices, stiffness)`: Creates a composite with a line of particles connected by constraints.
-   `cloth(sim, origin, width, height, segments, pinMod, stiffness)`: Creates a composite representing a piece of cloth.
-   `tire(sim, origin, radius, segments, spokeStiffness, treadStiffness)`: Creates a composite representing a tire.

## Contributing

Contributions are very welcome! If you have any suggestions, bug reports, or want to contribute code, please feel free to open an issue or a pull request on the [GitHub repository](https://github.com/Franklin-hyriol/verletjs.git).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.