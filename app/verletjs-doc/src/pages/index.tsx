import React from 'react';
import Layout from '@theme/Layout';

export default function Home(): JSX.Element {
  return (
    <Layout
      title={`Accueil`}
      description="Documentation pour verlet.js">
      <main>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', fontSize: '20px' }}>
          <p>
            Bienvenue sur la documentation de verlet.js !
          </p>
        </div>
      </main>
    </Layout>
  );
}