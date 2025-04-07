import React, { useState, useEffect } from 'react';
import { BarcodeScanner, Barcode } from '@capacitor-mlkit/barcode-scanning';
import {
 IonCardContent ,IonText, IonCard, IonPage, IonButtons, IonMenuButton, IonContent, IonHeader, IonToolbar,
  IonTitle, IonItem, IonLabel, IonInput, IonFabButton, IonIcon, IonAlert,
  IonButton, IonRow, IonCol, IonGrid, IonSelect, IonSelectOption
} from '@ionic/react';
import { trash, informationCircle, barcodeOutline } from 'ionicons/icons';
import { procesos } from '../constants/procesos';
import { verificarBarra,guardar } from '../constants/escaneados';


const Home: React.FC = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [barcodes, setBarcodes] = useState<{ codigo: string, descripcion: string }[]>([]);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [showAlert, setShowAlert] = useState(false);
  const [selectedProceso, setSelectedProceso] = useState<string | undefined>(undefined);
  const [procesosList, setProcesosList] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bienvenida = sessionStorage.getItem("nombre");
  const usuario = sessionStorage.getItem("nombre_cliente");
  const [ultimoCodigoEscaneado, setUltimoCodigoEscaneado] = useState<string | null>(null);


  useEffect(() => {
    const checkSupport = async () => {
      const result = await BarcodeScanner.isSupported();
      setIsSupported(result.supported);
    };
    checkSupport();
  }, []);

  useEffect(() => {
    const fetchProcesos = async () => {
      setIsLoading(true);
      try {
        const procesosData = await procesos();
        setProcesosList(procesosData);
      } catch (error) {
        setError("Hubo un error al cargar los procesos.");
        setShowAlert(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProcesos();
  }, []);
  

  const handleProcesoChange = (e: any) => {
    setSelectedProceso(e.detail.value);
  };

  const guardarTodos = async () => {
    if (!selectedProceso) {
      setMensaje("Selecciona un proceso antes de guardar.");
      return;
    }
  
    let datosAGuardar = barcodes.map((b) => ({
      codigo: b.codigo,
      descripcion: b.descripcion,
    }));
  
  
    try {
      const respuesta = await guardar(datosAGuardar, selectedProceso);
  
      if (respuesta.status) {
        setMensaje("Datos guardados correctamente.");
        setBarcodes([]); // Vaciar la lista después de guardar
      } else {
        setMensaje(respuesta.message || "Error al guardar.");
      }
    } catch (error) {
      const mensajeError =
        error instanceof Error ? error.message : "Error desconocido";
      setError(`Ocurrió un error al guardar los datos: ${mensajeError}`);
      setShowAlert(true);
    }
  };

  
  const scan = async () => {
    const granted = await requestPermissions();
    if (!granted) {
      setShowAlert(true);
      return;
    }
  
    const { barcodes: scannedBarcodes } = await BarcodeScanner.scan();
  
    if (scannedBarcodes.length === 0 || !scannedBarcodes[0].rawValue) {
      setError("No se detectó un código válido.");
      setShowAlert(true);
      return;
    }
  
    const codigo = scannedBarcodes[0].rawValue;
    setUltimoCodigoEscaneado(codigo);

  
    try {
      const resultado = await verificarBarra(codigo);
    
      if (resultado && resultado.status) {
        const clienteid = sessionStorage.getItem("clienteid");
    
        // Si el código pertenece a otro cliente
        if (
          resultado.data?.cliente &&
          resultado.data?.cliente.id !== clienteid
        ) {
          setMensaje(`El código pertenece a otro cliente: ${resultado.data.cliente.nombre}`);
          return; // NO lo agregamos a la tabla
        }
    
        // Si el código pertenece al cliente actual
        if (resultado.message === "Código encontrado y pertenece al cliente actual") {
          const descripcion = resultado.data?.Descripcion || "Descripción no disponible";
    
          const yaExiste = barcodes.some((b) => b.codigo === codigo);
          if (!yaExiste) {
            setBarcodes((prev) => [...prev, { codigo, descripcion }]);
            setMensaje(`Código ${codigo} agregado correctamente.`);
          } else {
            setMensaje(`El código ${codigo} ya fue escaneado.`);
          }
        } else {
          // fallback por si hay status true pero no encaja con lo anterior
          setMensaje(resultado.message || "Código verificado.");
        }
    
      } else {
        setMensaje(resultado?.message || `El código ${codigo} no fue encontrado.`);
      }
    
    } catch (e) {
      setError("Error al verificar el código");
      setShowAlert(true);
    }
    
  };
  

  const requestPermissions = async (): Promise<boolean> => {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  };

  const deleteAllBarcodes = () => {
    setBarcodes([]);
  };

  const deleteBarcode = (index: number) => {
    setBarcodes((prevBarcodes) => prevBarcodes.filter((_, i) => i !== index));
  };

  return (
    <>
      <IonPage id="about-page" >

        <IonHeader className="ion-no-border">
        <IonToolbar >

            <IonButtons slot="start">
              <IonMenuButton />
              <div style={{ marginLeft: '12px', fontSize: '18px', fontWeight: 'bold' }}>
                HNScan
              </div>
            </IonButtons>
            <IonButtons slot="end">
              {/* Otros botones si los hay */}
            </IonButtons>
          </IonToolbar>
  
          {(bienvenida || usuario) && (
            <div style={{ padding: '8px 16px', background: '#d3d3d3', color: 'black', fontSize: '15px' }}>
              {bienvenida && <span><strong>Bienvenida:</strong> {bienvenida}</span>}
              {bienvenida && usuario && <span> | </span>}
              {usuario && <span><strong>Usuario:</strong> {usuario}</span>}
            </div>
          )}
        </IonHeader>
  
        <IonContent className="ion-padding" style={{ backgroundColor: 'white' }}>

          <IonCard style={{ padding: '20px', backdropFilter: 'blur(10px)', background: 'rgba(255, 255, 255, 0.85)', borderRadius: '16px' }}>
            <IonItem>
              <IonLabel>Procesos</IonLabel>
              <IonSelect value={selectedProceso} placeholder="Selecciona un proceso" onIonChange={handleProcesoChange}>
                {procesosList.map((proceso) => (
                  <IonSelectOption key={proceso.id} value={proceso.id}>
                    {proceso.descripcion}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
  
            <IonButton expand="full" onClick={scan} disabled={!isSupported || isLoading} color="primary" style={{ borderRadius: '8px', padding: '12px' }}>
              <IonIcon slot="start" />
              <span>Escanear</span>
            </IonButton>
  
            {mensaje && (
  <IonCard color="primary" style={{ marginTop: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}>
    <IonCardContent style={{ display: 'flex', alignItems: 'center' }}>
      <IonIcon icon={informationCircle} style={{ fontSize: '22px', marginRight: '10px' }} />
      <IonText color="light">
        <strong>{mensaje}</strong>
      </IonText>
    </IonCardContent>
  </IonCard>
)}

{ultimoCodigoEscaneado && (
  <IonCard color="tertiary" style={{ marginTop: '20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}>
    <IonCardContent style={{ display: 'flex', alignItems: 'center' }}>
      <IonIcon icon={barcodeOutline} style={{ fontSize: '22px', marginRight: '10px' }} />
      <IonText color="dark">
        <strong>Último escaneado:</strong>&nbsp;
        <span style={{ color: 'white', fontWeight: 'bold' }}>{ultimoCodigoEscaneado}</span>
      </IonText>
    </IonCardContent>
  </IonCard>
)}


            <div style={{ marginTop: '20px' }}>
              <IonRow>
                <IonCol size="12">
                  <h2>Escaneados</h2>
                </IonCol>
                <IonCol size="12">
                  <IonButton expand="block" onClick={deleteAllBarcodes} color="danger" style={{ borderRadius: '8px' }}>
                    <IonIcon icon={trash} slot="start" />
                    Borrar Todos
                  </IonButton>
                </IonCol>
                <IonCol size="12">
                  <IonButton expand="block" onClick={guardarTodos} color="success" style={{ borderRadius: '8px' }}>
                    Guardar Todos
                  </IonButton>
                </IonCol>
              </IonRow>
  
              <table style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
                <thead style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
                  <tr>
                    <th style={{ padding: '12px', fontWeight: 'bold' }}>Código</th>
                    <th style={{ padding: '12px', fontWeight: 'bold' }}>Descripción</th>
                    <th style={{ padding: '12px', fontWeight: 'bold' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {barcodes.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f2f2f2' }}>
                      <td style={{ padding: '12px' }}>{item.codigo}</td>
                      <td style={{ padding: '12px' }}>{item.descripcion}</td>
                      <td style={{ padding: '12px' }}>
                        <IonButton color="danger" onClick={() => deleteBarcode(index)} size="small" style={{ borderRadius: '8px' }}>
                          <IonIcon icon={trash} />
                        </IonButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
  
            <IonAlert
              isOpen={showAlert}
              onDidDismiss={() => setShowAlert(false)}
              header={error ? "Error" : "Permiso denegado"}
              message={error ? error : "Por favor concede el permiso de cámara para usar el escáner."}
              buttons={['OK']}
            />
          </IonCard>
        </IonContent>
      </IonPage>
    </>
  );
  
};

export default Home;
