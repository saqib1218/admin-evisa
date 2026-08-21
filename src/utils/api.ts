const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

let accessToken: string | null = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAdmin() {
  if (typeof window === "undefined") return null;
  const admin = localStorage.getItem("admin_user");
  return admin ? JSON.parse(admin) : null;
}

export function setAuth(data: { accessToken: string; admin: any }) {
  accessToken = data.accessToken;
  localStorage.setItem("admin_user", JSON.stringify(data.admin));
}

export function clearAuth() {
  accessToken = null;
  localStorage.removeItem("admin_user");
}

export function isAuthenticated() {
  return !!accessToken && !!localStorage.getItem("admin_user");
}

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if ((res.status === 401 || res.status === 403) && accessToken) {
    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (refreshRes.ok) {
      const refreshData = await refreshRes.json();
      accessToken = refreshData.accessToken;

      headers["Authorization"] = `Bearer ${accessToken}`;
      res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        credentials: "include",
      });
    } else {
      clearAuth();
      if (typeof window !== "undefined") window.location.href = "/login";
      throw { status: 401, message: "Session expired" };
    }
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw {
      status: res.status,
      message: data?.error || data?.message || "Request failed",
    };
  }

  return data;
}

async function requestFormData<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if ((res.status === 401 || res.status === 403) && accessToken) {
    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (refreshRes.ok) {
      const refreshData = await refreshRes.json();
      accessToken = refreshData.accessToken;

      headers["Authorization"] = `Bearer ${accessToken}`;
      res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        credentials: "include",
      });
    } else {
      clearAuth();
      if (typeof window !== "undefined") window.location.href = "/login";
      throw { status: 401, message: "Session expired" };
    }
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw {
      status: res.status,
      message: data?.error || data?.message || "Request failed",
    };
  }

  return data;
}

export const api = {
  async adminLogin(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      throw { status: res.status, message: data?.error || "Invalid credentials" };
    }
    setAuth(data);
    return data;
  },

  async logout() {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
    }
    clearAuth();
  },

  async getApplicationDetails(id: string) {
    return request(`/applications/${id}/details`);
  },

  async updateApplicationStatus(id: string, status: string, notes?: string) {
    return request(`/applications/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, notes }),
    });
  },

  async updateOutcome(id: string, data: { status: string; notes?: string; visaDocument?: File | null }) {
    const formData = new FormData();
    formData.append("status", data.status);
    if (data.notes) formData.append("notes", data.notes);
    if (data.visaDocument) formData.append("visaDocument", data.visaDocument);
    return requestFormData(`/applications/${id}/outcome`, {
      method: "PATCH",
      body: formData,
    });
  },

  async updatePaymentStatus(id: string, paymentStatus: boolean, transactionId?: string) {
    return request(`/applications/${id}/payment`, {
      method: "PATCH",
      body: JSON.stringify({ paymentStatus, transactionId }),
    });
  },

  async deleteApplication(id: string) {
    return request(`/applications/${id}`, {
      method: "DELETE",
    });
  },

  async getDashboardStats() {
    return request("/dashboard");
  },

  async getApplications(params?: { search?: string; dateFrom?: string; dateTo?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.dateFrom) query.set("dateFrom", params.dateFrom);
    if (params?.dateTo) query.set("dateTo", params.dateTo);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return request(`/applications${qs ? `?${qs}` : ""}`);
  },

  async getPaymentStats() {
    return request("/payments/stats");
  },

  async getPaymentTransactions(params?: { search?: string; dateFrom?: string; dateTo?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.dateFrom) query.set("dateFrom", params.dateFrom);
    if (params?.dateTo) query.set("dateTo", params.dateTo);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return request(`/payments/transactions${qs ? `?${qs}` : ""}`);
  },

  async refreshAccessToken() {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      accessToken = data.accessToken;
      return true;
    }
    return false;
  },
};
