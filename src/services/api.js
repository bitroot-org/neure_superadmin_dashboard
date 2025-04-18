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
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${response.data.accessToken}`;
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
    throw new Error(response.data.message || "Login failed");
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
};

export const createTherapist = async (data) => {
  try {
    const response = await api.post("/user/createTherapist", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllCompanies = async (params = {}) => {
  try {
    const response = await api.get("/company/getAllCompanies", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getCompanyEmployees = async (companyId, params) => {
  const response = await api.get(`/company/getCompanyEmployees`, {
    params: {
      company_id: companyId,
      page: params.page,
      limit: params.limit,
    },
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
};

export const bulkCreateEmployees = async (file, companyId) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("company_id", companyId);

    const response = await api.post("/company/bulkCreateEmployees", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getDepartments = async () => {
  try {
    const response = await api.get("/company/getDepartments");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createCompany = async (data) => {
  try {
    const response = await api.post("/company/createCompany", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createArticle = async (formData) => {
  try {
    const response = await api.post('/article/createArticle', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateArticle = async (data) => {
  try {
    const response = await api.put("/article/updateArticle", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const uploadArticleImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/upload/article", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createAssessment = async (data) => {
  try {
    // If there's an ID, it's an update operation
    if (data.id) {
      return await updateAssessment(data);
    }
    const response = await api.post(`/assessments/createAssessment`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateAssessment = async (data) => {
  try {
    const response = await api.put(`/assessments/updateAssessment`, data);
    return response.data;
  } catch (error) {
    console.error("Update assessment error:", error);
    throw error.response?.data || error;
  }
};

export const getAllAssessments = async (params = {}) => {
  try {
    const response = await api.get(`/assessments/getAllAssessments`, {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllWorkshops = async (params = {}) => {
  try {
    const response = await api.get(`/workshop/getAllWorkshops`, {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateWorkshop = async (data) => {
  try {
    const response = await api.put(`/workshop/updateWorkshop`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteWorkshop = async (data) => {
  try {
    const response = await api.delete(`/workshop/deleteWorkshop`, {
      data: data,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const uploadWorkshopFiles = async (workshopId, coverImage, pdf) => {
  try {
    const formData = new FormData();
    formData.append("workshopId", workshopId);

    if (coverImage) {
      formData.append("coverImage", coverImage);
    }

    if (pdf) {
      formData.append("pdf", pdf);
    }

    const response = await api.post("/uploads/workshop/files", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createWorkshop = async (data) => {
  try {
    const response = await api.post(`/workshop/createWorkshop`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllWorkshopSchedules = async (params = {}) => {
  try {
    const response = await api.get(`/workshop/getAllWorkshopSchedules`, {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const scheduleWorkshop = async (data) => {
  try {
    const response = await api.post(`/workshop/scheduleWorkshop`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getArticles = async (params = {}) => {
  try {
    const response = await api.get(`/article/getArticles`, {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getGalleryItems = async (params = {}) => {
  try {
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      type: params.type
    };
    
    // Add conditional parameters
    if (params.companyId !== undefined) {
      queryParams.companyId = params.companyId;
    }
    
    if (params.showUnassigned !== undefined) {
      queryParams.showUnassigned = params.showUnassigned;
    }
    
    const response = await api.get(`/getGalleryItems`, {
      params: queryParams
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const uploadGalleryItem = async (formData) => {
  try {
    const response = await api.post('/uploadGalleryItem', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateGalleryItem = async (data) => {
  try {
    const response = await api.put(`/updateGalleryItem`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const uploadMediaFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/uploads/gallery", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const getSoundscapes = async (params = {}) => {
  try {
    const response = await api.get(`/soundscapes/getSoundscapes`, {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
      },
    });
    return response.data;     
  }
  catch (error) {
    throw error.response?.data || error;
  }
}

export const createSoundscape = async (formData) => {
  try {
    // Ensure we're sending with multipart/form-data header for file uploads
    const response = await api.post(`/soundscapes/createSoundscape`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
  catch (error) {
    throw error.response?.data || error;
  }
}

export const deleteSoundscape = async (soundscapeId) => {
  try {
    const response = await api.delete('/soundscapes/deleteSoundscape', {
      params: {
        soundscapeId: soundscapeId
      }
    });
    return response.data;
  }
  catch (error) {
    throw error.response?.data || error;
  }
}

export const metricsData = async () => {
  try {
    const response = await api.get(`/dashboard/metrics`);
    return response.data;
  }
  catch (error) {
    throw error.response?.data || error;
  }
}

export const getTrends = async () => {
  try {
    const response = await api.get(`/analytics/trends`);
    return response.data;
  }
  catch (error) {
    throw error.response?.data || error;
  }
}

export const updateTherapist = async (therapistId, data) => {
  try {
    const response = await api.put(`/user/updateTherapist/${therapistId}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const deleteTherapist = async (therapistId) => {
  try {
    const response = await api.delete(`/user/deleteTherapist/${therapistId}`);
    return response.data;
  }
  catch (error) {
    throw error.response?.data || error;
  }
}

export const rescheduleWorkshop = async (scheduleId, newStartTime, newEndTime) => {
  try {
    const response = await api.put(`/workshop/rescheduleWorkshop`, {
      schedule_id: scheduleId,
      new_start_time: newStartTime,
      new_end_time: newEndTime
    });
    return response.data;
  }
  catch (error) {
    throw error.response?.data || error;
  }
}

export const cancelWorkshopSchedule = async (scheduleId) => {
  try {
    const response = await api.put(`/workshop/cancelWorkshopSchedule`, {
      schedule_id: scheduleId
    });
    return response.data;
  }
  catch (error) {
    throw error.response?.data || error;
  }
}

export const deleteArticle = async (articleId) => {
  try {
    const response = await api.delete(`/article/deleteArticle/${articleId}`);
    return response.data;
  }
  catch (error) {
    throw error.response?.data || error;
  }
}

export const deleteGalleryItem = async (galleryItemId) => {
  try {
    const response = await api.delete(`/deleteGalleryItem/${galleryItemId}`);
    return response.data;
  }
  catch (error) {
    throw error.response?.data || error;
  }
}

export const assignResourcesToCompany = async (data) => {
  try {
    const response = await api.post("/assignToCompany", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getCompanyAnalytics = async (params = {}) => {
  try {
    const response = await api.get("/company/analytics", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getCompanyList = async (params = {}) => {
  try {
    const response = await api.get("/company/getCompanyList", {params});
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}


export const getAnnouncements = async (params = {}) => {
  try {
    const response = await api.get("/announcements/list", {params});
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const createAnnouncement = async (data) => {
  try {
    const response = await api.post("/announcements/create", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const updateAnnouncement = async (data) => {
  try {
    const response = await api.put("/announcements/update", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const deleteAnnouncement = async (announcementId) => {
  try {
    const response = await api.delete(`/announcements/delete/${announcementId}`);
    return response.data;   
  }
  catch (error) {
    throw error.response?.data || error;
  }
}

export const deactivatedCompanies = async (params = {}) => {
  try {
    const response = await api.get("/company/deactivatedCompanies", {params});
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const deactivationRequests = async (params = {}) => {
  try {
    const response = await api.get("/company/deactivationRequests", {params});
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const processDeactivationRequest = async (data) => {
  try {
    const response = await api.post("/company/processDeactivationRequest", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}