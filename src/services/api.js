import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Refresh token function
const refreshToken = async () => {
  const token = localStorage.getItem("refreshToken");
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/api/user/refresh-token`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (
//       (error.response.status === 401 || error.response.status === 403) &&
//       !originalRequest._retry
//     ) {
//       originalRequest._retry = true;
//       try {
//         const response = await refreshToken();
//         if (response.data.accessToken) {
//           localStorage.setItem("accessToken", response.data.accessToken);
//           api.defaults.headers.common[
//             "Authorization"
//           ] = `Bearer ${response.data.accessToken}`;
//           return api(originalRequest);
//         }
//       } catch (refreshError) {
//         localStorage.clear();
//         window.location.href = "/login";
//         return Promise.reject(refreshError);
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/user/login", { email, password });
    if (response.data.data) {
      localStorage.setItem("accessToken", response.data.data.accessToken);
      localStorage.setItem("refreshToken", response.data.data.refreshToken);
      localStorage.setItem("expiresAt", response.data.data.expiresAt);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const logoutUser = async () => {
  try {
    // No need to pass token explicitly since interceptor handles it
    const response = await api.post("/user/logout");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getTherapists = async () => {
  try {
    const response = await api.get("/user/getTherapists");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const createTherapist = async (data) => {
  try {
    const response = await api.post("/user/createTherapist", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const getAllCompanies = async () => {
  try {
    const response = await api.get("/company/getAllCompanies");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const getCompanyEmployees = async (companyId, params) => {
  const response = await api.get(`/company/getCompanyEmployees`, {
    params: {
      company_id: companyId,
      page: params.page,
      limit: params.limit
    }
  });
  return response.data;
};

export const createEmployee = async (data) => {   
  try {
    const response = await api.post("/company/createEmployee", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const bulkCreateEmployees = async (file, companyId) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('company_id', companyId);

    const response = await api.post("/company/bulkCreateEmployees", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const getDepartments = async () => {
  try {
    const response = await api.get("/company/getDepartments");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}
