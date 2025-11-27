# verlet-react

A React wrapper library for `verlet-engine`, providing declarative components to easily integrate 2D Verlet physics simulations into your React applications.

**[Live Documentation](https://verlet.pages.dev/)**

## Installation

```bash
npm install verlet-react verlet-engine
# or
yarn add verlet-react verlet-engine
```

## Usage

```typescript
import { VerletCanvas, LineSegments, Point, Cloth, Tire } from 'verlet-react';
import { Vec2 } from 'verlet-engine';

function App() {
  return (
    <VerletCanvas width={800} height={500}>
      <Point position={new Vec2(100, 100)} />
      <LineSegments
        vertices={[
          new Vec2(20, 300),
          new Vec2(40, 300),
          new Vec2(60, 300),
          new Vec2(80, 300),
          new Vec2(100, 300),
        ]}
        stiffness={0.02}
        pins={[0, 4]}
      />
      <Cloth
        origin={new Vec2(400, 100)}
        width={150}
        height={100}
        segments={10}
        pinMod={3}
        stiffness={0.1}
      />
      <Tire
        origin={new Vec2(600, 300)}
        radius={50}
        segments={20}
        spokeStiffness={0.3}
        treadStiffness={0.9}
      />
    </VerletCanvas>
  );
}

export default App;
```

## Components

-   `<VerletCanvas width={number} height={number}>`: The main component that sets up the Verlet physics simulation and provides a canvas for rendering. All other Verlet components should be children of `VerletCanvas`.
-   `<Point position={Vec2}>`: Renders a single particle at the given position.
-   `<LineSegments vertices={Vec2[]} stiffness={number} [pins={number[]}]>`: Renders a series of particles connected by distance constraints, forming a line. `pins` is an optional array of indices to pin specific particles.
-   `<Cloth origin={Vec2} width={number} height={number} segments={number} pinMod={number} stiffness={number}>`: Renders a cloth-like structure.
-   `<Tire origin={Vec2} radius={number} segments={number} spokeStiffness={number} treadStiffness={number}>`: Renders a tire-like structure.

## Hooks

-   `useVerlet()`: A hook to initialize and manage the Verlet physics engine.
-   `useVerletContext()`: A hook to access the Verlet engine instance from within components nested inside `VerletCanvas`.

## Types

-   `Vec2`: A 2D vector type from `verlet-engine`.

## Contributing

Contributions are very welcome! If you have any suggestions, bug reports, or want to contribute code, please feel free to open an issue or a pull request on the [GitHub repository](https://github.com/Franklin-hyriol/verletjs.git).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.