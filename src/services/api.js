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
    console.log('API error:', error.response?.status);

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        console.log('Attempting token refresh');
        const refreshToken = localStorage.getItem('refreshToken');
        
        // Only attempt refresh if we have a refresh token
        if (!refreshToken) {
          console.log('No refresh token available');
          throw new Error('No refresh token');
        }
        
        const response = await refreshToken();
        if (response.data.accessToken) {
          console.log('Token refresh successful');
          localStorage.setItem("accessToken", response.data.accessToken);
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${response.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Only clear localStorage and redirect for auth errors
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    } else if (error.response?.status === 500) {
      // For 500 errors, just reject the promise without logout
      return Promise.reject(error);
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
        search_term: params.search_term || '',
        start_date: params.start_date || '',
        end_date: params.end_date || '',
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
    const response = await api.delete(`/workshop/deleteWorkshop/${data.id}`);
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
        search_term: params.search_term || '',
        ...params,
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
        search_term: params.search_term || '',
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
      type: params.type,
      search_term: params.search_term || '',
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
    // Send the formData directly with the file included
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

export const getFeedback = async (params = {}) => {
  try {
    const response = await api.get("/company/getFeedback", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const getRewards = async (params = {}) => {
  try {
    const response = await api.get("/rewards/getAllRewards", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const createReward = async (formData) => {
  try {
    const response = await api.post("/rewards/createReward", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateReward = async (formData) => {
  try {
    const rewardId = formData.get('id');
    if (!rewardId) {
      throw new Error('Reward ID is required for update');
    }
    const response = await api.put(`/rewards/${rewardId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteReward = async (id) => {
  try {
    if (!id) {
      throw new Error('Reward ID is required for deletion');
    }
    const response = await api.delete(`/rewards/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const removeEmployee = async (data) => {
  try {
    const response = await api.delete(`/company/removeEmployee`, {data});
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateWorkshopScheduleStatus = async (data) => {
  try {
    const response = await api.put(`/workshop/updateWorkshopScheduleStatus`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

// Get all FAQ items
export const getQnA = async () => {
  try {
    const response = await api.get("/qna/list");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create a new FAQ item
export const createQnA = async (data) => {
  try {
    const response = await api.post("/qna/create", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update an existing FAQ item
export const updateQnA = async (data) => {
  try {
    const response = await api.put("/qna/update", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete a FAQ item
export const deleteQnA = async (id) => {
  try {
    const response = await api.delete(`/qna/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getActivityLogs = async (params = {}) => {
  try {
    const response = await api.get("/logs/list", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const getAssessmentsList = async () => {
  try {
    const response = await api.get("/assessments/list");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const deleteAssessment = async (id) => {
  try {
    const response = await api.delete(`/assessments/deleteAssessment/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const getAssessmentCompletionList = async (params = {}) => {
  try {
    const response = await api.get("/assessments/getAssessmentCompletionList", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}


export const getUserAssessmentResponses = async (params = {}) => {
  try {
    const response = await api.get(`/assessments/responses/${params.assessmentId}`, { 
      params: {
        user_id: params.user_id
      } 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const getSuperAdminList = async () => {
  try {
    const response = await api.get("/user/getSuperadmins");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const generateReport = async (companyId, dateParams = {}) => {
  try {
    const params = {};
    
    // Add date range parameters if provided
    if (dateParams.startDate) params.start_date = dateParams.startDate;
    if (dateParams.endDate) params.end_date = dateParams.endDate;
    
    const response = await api.get(`company/reports/wellbeing/email/${companyId}`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  } 
}

export const getCompanyReport = async (companyId, dateParams = {}) => {
  try {
    const params = {};
    
    // Add date range parameters if provided
    if (dateParams.startDate) params.start_date = dateParams.startDate;
    if (dateParams.endDate) params.end_date = dateParams.endDate;
    
    // Request regular JSON response (not blob)
    const response = await api.get(`company/reports/wellbeing/${companyId}`, { params });
    
    // Return the entire response
    return response.data;
  } catch (error) {
    throw error;
  } 
};


export const deleteCompany = async (companyId) => {
  try {
    const response = await api.delete(`/company/delete/${companyId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const createSuperAdmin = async (data) => {
  try {
    const response = await api.post("/user/createSuperadmin", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const changePassword = async (data) => {
  console.log("Data for change password: ", data);
  const response = await api.post(`/user/changePassword`, data);
  return response.data;
};

export const deleteSuperadmin = async (superadminId) => {
  try {
    const response = await api.delete(`/user/deleteSuperadmin/${superadminId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

