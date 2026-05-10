const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
export async function api<T>(path: string, init?: RequestInit & { token?: string }): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.token ? { Authorization: `Bearer ${init.token}` } : {}), ...init?.headers }, credentials: 'include' });
  if (!response.ok) throw new Error((await response.json().catch(() => ({ message: 'Request failed' }))).message);
  return response.json() as Promise<T>;
}
