// ================================================================
//  src/services/authService.js
//  Service d'authentification commun à tous les rôles
// ================================================================

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export const isAuthenticated = () => !!localStorage.getItem("token");

export const logout = async () => {
  try {
    const token = localStorage.getItem("token");
    await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/logout`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
  } catch (_) {}
  finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

export const getRedirectByRole = (role_acces) => {
  if (!role_acces) return "/login";
  const role = role_acces.toLowerCase().trim();
  const routes = {
    secretaire:     "/secretaire",
    medecin_chef:   "/medecin_chef",
    sage_femme:     "/sagefemme",
    "sage-femme":   "/sagefemme",
    gynecologue:    "/sagefemme",
    pediatre:       "/pediatre",
    infirmiere:     "/infirmiere",
    psychologue:    "/psychologue",
    admin:          "/admin",
  };
  return routes[role] || "/dashboard";
};
