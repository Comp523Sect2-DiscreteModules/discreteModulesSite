import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { api } from '../../api.js';
import ModuleEditor from './ModuleEditor.jsx';

vi.mock('../../api.js', () => ({
  api: {
    getModule: vi.fn(),
    updateModule: vi.fn(),
    updateLesson: vi.fn(),
    createLesson: vi.fn(),
  },
}));

const RAW = 'https://docs.google.com/forms/d/e/ABC123/viewform';
const FORM = `${RAW}?embedded=true`;

function moduleWith(quizFormUrl) {
  return {
    id: 1,
    title: 'Propositional Logic',
    description: '',
    published: true,
    quiz_form_url: quizFormUrl,
    lessons: [],
  };
}

function renderEditor() {
  return render(
    <MemoryRouter initialEntries={['/admin/modules/1']}>
      <Routes>
        <Route path="/admin/modules/:moduleId" element={<ModuleEditor />} />
      </Routes>
    </MemoryRouter>,
  );
}

const quizField = () =>
  screen.findByLabelText('Google Form link or embed code');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('ModuleEditor quiz section', () => {
  // FU-10
  it('saves a quiz link and shows the cleaned-up link the server returns', async () => {
    const user = userEvent.setup();
    api.getModule.mockResolvedValue(moduleWith(null));
    api.updateModule.mockResolvedValue({ quiz_form_url: FORM });
    renderEditor();

    const field = await quizField();
    expect(screen.getByText('None attached')).toBeInTheDocument();

    await user.type(field, RAW);
    await user.click(screen.getByRole('button', { name: 'Save quiz' }));

    expect(api.updateModule).toHaveBeenCalledWith(1, { quiz_form_url: RAW });
    expect(await screen.findByText('Quiz saved.')).toBeInTheDocument();
    expect(screen.getByText('Google Form attached')).toBeInTheDocument();
    expect(field).toHaveValue(FORM);
    expect(
      screen.getByRole('link', { name: 'Preview as student' }),
    ).toHaveAttribute('href', '/modules/1/quiz');
  });

  it('shows the server error and saves nothing when validation fails', async () => {
    const user = userEvent.setup();
    api.getModule.mockResolvedValue(moduleWith(null));
    api.updateModule.mockRejectedValue(
      new Error("That isn't a shareable Google Form link."),
    );
    renderEditor();

    await user.type(
      await quizField(),
      'https://docs.google.com/forms/d/ABC/edit',
    );
    await user.click(screen.getByRole('button', { name: 'Save quiz' }));

    expect(
      await screen.findByText("That isn't a shareable Google Form link."),
    ).toBeInTheDocument();
    expect(screen.queryByText('Quiz saved.')).not.toBeInTheDocument();
    expect(screen.getByText('None attached')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Remove quiz' }),
    ).not.toBeInTheDocument();
  });

  it('removes an attached quiz by saving an empty value', async () => {
    const user = userEvent.setup();
    api.getModule.mockResolvedValue(moduleWith(FORM));
    api.updateModule.mockResolvedValue({ quiz_form_url: null });
    renderEditor();

    expect(await screen.findByText('Google Form attached')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove quiz' }));

    expect(api.updateModule).toHaveBeenCalledWith(1, { quiz_form_url: '' });
    expect(await screen.findByText('Quiz removed.')).toBeInTheDocument();
    expect(screen.getByText('None attached')).toBeInTheDocument();
    expect(await quizField()).toHaveValue('');
    expect(
      screen.queryByRole('button', { name: 'Remove quiz' }),
    ).not.toBeInTheDocument();
  });
});
