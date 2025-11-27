import { VerletCanvas, Point, DistanceConstraint, AngleConstraint, PlaneConstraint } from 'verlet-react';
import { Vec2 } from 'verlet-engine';

export const AdvancedShapesPage = () => {
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  return (
    <VerletCanvas
      width={canvasWidth}
      height={canvasHeight}
      options={{ gravity: new Vec2(0, 0.5), friction: 0.98 }}
    >
      {/* A rigid pendulum structure */}
      <Point id="p1" pos={new Vec2(canvasWidth / 2, 100)} pinned={true} />
      <Point id="p2" pos={new Vec2(canvasWidth / 2, 150)} />
      <Point id="p3" pos={new Vec2(canvasWidth / 2, 200)} />

      {/* Constraints to link the points */}
      <DistanceConstraint from="p1" to="p2" />
      <DistanceConstraint from="p2" to="p3" />

      {/* Angle constraint to keep it rigid */}
      <AngleConstraint from="p1" center="p2" to="p3" stiffness={1} />

      {/* A ground plane */}
      <PlaneConstraint 
        particle="p3" 
        origin={new Vec2(0, canvasHeight - 50)} 
        normal={new Vec2(0, -1)} 
      />

    </VerletCanvas>
  );
};
