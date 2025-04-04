import { API_BASE_URL, API_AUTH_HEADERS } from "./config";

export const verificarBarra = async (barra: string) => {
  try {
    if (!barra) {
      throw new Error("No escaneó código de barra");
    }

    // Obtener clienteid desde sessionStorage
    const cliente = sessionStorage.getItem("clienteid");

    if (!cliente) {
      throw new Error("No hay clienteid en la sesión");
    }

    const response = await fetch(`${API_BASE_URL}/verificarBarra`, {
      method: "POST",
      headers: API_AUTH_HEADERS,
      body: JSON.stringify({ barra, cliente }),
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

export const guardar = async (
  barcodes: { codigo: string; descripcion: string }[],
  procesoId: string
) => {
  try {
    if (!barcodes || barcodes.length === 0) {
      throw new Error("No hay códigos para guardar.");
    }

    const cliente = sessionStorage.getItem("clienteid");
    const email = sessionStorage.getItem("email");
    const operador = sessionStorage.getItem("operador");

    const payload = {
      barcodes,
      proceso: procesoId,
      cliente,
      email,
      operador,
    };

    const response = await fetch(`${API_BASE_URL}/guardarEscaneados`, {
      method: "POST",
      headers: API_AUTH_HEADERS,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al guardar los datos.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(
      "Error al guardar los códigos escaneados:",
      error instanceof Error ? error.message : error
    );
    throw error;
  }
};
