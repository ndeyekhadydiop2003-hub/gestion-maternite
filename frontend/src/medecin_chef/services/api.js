const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => localStorage.getItem("token");

const request = async (endpoint, options = {}) => {
  const res = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    return;
  }
  return res.json();
};

export const api = {
  get:    (url)          => request(url),
  post:   (url, data)    => request(url, { method: "POST",   body: JSON.stringify(data) }),
  put:    (url, data)    => request(url, { method: "PUT",    body: JSON.stringify(data) }),
  patch:  (url, data)    => request(url, { method: "PATCH",  body: JSON.stringify(data) }),
  delete: (url)          => request(url, { method: "DELETE" }),
};

export default api;
