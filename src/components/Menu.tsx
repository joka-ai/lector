import React from 'react';
import { useHistory, useLocation } from 'react-router';
import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
} from '@ionic/react';

import { homeOutline, logOutOutline } from 'ionicons/icons';

import './Menu.css';

const Menu: React.FC = () => {
  const location = useLocation();
  const history = useHistory();

  const handleLogout = () => {
    // 🔥 Borra las variables de sesión (ajustá esto según tu almacenamiento)
    sessionStorage.clear(); // o localStorage.clear() si usás localStorage

    // 👉 Redirige al login
    history.replace('/login');
  };

  return (
    <IonMenu contentId="main">
      <IonContent>
        <IonList lines="none">
          <IonListHeader>Menu</IonListHeader>

          {/* Escaneados (Home) */}
          <IonMenuToggle autoHide={false}>
            <IonItem
              routerLink="/home"
              routerDirection="none"
              className={location.pathname === '/home' ? 'selected' : ''}
            >
              <IonIcon slot="start" icon={homeOutline} />
              <IonLabel>Escaneados</IonLabel>
            </IonItem>
          </IonMenuToggle>

          {/* Cerrar sesión */}
          <IonItem button onClick={handleLogout}>
            <IonIcon slot="start" icon={logOutOutline} />
            <IonLabel>Cerrar sesión</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
