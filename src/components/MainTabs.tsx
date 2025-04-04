import React from 'react';
import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/react';
import { Route, Redirect } from 'react-router';
import { calendar, informationCircle } from 'ionicons/icons';

import Home from '../pages/Home';

interface MainTabsProps {}

const MainTabs: React.FC<MainTabsProps> = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        {/* Ruta principal */}
        <Route path="/home"  exact />
        
        {/* Redirección por defecto (por si entran a / directamente) */}
        <Redirect exact from="/" to="/home" />
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="escanear" href="/home">
          <IonIcon icon={calendar} />
          <IonLabel>Escanear</IonLabel>
        </IonTabButton>

        <IonTabButton tab="cerrarsesion" href="/home">
          <IonIcon icon={informationCircle} />
          <IonLabel>Cerrar Sesión</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default MainTabs;
