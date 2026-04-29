const FASTAPI_URL = "http://localhost:8000";

export const fetchAISummary = async (role, token) => {
  const endpoint = role === "admin" ? "/summary/admin" : "/summary/user";

  const response = await fetch(`${FASTAPI_URL}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Failed to fetch AI summary");
  }

  const data = await response.json();
  return data.summary;
};