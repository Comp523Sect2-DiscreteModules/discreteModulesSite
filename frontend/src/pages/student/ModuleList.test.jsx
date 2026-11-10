import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { api } from '../../api.js';
import ModuleList from './ModuleList.jsx';

vi.mock('../../api.js', () => ({ api: { getModules: vi.fn() } }));

const MODULES = [
  { id: 1, title: 'Propositional Logic', description: 'Truth tables.' },
  { id: 2, title: 'Set Theory', description: '' },
];

function renderList() {
  return render(
    <MemoryRouter>
      <ModuleList />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  api.getModules.mockReset();
});

describe('ModuleList', () => {
  // FU-07
  it('shows a loading status while the request is pending', () => {
    api.getModules.mockReturnValue(new Promise(() => {}));

    renderList();

    expect(screen.getByRole('status')).toHaveTextContent('Loading modules…');
  });

  it('shows the error and refetches when Retry is clicked', async () => {
    const user = userEvent.setup();
    api.getModules
      .mockRejectedValueOnce(new Error('Request failed: 500'))
      .mockResolvedValueOnce(MODULES);

    renderList();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent("Couldn't load modules");
    expect(alert).toHaveTextContent('Request failed: 500');

    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(api.getModules).toHaveBeenCalledTimes(2);
    expect(
      await screen.findByRole('link', { name: /Propositional Logic/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows an empty state when no modules are published', async () => {
    api.getModules.mockResolvedValue([]);

    renderList();

    expect(await screen.findByText('No modules yet')).toBeInTheDocument();
    expect(
      screen.getByText('No modules are published yet. Check back soon.'),
    ).toBeInTheDocument();
  });

  it('lists each module as a link to its lecture page', async () => {
    api.getModules.mockResolvedValue(MODULES);

    renderList();

    expect(
      await screen.findByRole('link', { name: /Propositional Logic/ }),
    ).toHaveAttribute('href', '/modules/1');
    expect(screen.getByRole('link', { name: /Set Theory/ })).toHaveAttribute(
      'href',
      '/modules/2',
    );
  });
});
