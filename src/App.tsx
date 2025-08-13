import { Redirect, Route, useHistory, useLocation } from 'react-router-dom'; // Usar 'useLocation' de react-router-dom
import {
  IonApp,
  IonRouterOutlet,
  IonSplitPane,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useEffect } from 'react';  // Asegúrate de importar useEffect de 'react'
import Home from './pages/Home';
import Login from './pages/Login';
import Menu2 from './pages/Menu2';
import inventory from './pages/Inventory';
import picking from './pages/Picking';
import PrivateRoute from './components/PrivateRoute';
import Menu from './components/Menu';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import './theme/variables.css';

setupIonicReact();

const AppRoutes: React.FC = () => {
  const location = useLocation();  // Aquí usamos 'useLocation' de react-router-dom
  const history = useHistory();  // Usamos 'useHistory' para redirigir
  const isAuthenticated = !!sessionStorage.getItem('clienteid');
  const id_empresa = sessionStorage.getItem("id_empresa");

  console.log('isAuthenticated:', isAuthenticated); // Verifica si el usuario está autenticado
  console.log('id_empresa:', id_empresa); // Verifica el valor de id_empresa

  const hiddenMenuRoutes = ['/picking', '/inventory', '/menu'];
  const shouldShowMenu = isAuthenticated && !hiddenMenuRoutes.includes(location.pathname);

  useEffect(() => {
    if (isAuthenticated) {
      if (id_empresa) {
        console.log('Redirigiendo a /menu');
        history.push('/menu');  // Redirige a /menu
      } else {
        console.log('Redirigiendo a /home');
        history.push('/home');  // Redirige a /home
      }
    } else {
      console.log('Redirigiendo a /login');
      history.push('/login');  // Redirige a /login
    }
  }, [isAuthenticated, id_empresa, history]);

  return (
    <IonSplitPane contentId="main">
      {shouldShowMenu && <Menu />}
      <IonRouterOutlet id="main">
        <Route path="/login" component={Login} exact />
        <PrivateRoute path="/home" component={Home} exact />
        <PrivateRoute path="/menu" component={Menu2} exact />
        <PrivateRoute path="/inventory" component={inventory} exact />
        <PrivateRoute path="/picking" component={picking} exact />
        <Route exact path="/">
          {/* Ya no necesitas redirigir aquí, porque lo estamos haciendo en el useEffect */}
        </Route>
      </IonRouterOutlet>
    </IonSplitPane>
  );
};

const App: React.FC = () => {
  return (
    <IonApp>
      <IonReactRouter>
        <AppRoutes />
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
