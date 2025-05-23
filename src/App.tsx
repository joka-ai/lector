import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  IonSplitPane,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import Menu from './components/Menu';
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';



/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  const isAuthenticated = !!sessionStorage.getItem('clienteid');

  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId="main">
          {isAuthenticated && <Menu />} {/* solo mostrar si está logueado */}
          <IonRouterOutlet id="main">
            <Route path="/login" component={Login} exact />
            <PrivateRoute path="/home" component={Home} exact />
            <Redirect exact from="/" to="/login" />
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};


export default App;
