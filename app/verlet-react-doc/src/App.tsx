import { Switch, Route } from 'react-router-dom';
import { LineSegmentsPage } from './pages/LineSegmentsPage';
import { HomePage } from './pages/HomePage';
import { Layout } from './components/Layout/Layout';

function App() {
  return (
    <Layout>
      <Switch>
        <Route exact path="/">
          <HomePage />
        </Route>
        <Route path="/line-segments">
          <LineSegmentsPage />
        </Route>
      </Switch>
    </Layout>
  );
}

export default App;