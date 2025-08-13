import React from 'react';
import { useHistory } from "react-router-dom";
import {
  IonPage,
  IonContent,
  IonIcon
} from '@ionic/react';
import { cubeOutline, clipboardOutline, layersOutline } from 'ionicons/icons';
import './Menu.css';

const Login: React.FC = () => {
  const history = useHistory();

  const botones = [
    { texto: "Armar Pedido", icono: cubeOutline, color: "#ff6b6b", ruta: "/inventory" },
    { texto: "Picking", icono: clipboardOutline, color: "#4ecdc4", ruta: "/inventory" },
    { texto: "Inventario", icono: layersOutline, color: "#1a73e8", ruta: "/inventory" },
  ];

  return (
    <IonPage id="login-page">
      <IonContent fullscreen>
        <div className="fondo-login">
          <div className="contenedor-botones">
            {botones.map((btn, index) => (
              <div
                key={index}
                className="boton-cuadro"
                style={{ backgroundColor: btn.color }}
                onClick={() => history.push(btn.ruta)}  // Redirige siempre a /inventory
              >
                <IonIcon icon={btn.icono} style={{ fontSize: "48px", color: "white" }} />
                <div className="texto-btn">{btn.texto}</div>
              </div>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
