import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const response = await refreshToken();
        if (response.data.accessToken) {
          localStorage.setItem("accessToken", response.data.accessToken);
          api.defaults.headers.common["Authorization"] = `Bearer ${response.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const refreshToken = async () => {
  const token = localStorage.getItem("refreshToken");
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/user/refresh-token`,
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

export const login = async (email, password) => {
  try {
    const response = await api.post("/user/login", {
      email,
      password,
      role_id: 1,
    });
    
    if (response.data.status && response.data.data) {
      const { accessToken, refreshToken, expiresAt } = response.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("expiresAt", expiresAt);
      localStorage.setItem("companyId", response.data.data.companyId);
      
      return response.data;
    }
    throw new Error(response.data.message || 'Login failed');
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const logout = async () => {
  try {
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

export const getAllCompanies = async (params = {}) => {
  try {
    const response = await api.get("/company/getAllCompanies", { params });
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

export const createCompany = async (data) => {
  try {
    const response = await api.post("/company/createCompany", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const createArticle = async (data) => {
  try {
    const response = await api.post("/article/createArticle", data);
    return response.data ; 
  } catch (error) {
    throw error.response?.data || error; 
  }
}

export const updateArticle = async (data) => {
  try {
    const response = await api.put("/article/updateArticle", data);
    return response.data ; 
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const uploadArticleImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post("/upload/article", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }); 
  } catch (error) {
    throw error.response?.data || error; 
  }
}
