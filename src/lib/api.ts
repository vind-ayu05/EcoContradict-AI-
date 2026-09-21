import {
  Analysis,
  DashboardStats,
  WhatIfSimulationResult,
  SustainabilityCategory,
  FixPlanResult,
  ImageAnalysisResult,
  AuthSession,
  UserPublicProfile,
  SecurityTestResult,
  AuditLogEntry
} from '../types.ts';

const TOKEN_KEY = 'ecocontradict_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function getAuthHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...customHeaders };
  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ========================================================
// AUTHENTICATION & SECURITY API
// ========================================================

export async function loginUser(email: string, password: string): Promise<AuthSession> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Login failed');
  setStoredToken(json.data.token);
  return json.data;
}

export async function signupUser(name: string, email: string, password: string): Promise<AuthSession> {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Signup failed');
  setStoredToken(json.data.token);
  return json.data;
}

export async function fetchCurrentUser(): Promise<UserPublicProfile | null> {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders()
    });
    if (res.status === 401) {
      setStoredToken(null);
      return null;
    }
    const json = await res.json();
    if (!json.success) return null;
    return json.data;
  } catch (err) {
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch (err) {
    // Ignore network error on logout
  } finally {
    setStoredToken(null);
  }
}

export async function requestPasswordReset(email: string): Promise<{ message: string; demoToken?: string }> {
  const res = await fetch('/api/auth/reset-password/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Password reset request failed');
  return json.data;
}

export async function confirmPasswordReset(token: string, newPassword: string): Promise<{ message: string }> {
  const res = await fetch('/api/auth/reset-password/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Password reset failed');
  return json.data;
}

export async function deleteUserAccount(password: string): Promise<void> {
  const res = await fetch('/api/auth/delete-account', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ password })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Account deletion failed');
  setStoredToken(null);
}

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  const res = await fetch('/api/auth/audit-logs', {
    headers: getAuthHeaders()
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed to fetch audit logs');
  return json.data;
}

export async function runSecurityTestSuite(): Promise<{ results: SecurityTestResult[]; total: number; passed: number; failed: number }> {
  const res = await fetch('/api/auth/security-test', {
    headers: getAuthHeaders()
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Security verification test suite failed');
  return json.data;
}

// ========================================================
// CORE SUSTAINABILITY & AUDIT API
// ========================================================

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch('/api/dashboard/stats', {
    headers: getAuthHeaders()
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed to fetch statistics');
  return json.data;
}

export async function fetchAllAnalyses(): Promise<Analysis[]> {
  const res = await fetch('/api/analyses', {
    headers: getAuthHeaders()
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed to fetch analyses');
  return json.data;
}

export async function fetchAnalysisById(id: string): Promise<Analysis> {
  const res = await fetch(`/api/analyses/${id}`, {
    headers: getAuthHeaders()
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed to fetch analysis');
  return json.data;
}

export async function createAnalysis(payload: {
  title: string;
  description?: string;
  planText: string;
  location?: string;
  duration?: string;
  participants?: number;
  primarySDG: string;
  goals: string[];
  categories: SustainabilityCategory[];
  forceDemo?: boolean;
}): Promise<Analysis> {
  const res = await fetch('/api/analyses', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed to run analysis');
  return json.data;
}

export async function deleteAnalysis(id: string): Promise<void> {
  const res = await fetch(`/api/analyses/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed to delete analysis');
}

export async function uploadPdfDocument(file: File): Promise<{ fileName: string; size: number; extractedText: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: getAuthHeaders(), // Note: Fetch handles multipart boundary when Body is FormData
    body: formData
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Document upload failed');
  return json.data;
}

export async function runWhatIfSimulation(analysisId: string, resolvedActionsCount: number): Promise<WhatIfSimulationResult> {
  const res = await fetch('/api/what-if', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ analysisId, resolvedActionsCount })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'What-if simulation failed');
  return json.data;
}

export async function askAssistant(analysisId: string, question: string): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ analysisId, question })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Assistant response failed');
  return json.data.answer;
}

export async function fetchReport(id: string): Promise<{ analysis: Analysis; markdown: string; generatedAt: string }> {
  const res = await fetch(`/api/reports/${id}`, {
    headers: getAuthHeaders()
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed to retrieve report');
  return json.data;
}

export async function fixMyPlan(analysisId: string): Promise<FixPlanResult> {
  const res = await fetch('/api/fix-plan', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ analysisId })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed to generate AI plan optimization');
  return json.data;
}

export async function analyzeImageDocument(file: File): Promise<ImageAnalysisResult> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch('/api/image-analyze', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Image analysis failed');
  return json.data;
}

export async function fetchVersions(analysisId: string): Promise<any[]> {
  const res = await fetch(`/api/analyses/${analysisId}/versions`, {
    headers: getAuthHeaders()
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed to fetch versions');
  return json.data;
}

export async function savePlanVersion(analysisId: string, label: string, notes: string, planText?: string): Promise<any> {
  const res = await fetch(`/api/analyses/${analysisId}/versions`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ label, notes, planText })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed to save version');
  return json.data;
}

export async function fetchKnowledgeResources(category?: string, query?: string): Promise<any[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (query) params.append('query', query);

  const url = `/api/knowledge${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed to fetch knowledge resources');
  return json.data;
}

export async function submitContradictionFeedback(data: {
  analysisId: string;
  contradictionId: string;
  vote: 'UP' | 'DOWN';
  comment?: string;
  suggestedCorrection?: string;
}): Promise<void> {
  const res = await fetch('/api/feedback', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed to submit feedback');
}
