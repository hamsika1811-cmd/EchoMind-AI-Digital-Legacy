import axios from "axios";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("echomind_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("echomind_token");
    }
    return Promise.reject(err);
  }
);

function friendlyError(err, fallback = "Something went wrong. Please try again.") {
  return err?.response?.data?.error || fallback;
}

export default api;
export { friendlyError };
