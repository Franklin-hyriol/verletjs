import { VerletCanvas, Point, DistanceConstraint } from 'verlet-react';
import { Vec2 } from 'verlet-engine';

export const CustomShapePage = () => {
  return (
    <VerletCanvas
      width={window.innerWidth}
      height={window.innerHeight}
      options={{ gravity: new Vec2(0, 0.5), friction: 0.99 }}
    >
      {/* Define the particles (points) with unique IDs */}
      <Point id="p1" pos={new Vec2(200, 100)} pinned />
      <Point id="p2" pos={new Vec2(250, 100)} />
      <Point id="p3" pos={new Vec2(300, 100)} />
      <Point id="p4" pos={new Vec2(350, 100)} />
      <Point id="p5" pos={new Vec2(400, 100)} />

      {/* Define the constraints that link the particles */}
      <DistanceConstraint from="p1" to="p2" />
      <DistanceConstraint from="p2" to="p3" />
      <DistanceConstraint from="p3" to="p4" />
      <DistanceConstraint from="p4" to="p5" />
    </VerletCanvas>
  );
};
