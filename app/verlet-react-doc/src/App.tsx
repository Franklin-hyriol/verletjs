import { VerletCanvas, LineSegments, Cloth, Tire } from 'verlet-react';
import { Vec2 } from 'verlet-engine';

function App() {
  return (
    <div className='text-center bg-gray-800'>
      <h1>Verlet-React Demo</h1>
      <VerletCanvas width={800} height={500}>
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
    </div>
  )
}

export default App;
