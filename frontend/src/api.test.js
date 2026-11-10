import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from './api.js';

function mockFetch(response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const ok = (body) => ({ ok: true, status: 200, json: async () => body });

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('api request headers', () => {
  // FU-01
  it('sends x-user-role: student when nobody is signed in', async () => {
    const fetchMock = mockFetch(ok([]));

    await api.getModules();

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/modules');
    expect(options.headers['x-user-role']).toBe('student');
    expect(options.headers['Content-Type']).toBe('application/json');
  });

  it('sends the stored role when an admin is signed in', async () => {
    localStorage.setItem(
      'dmra_mock_user',
      JSON.stringify({ name: 'Jo', role: 'admin' }),
    );
    const fetchMock = mockFetch(ok([]));

    await api.getModules();

    expect(fetchMock.mock.calls[0][1].headers['x-user-role']).toBe('admin');
  });

  it('sends PUT requests with a JSON body', async () => {
    const fetchMock = mockFetch(ok({ id: 2 }));

    await api.updateModule(2, { title: 'T' });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/modules/2');
    expect(options.method).toBe('PUT');
    expect(options.body).toBe('{"title":"T"}');
  });
});

describe('api error handling', () => {
  // FU-02
  it('throws the message from the response body', async () => {
    mockFetch({
      ok: false,
      status: 400,
      json: async () => ({ error: 'slug and title are required.' }),
    });

    await expect(api.createModule({})).rejects.toThrow(
      'slug and title are required.',
    );
  });

  it('falls back to "Request failed: <status>" when the body is not JSON', async () => {
    mockFetch({
      ok: false,
      status: 500,
      json: async () => {
        throw new SyntaxError('Unexpected token <');
      },
    });

    await expect(api.getModule(1)).rejects.toThrow('Request failed: 500');
  });
});
