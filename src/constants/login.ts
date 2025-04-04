import { API_BASE_URL, API_AUTH_HEADERS } from "./config";

export const login = async (email: string, password: string, uuid: string = '') => {
  try {
    if (!email || !password) {
      throw new Error("El correo electrónico y la contraseña son obligatorios");
    }

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: API_AUTH_HEADERS,
      body: JSON.stringify({ email, password, uuid }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error en el inicio de sesión");
    }

    const data = await response.json();

    // Guardar en sessionStorage
    if (data.status) {
      sessionStorage.setItem("clienteid", data.status.clienteid);
      sessionStorage.setItem("nombre", data.status.nombre);
      sessionStorage.setItem("nombre_cliente", data.status.nombre_cliente);
      sessionStorage.setItem("email", email);
      sessionStorage.setItem("operador", data.status.Operador_Ult_Mod);
    }

    return data;

  } catch (error) {
    console.error("Error en el inicio de sesión:", error instanceof Error ? error.message : error);
    throw error;
  }
};


