import React, { useState } from 'react';
import { useHistory } from "react-router-dom";

import {
  IonPage,
  IonContent,
  IonRow,
  IonCol,
  IonButton,
  IonList,
  IonItem,
  IonCard,
  IonInput,
  IonText,
  IonImg,
} from '@ionic/react';
import { login } from "../constants/login";
import './Login.css';

const Login: React.FC = () => {
  const history = useHistory();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (username === '' || password === '') {
      setErrorMessage('Por favor, ingrese usuario y contraseña');
      return;
    }

    try {
      const response = await login(username, password);
      if (response && response.status && response.status.clienteid) {
        history.replace("/home");
        setErrorMessage("");
        setUsername("");
        setPassword("");
      } else {
        setErrorMessage("Usuario o contraseña incorrectos");
      }
    } catch (error) {
      console.error('Error en el login:', error);
      setErrorMessage('Ocurrió un error, intente de nuevo');
    }
  };

  return (
<IonPage id="login-page">
  <IonContent fullscreen className="login-content">
    <div className="login-background">
      <div className="login-wrapper">

        {/* Logo afuera del card */}
        <div className="login-logo-container">
          <IonImg src="assets/img/favicon.png" alt="App Logo" className="login-logo" />
        </div>

        <IonCard className="login-card">
          <form noValidate onSubmit={handleLogin} className="login-form">
            <IonList>
              <IonItem>
                <IonInput
                  label="Username"
                  labelPlacement="stacked"
                  color="primary"
                  name="username"
                  type="text"
                  value={username}
                  spellCheck={false}
                  autocapitalize="off"
                  onIonInput={(e) => setUsername(e.detail.value as string)}
                  required
                ></IonInput>
              </IonItem>

              <IonItem>
                <IonInput
                  label="Password"
                  labelPlacement="stacked"
                  color="primary"
                  name="password"
                  type="password"
                  value={password}
                  onIonInput={(e) => setPassword(e.detail.value as string)}
                  required
                ></IonInput>
              </IonItem>
            </IonList>

            {errorMessage && (
              <IonText color="danger" className="error-message">
                <p>{errorMessage}</p>
              </IonText>
            )}

            <IonRow className="login-button-container">
              <IonCol>
                <IonButton type="submit" expand="block" className="login-button">
                  Iniciar sesión
                </IonButton>
              </IonCol>
            </IonRow>
          </form>
        </IonCard>
      </div>
    </div>
  </IonContent>
</IonPage>

  );
};

export default Login;
