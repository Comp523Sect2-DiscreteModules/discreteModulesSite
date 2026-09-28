function getStoredRole() {
  const stored = localStorage.getItem('dmra_mock_user');
  return stored ? JSON.parse(stored).role : 'student';
}

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': getStoredRole(),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  getModules: () => request('/modules'),
  getModule: (id) => request(`/modules/${id}`),
  createModule: (data) => request('/modules', { method: 'POST', body: JSON.stringify(data) }),
  updateModule: (id, data) =>
    request(`/modules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateLesson: (id, data) =>
    request(`/lessons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  createLesson: (data) => request('/lessons', { method: 'POST', body: JSON.stringify(data) }),
  getQuiz: (moduleId) => request(`/quiz/${moduleId}`),
};
