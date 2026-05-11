const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export const login = async (loginVal, password) => {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ login: loginVal, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Identifiants incorrects");
  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getRedirectByRole = (role) => {
  switch (role) {
    case "secretaire":   return "/secretaire";
    case "medecin_chef": return "/medecin";
    case "admin":        return "/admin";
    case "sage_femme":   return "/sage-femme";
    case "pediatre":     return "/pediatre";
    case "infirmiere":   return "/infirmiere";
    case "psychologue":  return "/psychologue";
    case "genycologue":  return "/genycologue";
    default:             return "/login";
  }
};
