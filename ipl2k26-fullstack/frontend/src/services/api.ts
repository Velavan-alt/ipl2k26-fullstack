/**
 * api.ts
 * All HTTP calls to the Node.js backend.
 * Set VITE_API_URL in Netlify environment variables to your Render backend URL.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken(): string | null {
  try {
    const s = localStorage.getItem('ipl2k26_session');
    if (!s) return null;
    return JSON.parse(s).token || null;
  } catch { return null; }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const apiRegister = (body: {
  name: string; username: string; email: string; password: string;
}) => request<any>('POST', '/auth/register', body);

export const apiLogin = (body: { identifier: string; password: string }) =>
  request<any>('POST', '/auth/login', body);

// ── Matches ───────────────────────────────────────────────────────────────────
export const apiGetMatches = () => request<any[]>('GET', '/matches');
export const apiGetMatch   = (id: string) => request<any>('GET', `/matches/${id}`);

export const apiCreateMatch = (body: any) =>
  request<any>('POST', '/matches', body);

export const apiGoLive = (id: string) =>
  request<any>('PUT', `/matches/${id}/live`);

export const apiReschedule = (id: string, matchTime: string) =>
  request<any>('PUT', `/matches/${id}/reschedule`, { matchTime });

export const apiUpdateOdds = (id: string, odds: any) =>
  request<any>('PUT', `/matches/${id}/odds`, odds);

export const apiDeleteMatch = (id: string) =>
  request<any>('DELETE', `/matches/${id}`);

// ── Bets ──────────────────────────────────────────────────────────────────────
export const apiPlaceBet = (body: { matchId: number; betOn: string; amount: number }) =>
  request<any>('POST', '/bets', body);

export const apiMyBets = () => request<any[]>('GET', '/bets/my');

export const apiAllBets = () => request<any[]>('GET', '/bets');

export const apiDeclareResult = (matchId: string, winner: string) =>
  request<any>('POST', `/bets/declare/${matchId}`, { winner });

// ── Wallet ────────────────────────────────────────────────────────────────────
export const apiGetBalance    = () => request<any>('GET', '/wallet/balance');
export const apiGetTransactions = () => request<any[]>('GET', '/wallet/transactions');

// ── Admin ─────────────────────────────────────────────────────────────────────
export const apiGetAllUsers = () => request<any[]>('GET', '/admin/users');
export const apiAddMoney    = (userId: number, amount: number, note?: string) =>
  request<any>('POST', `/admin/users/${userId}/add-money`, { amount, note });
export const apiToggleUser  = (userId: number) =>
  request<any>('PUT', `/admin/users/${userId}/toggle`);
export const apiGetStats    = () => request<any>('GET', '/admin/stats');
