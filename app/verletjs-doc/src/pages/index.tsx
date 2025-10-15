import React, { JSX } from 'react';
import Layout from '@theme/Layout';
import HomepageHeader from '@site/src/components/HomepageHeader';
import InteractiveDemo from '@site/src/components/InteractiveDemo';

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