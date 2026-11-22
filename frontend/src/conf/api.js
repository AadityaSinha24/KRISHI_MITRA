import axios from "axios";
import conf from "./conf";

const api = axios.create({
  baseURL: conf.apiUrl,
  withCredentials: true, // sends and receives your httpOnly cookies
});

const AUTH_URLS = ["/users/login", "/users/register", "/users/refresh-token"];
let refreshPromise = null; // so parallel 401s trigger only one refresh

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthCall = AUTH_URLS.some((u) => original?.url?.includes(u));

    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        refreshPromise =
          refreshPromise ||
          api.post("/users/refresh-token").finally(() => (refreshPromise = null));
        await refreshPromise;
        return api(original); // retry the original request
      } catch {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// Turns FastAPI/ApiError responses into one readable message
export const getErrorMessage = (err) => {
  const data = err.response?.data;
  if (Array.isArray(data?.detail)) {
    const first = data.detail[0];
    return `${first.loc?.slice(1).join(".")}: ${first.msg}`; // 422 validation
  }
  return data?.message || data?.detail || err.message || "Something went wrong";
};

export default api;