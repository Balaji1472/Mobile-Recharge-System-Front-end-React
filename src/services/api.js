const BASE_URL = 'http://localhost:8086/reup';

// ── Auth ──
export async function apiLogin(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Login failed');
  }
  return data; 
}

export async function apiRegister(payload) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = 'Registration failed';
    try {
      const data = await res.json();
      msg = data.message || msg;
    } catch {
      msg = await res.text() || msg;
    }
    throw new Error(msg);
  }
  return true;
}

// ─ Plans ─
export async function apiGetAllPlans(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/plans`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch plans');
  return data; 
}