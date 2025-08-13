import React, { useEffect, useState } from 'react';
import {
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardContent,
  IonText,
  IonList,
  IonIcon,
  IonButton,
  IonSpinner
} from '@ionic/react';
import { cliente, proceso_cliente, proceso,Barra } from '../constants/procesos';
import { trash, barcodeOutline } from 'ionicons/icons';
import { BarcodeScanner, Barcode } from '@capacitor-mlkit/barcode-scanning';

const Inventory: React.FC = () => {
  //filtro
  const [nombreCliente, setNombreCliente] = useState('');
  const [idCliente, setIdCliente] = useState<string | null>(null);
  const [clientesFiltrados, setClientesFiltrados] = useState<{ id: string; nombre: string }[]>([]);
  const [nrosMov, setNrosMov] = useState<any[]>([]);
  const [nroSeleccionado, setNroSeleccionado] = useState<string>('');
  const [infoProceso, setInfoProceso] = useState<any[]>([]);
  const [loadingCliente, setLoadingCliente] = useState(false);
  const [loadingMov, setLoadingMov] = useState(false);
  const [clienteSeleccionadoManualmente, setClienteSeleccionadoManualmente] = useState(false);
  const [fecha, setFecha] = useState('');
  const [nroMovimientoManual, setNroMovimientoManual] = useState('');
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [mostrarTabla, setMostrarTabla] = useState(true); 
  ///escaneo
 const [isSupported, setIsSupported] = useState(false);
  const [barcodes, setBarcodes] = useState<{ codigo: string, descripcion: string; cantlavados: string;}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ultimoCodigoEscaneado, setUltimoCodigoEscaneado] = useState<string | null>(null);


  useEffect(() => {
    const buscarClientes = async () => {
      if (clienteSeleccionadoManualmente || nombreCliente.length < 3) {
        setClientesFiltrados([]);
        return;
      }
      setLoadingCliente(true);
      try {
        const resultado = await cliente(nombreCliente);
        setClientesFiltrados(resultado);
      } catch (error) {
        console.error("Error al buscar clientes:", error);
        setClientesFiltrados([]);
      } finally {
        setLoadingCliente(false);
      }
    };
    buscarClientes();
  }, [nombreCliente, clienteSeleccionadoManualmente]);

  const formatearFecha = (val: string) => {
    const limpio = val.replace(/[^\d]/g, '').slice(0, 8);
    const partes = limpio.match(/(\d{0,2})(\d{0,2})(\d{0,4})/);
    return !partes ? '' : [partes[1], partes[2], partes[3]].filter(Boolean).join('/');
  };

  const requestPermissions = async (): Promise<boolean> => {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  };

  const reproducirSonido = (ruta: string) => {
    const audio = new Audio(ruta);
    audio.play();
  };

  const scan = async () => {
    const granted = await requestPermissions();
    if (!granted) return;
  
    setTimeout(async () => {
      const { barcodes: scannedBarcodes } = await BarcodeScanner.scan();
      if (scannedBarcodes.length === 0 || !scannedBarcodes[0].rawValue) {
        reproducirSonido("assets/sonidos/error.mp3");
        return;
      }
  
      const codigo = scannedBarcodes[0].rawValue;
      setUltimoCodigoEscaneado(codigo);
  
      try {
        const nromov = nroSeleccionado || nroMovimientoManual;
const resultado = await Barra(codigo, nromov);

  
        if (resultado?.status && resultado.message === "Código encontrado") {
          const clienteid = sessionStorage.getItem("clienteid");
  
          if (resultado.data?.cliente?.id !== clienteid) {
            reproducirSonido("assets/sonidos/error.mp3");
            return;
          }
  
          // Buscar en la infoProceso si el código existe
          const encontrado = infoProceso.find(item => item.codigo === codigo);
  
          if (!encontrado) {
            reproducirSonido("assets/sonidos/error.mp3");
            return;
          }
  
          setBarcodes(prev => {
            const index = prev.findIndex(b => b.codigo === codigo);
            const cantidadPermitida = parseInt(encontrado.cantlavados, 10);
  
            if (index !== -1) {
              // Ya escaneado antes
              const actual = prev[index];
              const nuevaCantidad = parseInt(actual.cantlavados, 10) + 1;
  
              if (nuevaCantidad > cantidadPermitida) {
                reproducirSonido("assets/sonidos/error.mp3");
                return prev; // No sumamos más de lo permitido
              }
  
              const actualizado = [...prev];
              actualizado[index] = { ...actual, cantlavados: nuevaCantidad.toString() };
              reproducirSonido("assets/sonidos/bien.mp3");
  
              setTimeout(() => scan(), 500);
              return actualizado;
            } else {
              // Primer escaneo de este código
              reproducirSonido("assets/sonidos/bien.mp3");
  
              setTimeout(() => scan(), 500);
              return [...prev, {
                codigo,
                descripcion: encontrado.descripcion,
                cantlavados: '1'
              }];
            }
          });
  
        } else {
          reproducirSonido("assets/sonidos/error.mp3");
        }
  
      } catch (e) {
        reproducirSonido("assets/sonidos/error.mp3");
      }
    }, 500);
  };
  
    
  useEffect(() => {
    const cargarMovimientos = async () => {
      if (idCliente && fecha) {
        setLoadingMov(true);
        try {
          const resultado = await proceso_cliente(idCliente, fecha);
          setNrosMov(resultado);
          setNroSeleccionado('');
          setInfoProceso([]);
        } catch (error) {
          setNrosMov([]);
        } finally {
          setLoadingMov(false);
        }
      }
    };
    cargarMovimientos();
  }, [idCliente, fecha]);

  useEffect(() => {
    const cargarProceso = async (nro: string) => {
      try {
        const resultado = await proceso(nro);
        setInfoProceso(resultado);
        setNoEncontrado(resultado.length === 0);
      } catch (error) {
        setInfoProceso([]);
        setNoEncontrado(true);
      }
    };

    if (nroSeleccionado) {
      cargarProceso(nroSeleccionado);
    }
  }, [nroSeleccionado]);

  useEffect(() => {
    const cargarProcesoManual = async () => {
      if (nroMovimientoManual.trim() !== '') {
        try {
          const resultado = await proceso(nroMovimientoManual);
          setInfoProceso(resultado);
          setNoEncontrado(resultado.length === 0);
        } catch (error) {
          setInfoProceso([]);
          setNoEncontrado(true);
        }
      }
    };

    cargarProcesoManual();
  }, [nroMovimientoManual]);

  return (
    <IonCard>
      <IonCardContent>

        <IonItem>
        <IonLabel position="floating" style={{ marginBottom: '10px' }}>Cliente</IonLabel>
          <IonInput
            value={nombreCliente}
            onIonInput={(e) => {
              setNombreCliente(e.detail.value!);
              setClienteSeleccionadoManualmente(false);
            }}
          />
        </IonItem>

        {nombreCliente.length >= 3 && (
          <>
            {loadingCliente && <IonText>Buscando clientes... <IonSpinner name="dots" /></IonText>}
            {!loadingCliente && clientesFiltrados.length > 0 && (
              <IonList>
                {clientesFiltrados.map((cli, i) => (
                  <IonItem key={i} button onClick={() => {
                    setNombreCliente(cli.nombre);
                    setIdCliente(cli.id);
                    setClienteSeleccionadoManualmente(true);
                  }}>
                    {cli.nombre}
                  </IonItem>
                ))}
              </IonList>
            )}
            {!loadingCliente && clientesFiltrados.length === 0 && !clienteSeleccionadoManualmente && (
              <IonText color="danger">No se encontraron resultados.</IonText>
            )}
          </>
        )}

        <IonItem>
          <IonLabel position="floating" style={{ marginBottom: '15px' }}>Fecha</IonLabel>
          <IonInput
            type="text"
            value={fecha}
            onIonInput={(e) => setFecha(formatearFecha(e.detail.value!))}
            placeholder="dd/mm/yyyy"
          />
        </IonItem>

        <IonItem>
          <IonLabel>Movimientos</IonLabel>
          <IonSelect
            value={nroSeleccionado}
            placeholder={loadingMov ? "Cargando..." : "Selecciona NroMov"}
            onIonChange={e => setNroSeleccionado(e.detail.value)}
            disabled={loadingMov || !idCliente || !fecha}
          >
            {nrosMov.length > 0 ? (
              nrosMov.map((mov, index) => (
                <IonSelectOption key={index} value={mov.nromov}>
                  {mov.nromov} - {mov.Nombre} - {mov.fecha_Alta}
                </IonSelectOption>
              ))
            ) : (
              <IonSelectOption disabled>No hay movimientos disponibles</IonSelectOption>
            )}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="floating" style={{ marginBottom: '15px' }}>Ingresar NroMovimiento directamente</IonLabel>
          <IonInput
            value={nroMovimientoManual}
            onIonInput={(e) => setNroMovimientoManual(e.detail.value!)}
            placeholder="Ej: 123456"
          />
        </IonItem>

        {noEncontrado && (
          <IonText color="danger">No se encontró información para ese número de movimiento.</IonText>
        )}

{infoProceso.length > 0 && (
          <>
            <IonItem lines="none" button onClick={() => setMostrarTabla(prev => !prev)}>
              <IonLabel>{mostrarTabla ? 'Ocultar' : 'Mostrar'} Información del Proceso</IonLabel>
            </IonItem>

            {mostrarTabla && (
          <IonCard style={{ marginTop: '16px' }}>
            <IonCardContent>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>ID Barra</th>
                    <th>Descripción</th>
                    <th>Cant. Lavados</th>
                  </tr>
                </thead>
                <tbody>
                  {infoProceso.map((item, i) => (
                    <tr key={i}>
                      <td>{item.ID_barra}</td>
                      <td>{item.Descripcion}</td>
                      <td>{item.cantlavados}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </IonCardContent>
          </IonCard>
         )}
         </>
       )}

       <IonButton expand="full" onClick={scan} disabled={!isSupported || isLoading} color="primary" style={{ borderRadius: '8px', padding: '12px' }}>
                     <IonIcon slot="start" />
                     <span>Escanear</span>
                   </IonButton>
         
                
       {ultimoCodigoEscaneado && (
         <IonCard color="tertiary" style={{ marginTop: '20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}>
           <IonCardContent style={{ display: 'flex', alignItems: 'center' }}>
             <IonIcon icon={barcodeOutline} style={{ fontSize: '22px', marginRight: '10px' }} />
             <IonText style={{ color: 'white' }}>
               <strong>Último escaneado:</strong>&nbsp;
               <span style={{ color: 'white', fontWeight: 'bold' }}>{ultimoCodigoEscaneado}</span>
             </IonText>
           </IonCardContent>
         </IonCard>
       )}

              <div style={{ marginTop: '20px' }}>
              
                     <table style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
                       <thead style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
                         <tr>
                           <th style={{ padding: '12px', fontWeight: 'bold' }}>Código</th>
                           <th style={{ padding: '12px', fontWeight: 'bold' }}>Descripción</th>
                           <th style={{ padding: '12px', fontWeight: 'bold' }}>Lavados</th>
                         </tr>
                       </thead>
                       <tbody>
                         {barcodes.map((item, index) => (
                           <tr key={index} style={{ borderBottom: '1px solid #f2f2f2' }}>
                             <td style={{ padding: '12px' }}>{item.codigo}</td>
                             <td style={{ padding: '12px' }}>{item.descripcion}</td>
                             <td style={{ padding: '12px' }}>
                             
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
      </IonCardContent>
    </IonCard>
  );
};

export default Inventory;
