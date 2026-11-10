import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { api } from '../../api.js';
import AdminDashboard from './AdminDashboard.jsx';

vi.mock('../../api.js', () => ({
  api: {
    getModules: vi.fn(),
    updateModule: vi.fn(),
    createModule: vi.fn(),
  },
}));

const MODULES = [
  {
    id: 1,
    slug: 'propositional-logic',
    title: 'Propositional Logic',
    published: true,
  },
  { id: 2, slug: 'set-theory', title: 'Set Theory', published: true },
  {
    id: 3,
    slug: 'induction-draft',
    title: 'Induction (draft)',
    published: false,
  },
];

// The page renders a desktop table and a mobile card list at the same time
// (CSS hides one), so scope queries to the table to avoid duplicates.
const table = () => screen.findByRole('table', { name: 'Modules' });

function renderDashboard() {
  return render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  api.getModules.mockResolvedValue(MODULES);
  api.updateModule.mockResolvedValue({});
  api.createModule.mockResolvedValue({});
});

describe('AdminDashboard', () => {
  // FU-09
  it('shows filter counts: All 3, Published 2, Drafts 1', async () => {
    renderDashboard();

    expect(await screen.findByRole('button', { name: 'All 3' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Published 2' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Drafts 1' })).toBeVisible();
  });

  it('narrows the table when the Drafts filter is chosen', async () => {
    const user = userEvent.setup();
    renderDashboard();
    const rows = within(await table());
    expect(await rows.findByText('Set Theory')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Drafts 1' }));

    expect(rows.getByText('Induction (draft)')).toBeInTheDocument();
    expect(rows.queryByText('Set Theory')).not.toBeInTheDocument();
  });

  it('publishes a draft with the switch and then reloads the list', async () => {
    const user = userEvent.setup();
    renderDashboard();

    const draftSwitch = await within(await table()).findByRole('switch', {
      name: 'Induction (draft): visible to students',
    });
    expect(draftSwitch).toHaveAttribute('aria-checked', 'false');

    await user.click(draftSwitch);

    expect(api.updateModule).toHaveBeenCalledWith(3, { published: true });
    expect(api.getModules).toHaveBeenCalledTimes(2);
  });

  it('unpublishes a published module with the switch', async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(
      await within(await table()).findByRole('switch', {
        name: 'Set Theory: visible to students',
      }),
    );

    expect(api.updateModule).toHaveBeenCalledWith(2, { published: false });
  });

  it('creates a new module as a draft, filling the slug from the title', async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(await screen.findByRole('button', { name: 'New module' }));
    const create = screen.getByRole('button', { name: 'Create draft' });
    expect(create).toBeDisabled();

    await user.type(screen.getByLabelText('Title'), 'Graph Theory');
    expect(screen.getByLabelText('Slug')).toHaveValue('graph-theory');
    await user.click(create);

    expect(api.createModule).toHaveBeenCalledWith({
      slug: 'graph-theory',
      title: 'Graph Theory',
      description: '',
      published: false,
    });
  });

  it('shows an error with Retry when modules cannot be loaded', async () => {
    api.getModules.mockRejectedValue(new Error('Request failed: 500'));

    renderDashboard();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent("Couldn't load modules");
    expect(alert).toHaveTextContent('Request failed: 500');
  });
});
