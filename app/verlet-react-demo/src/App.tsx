import { useEffect } from 'react';
import { VerletCanvas, useVerletContext } from 'verlet-react';
import { Vec2, lineSegments, tire } from 'verlet-engine';

// A custom component that consumes the context to add entities.
const DemoScene = () => {
  // Get the engine from the context provided by <VerletCanvas>
  const { engine } = useVerletContext();

  useEffect(() => {
    if (engine) {
      // Clear existing composites to avoid adding them on every re-render
      engine.composites = [];

      // create a line segment
      const segment = lineSegments(engine, [new Vec2(20,300), new Vec2(40,300), new Vec2(60,300), new Vec2(80,300), new Vec2(100,300)], 0.02);
      segment.pin(0);
      segment.pin(4);

      // create a tire
      tire(engine, new Vec2(200, 50), 50, 30, 0.3, 0.9);
    }
  }, [engine]); // This effect runs once when the engine is ready.

  return null; // This component does not render any DOM.
}

function App() {
  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Verlet-React Demo</h1>
      <VerletCanvas width={800} height={500}>
        {/* 
          This is a temporary way to add entities. 
          Later, we will replace this with declarative components like:
          <LineSegments points={[...]} />
          <Tire position={{x: 200, y: 50}} />
        */}
        <DemoScene />
      </VerletCanvas>
    </div>
  )
}

export default App;
