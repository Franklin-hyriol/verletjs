import { Switch, Route } from 'react-router-dom';
import { LineSegmentsPage } from './pages/LineSegmentsPage';
import { HomePage } from './pages/HomePage';
import { Layout } from './components/Layout/Layout';
import { CustomShapePage } from './pages/CustomShapePage';

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

         <Route path="/custom-shape">
            <CustomShapePage />
          </Route>
      </Switch>
    </Layout>
  );
}

export default App;