import React, { JSX } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { VerletCanvas, LineSegments } from 'verlet-react';
import { Vec2 } from 'verlet-engine';

function HomepageHeader() {
  return (
    <header style={{ padding: '4rem 0', textAlign: 'center' }}>
      <div className="container">
        <h1 style={{ fontSize: '4rem' }}>Verlet.js</h1>
        <p style={{ fontSize: '1.5rem' }}>A simple and powerful 2D Verlet physics engine for JavaScript and React.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link
            className="button button--secondary button--lg"
            to="/intro">
            Get Started
          </Link>
          <Link
            className="button button--secondary button--lg"
            href="https://github.com/Franklin-hyriol/verletjs">
            GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

function InteractiveDemo() {
  return (
    <div style={{ height: '400px', width: '100%', maxWidth: '600px', margin: '0 auto', border: '1px solid #ccc', borderRadius: '8px' }}>
      <VerletCanvas width={600} height={400}>
        <LineSegments
          vertices={[
            new Vec2(100, 100),
            new Vec2(200, 100),
            new Vec2(300, 100),
            new Vec2(400, 100),
            new Vec2(500, 100),
          ]}
          pins={[0, 4]}
          stiffness={0.5}
        />
      </VerletCanvas>
    </div>
  );
}

export default function Home(): JSX.Element {
  return (
    <Layout
      title={`Accueil`}
      description="A simple and powerful 2D Verlet physics engine for JavaScript and React.">
      <HomepageHeader />
      <main>
        <InteractiveDemo />
      </main>
    </Layout>
  );
}