// ================================================================
//  authService.js
//  Adapté à votre AuthController Laravel :
//    - envoie : { login, mdp }
//    - reçoit : { token, user: { id, login, role_acces } }
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
  } catch (_) {
    // Déconnexion locale même si erreur réseau
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

// Redirige selon role_acces retourné par Laravel
export const getRedirectByRole = (role_acces) => {
  if (!role_acces) return "/login";

  const role = role_acces.toLowerCase().trim();

  const routes = {
    secretaire:   "/secretaire",
    sage_femme:   "/sagefemme",
    "sage-femme": "/sagefemme",
    gynecologue:  "/sagefemme",
    gynécologue:  "/sagefemme",
    medecin:      "/medecin",
    médecin:      "/medecin",
    pediatre:     "/pediatre",
    pédiatre:     "/pediatre",
    infirmiere:   "/infirmiere",
    infirmière:   "/infirmiere",
    admin:        "/admin",
    administrateur: "/admin",
  };

  return routes[role] || "/dashboard";
};
