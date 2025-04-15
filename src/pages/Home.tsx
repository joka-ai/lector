import React, { useState, useEffect } from 'react';
import { BarcodeScanner, Barcode } from '@capacitor-mlkit/barcode-scanning';
import {
 IonCardContent ,IonText, IonCard, IonPage, IonButtons, IonMenuButton, IonContent, IonHeader, IonToolbar,
  IonTitle, IonItem, IonLabel, IonIcon, IonAlert,
  IonButton, IonRow, IonCol,  IonSelect, IonSelectOption
} from '@ionic/react';
import { trash, barcodeOutline } from 'ionicons/icons';
import { procesos } from '../constants/procesos';
import { verificarBarra,guardar } from '../constants/escaneados';
import './Home.css';

import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

import { Filesystem, Directory, Encoding  } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { FileOpener } from '@awesome-cordova-plugins/file-opener';

const Home: React.FC = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [barcodes, setBarcodes] = useState<{ codigo: string, descripcion: string; cantlavados: string;}[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedProceso, setSelectedProceso] = useState<string | undefined>(undefined);
  const [procesosList, setProcesosList] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bienvenida = sessionStorage.getItem("nombre");
  const usuario = sessionStorage.getItem("nombre_cliente");
  const [ultimoCodigoEscaneado, setUltimoCodigoEscaneado] = useState<string | null>(null);
  const [alertHeader, setAlertHeader] = useState("");
  const [nroMov, setNroMov] = useState<string | null>(null);
  

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
     
        if (procesosData.length > 0) {
          setSelectedProceso(procesosData[0].id);
        }

      } catch (error) {
        setError("Hubo un error al cargar los procesos.");
        setAlertHeader("Error");
        setShowAlert(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProcesos();
  }, []);

  const generarPDF = async (lote: string | null = 'lote') => { // Asegúrate de que la función sea async
    const doc = new jsPDF();
    const fecha = new Date();
    const fechaStr = fecha.toLocaleDateString();
    const horaStr = fecha.toLocaleTimeString();
    const empresa = sessionStorage.getItem("nombre_cliente");
    const usuario = sessionStorage.getItem("nombre");
    const correo = sessionStorage.getItem("email");
    const totalPrendas = barcodes.length;
  
    doc.setFontSize(12);
  
    // Agregar el logo desde la ruta /assets/img/logo.png
    const logo = new Image();
    logo.src = 'assets/img/logo.png';  // Asegúrate de que esta ruta sea correcta para tu aplicación
  
    // Esperar a que la imagen del logo esté cargada
    logo.onload = async () => {  // La función onload también puede ser async
      // Agregar el logo en el lado izquierdo (haciendo la imagen más ancha)
      doc.addImage(logo, 'PNG', 10, 10, 50, 30); // x, y, ancho, alto (ancho más grande)
  
      // Ahora añadir el texto del lote al lado derecho
      doc.text(`Lote Nº: ${lote}`, 200, 20, { align: 'right' });
      doc.text(`Fecha: ${fechaStr}`, 200, 30, { align: 'right' });
      doc.text(`Hora: ${horaStr}`, 200, 40, { align: 'right' });
  
      doc.setFontSize(14);
      doc.text('Registro de prendas', 105, 60, { align: 'center' });
  
      doc.setFontSize(12);
      const procesoTexto = procesosList.find(p => p.id === selectedProceso)?.descripcion || '---';
      doc.text(`Proceso: ${procesoTexto}`, 20, 70);
      doc.text(`Empresa: ${empresa}`, 20, 80);
      doc.text(`Usuario: ${usuario} (${correo})`, 20, 90);
  
      const headers = [['Código', 'Descripción', 'Cantidad de lavados']];
      const rows = barcodes.map(b => [b.codigo, b.descripcion, b.cantlavados]);
  
      autoTable(doc, {
        startY: 95,
        head: headers,
        body: rows,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 10 },
        headStyles: { fillColor: [220, 220, 220] },
        columnStyles: {
          0: { halign: 'right' },   // Código centrado
          1: { halign: 'left' },     // Descripción izquierda
          2: { halign: 'right' },    // Cantidad derecha
        },
        didParseCell: function (data) {
          if (data.section === 'head') {
            if (data.column.index === 0) {
              data.cell.styles.halign = 'right';
            } else if (data.column.index === 1) {
              data.cell.styles.halign = 'left';
            } else if (data.column.index === 2) {
              data.cell.styles.halign = 'right';
            }
          }
        }
      });
         // Total de prendas
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.text(`Total de prendas: ${totalPrendas}`, 20, finalY + 10);

// Posicionar la firma al final de la página actual
const pageHeight = doc.internal.pageSize.getHeight();
let firmaY = pageHeight - 40; // 40px desde el borde inferior

// Dibujar líneas
doc.line(40, firmaY, 100, firmaY);   // Línea Firma
doc.line(120, firmaY, 200, firmaY);  // Línea Aclaración

// Texto debajo, centrado
doc.text('Firma', 70, firmaY + 6, { align: 'center' });
doc.text('Aclaración', 160, firmaY + 6, { align: 'center' });

  // 🔥 Acá recién generamos el PDF una vez que todo se cargó
  const pdfBlob = await doc.output('blob');
  const reader = new FileReader();

  reader.onloadend = async () => {
    const base64data = (reader.result as string).split(',')[1];
    const fileName = `registro_prendas_${Date.now()}.pdf`;

    try {
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64data,
        directory: Directory.Data,
      });

      const uri = savedFile.uri; 
      FileOpener.open(uri, 'application/pdf')
      .then(() => console.log('PDF abierto'))
      .catch(err => console.error('Error al abrir PDF:', err));
    } catch (err) {
      console.error('Error al guardar o abrir el archivo:', err);
    }
  };

  reader.readAsDataURL(pdfBlob);
    };
  };
  
  
  
  const handleProcesoChange = (e: any) => {
    setSelectedProceso(e.detail.value);
  };

  const guardarTodos = async () => {
    if (!selectedProceso) {
      setError("Selecciona un proceso antes de guardar.");
      setAlertHeader("Error");
      setShowAlert(true);
      return;
    }
    
  
    let datosAGuardar = barcodes.map((b) => ({
      codigo: b.codigo,
      descripcion: b.descripcion,
    }));
  
  
    try {
      const respuesta = await guardar(datosAGuardar, selectedProceso);
  
      if (respuesta.status) {
        const nromovRecibido = respuesta.data; 
        setNroMov(nromovRecibido); 
        setError("Datos guardados correctamente.");
        setAlertHeader("Éxito");
        setShowAlert(true);
      } else {
        setError(respuesta.message || "Error al guardar.");
        setAlertHeader("Error");
        setShowAlert(true);
        setNroMov(null);
      }
    } catch (error) {
      const mensajeError =
        error instanceof Error ? error.message : "Error desconocido";
      setError(`Ocurrió un error al guardar los datos: ${mensajeError}`);
      setAlertHeader("Error");
      setShowAlert(true);
    }
  };

  const reproducirSonido = (ruta: string) => {
    const audio = new Audio(ruta);
    audio.play();
  };

  const scan = async () => {
    const granted = await requestPermissions();
    if (!granted) {
      setAlertHeader("Error");
      setShowAlert(true);
      return;
    }
  
    // Espera 5 segundos antes de escanear
    setTimeout(async () => {
      const { barcodes: scannedBarcodes } = await BarcodeScanner.scan();
  
      if (scannedBarcodes.length === 0 || !scannedBarcodes[0].rawValue) {
        reproducirSonido("assets/sonidos/error.mp3");
        setError("No se detectó un código válido.");
        setAlertHeader("Error");
        setShowAlert(true);
        return;
      }
  
      const codigo = scannedBarcodes[0].rawValue;
      setUltimoCodigoEscaneado(codigo);
  
      try {
        const resultado = await verificarBarra(codigo);
  
        if (resultado && resultado.status) {
          const clienteid = sessionStorage.getItem("clienteid");
  
          if (resultado.data?.cliente && resultado.data?.cliente.id !== clienteid) {
            reproducirSonido("assets/sonidos/error.mp3");
            setError(`El código pertenece a otro cliente: ${resultado.data.cliente.nombre}`);
            setAlertHeader("Error");
            setShowAlert(true);
            return;
          }
  
          if (resultado.message === "Código encontrado y pertenece al cliente actual") {
            const descripcion = resultado.data?.Descripcion || "Descripción no disponible";
            const cantlavados = resultado.data?.cantlavados || "0";
  
    
            setBarcodes((prev) => {
              const yaExiste = prev.some((b) => b.codigo === codigo);
  
              if (!yaExiste) {
                reproducirSonido("assets/sonidos/bien.mp3");
                
  
                // Volvemos a escanear luego de un segundo
                setTimeout(() => {
                  scan();
                }, 500);
  
                return [...prev, { codigo, descripcion,cantlavados }];
              } else {
                reproducirSonido("assets/sonidos/error.mp3");
                setError(`El código ${codigo} ya fue escaneado.`);
                setAlertHeader("Error");
                setShowAlert(true);
                return prev; // No agregamos nada
              }
            });
  
          } else {
            reproducirSonido("assets/sonidos/error.mp3");
            setError(resultado.message || "Código verificado.");
            setAlertHeader("Error");
            setShowAlert(true);
          }
  
        } else {
          reproducirSonido("assets/sonidos/error.mp3");
          setError(resultado?.message || `El código ${codigo} no fue encontrado.`);
          setAlertHeader("Error");
          setShowAlert(true);
        }
  
      } catch (e) {
        reproducirSonido("assets/sonidos/error.mp3");
        setError("Error al verificar el código");
        setAlertHeader("Error");
        setShowAlert(true);
      }
  
    }, 500); 
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
  header={alertHeader || 'Aviso'}
  message={error || ''}
  buttons={
    alertHeader === 'Éxito' && nroMov // Mostrar los dos botones sólo si fue éxito
      ? [
          {
            text: 'OK',
            role: 'cancel',
            handler: () => {
              setBarcodes([]);
              setNroMov(null);
            },
          },
          {
            text: 'Obtener PDF',
            handler: () => {
              generarPDF(nroMov);
              setBarcodes([]); 
              setNroMov(null);
            },
          },
        ]
      : [
          {
            text: 'OK',
            role: 'cancel',
          },
        ]
  }
/>

          </IonCard>
        </IonContent>
      </IonPage>
    </>
  );
  
};

export default Home;
