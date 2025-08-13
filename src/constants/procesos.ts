import { API_BASE_URL, API_AUTH_HEADERS } from "./config";

export const Barra = async (barra: string, nromov: string) => {
  try {

    const response = await fetch(`${API_BASE_URL}/barra`, {
      method: "POST",
      headers: API_AUTH_HEADERS,
      body: JSON.stringify({barra,nromov}),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al verificar el código de barra");
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Error al verificar el código de barra:", error instanceof Error ? error.message : error);
    throw error;
  }
};

export const procesos = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/procesos`, {
      method: "POST",
      headers: {
        ...API_AUTH_HEADERS,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.message || "Error en la solicitud";
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (data.status && data.data && Array.isArray(data.data)) {
      return data.data;
    } else {
      throw new Error("No se encontraron registros.");
    }
  } catch (error) {
    console.error("Error en la solicitud de procesos:", error);
    throw error;
  }
};

export const proceso_cliente = async (cliente: string, fecha: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/proceso_cliente`, {
      method: "POST",
      headers: API_AUTH_HEADERS,
      body: JSON.stringify({ cliente, fecha }), // Enviar tanto cliente como fecha
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.message || "Error en la solicitud";
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (data.status && data.data && Array.isArray(data.data)) {
      return data.data;
    } else {
      throw new Error("No se encontraron registros.");
    }
  } catch (error) {
    console.error("Error en la solicitud de procesos:", error);
    throw error;
  }
};


export const proceso = async (nromov: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/proceso`, {
      method: "POST",
      headers: API_AUTH_HEADERS,
      body: JSON.stringify({ nromov }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.message || "Error en la solicitud";
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (data.status && data.data && Array.isArray(data.data)) {
      return data.data;
    } else {
      throw new Error("No se encontraron registros.");
    }
  } catch (error) {
    console.error("Error en la solicitud de procesos:", error);
    throw error;
  }
};


export const cliente = async (cliente: string): Promise<{ id: string, nombre: string }[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cliente`, {
      method: "POST",
      headers: API_AUTH_HEADERS,
      body: JSON.stringify({ cliente }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.message || "Error en la solicitud";
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (data.status && data.data && Array.isArray(data.data)) {
      // Mapea los datos para devolver id y nombre
      return data.data.map((item: any) => ({
        id: item.ID,
        nombre: item.Nombre
      }));
    } else {
      throw new Error("No se encontraron registros.");
    }
  } catch (error) {
    console.error("Error al buscar clientes:", error);
    throw error;
  }
};

