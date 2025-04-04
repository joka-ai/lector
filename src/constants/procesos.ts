import { API_BASE_URL, API_AUTH_HEADERS } from "./config";

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
