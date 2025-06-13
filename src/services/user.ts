
export interface SignupData {
  userName: string;
  userEmail: string;
  userMobileNumber: string;
  password: string;
  userRole?: string;
}

export interface LoginData {
  userEmail: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    userCode: string;
    userName: string;
    userRole: string;
    userEmail: string;
    userMobileNumber: string;
    userReferenceCode: string;
    passwordHash: string;
    isActive: boolean;
  };
}

export interface User {
id: number
name: string
email: string
// Add other user fields as needed
}

export interface UserListResponse {
pageNo: number
rowsPerPage: number
totalCount: number
totalPages: number
users: User[]
}

const API_BASE = import.meta.env.VITE_API_BASE_URL 

export async function signupUser(data: SignupData) {
  const res = await fetch(`${API_BASE}/users/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || err?.message || "Signup failed");
  }
  return res.json();
}

export async function loginUser(data: LoginData): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || err?.message || "Login failed");
  }
  return res.json();
}

export async function listUsers(pageNo: number, rowsPerPage: number): Promise<UserListResponse> {
try {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error("Authentication required");
  }

  const res = await fetch(`${API_BASE}/users/list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ pageNo, rowsPerPage })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const errorMessage = errorData?.message || "Failed to fetch users";
    throw new Error(errorMessage);
  }

  return await res.json();
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
  throw error;
}
}