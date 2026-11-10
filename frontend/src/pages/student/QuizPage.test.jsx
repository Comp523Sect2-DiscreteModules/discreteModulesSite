import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { api } from '../../api.js';
import QuizPage from './QuizPage.jsx';

vi.mock('../../api.js', () => ({ api: { getModule: vi.fn() } }));

const FORM = 'https://docs.google.com/forms/d/e/ABC123/viewform';

function renderQuiz() {
  return render(
    <MemoryRouter initialEntries={['/modules/2/quiz']}>
      <Routes>
        <Route path="/modules/:moduleId/quiz" element={<QuizPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  api.getModule.mockReset();
});

describe('QuizPage', () => {
  // FU-08
  it('shows "No quiz yet" and no iframe when the module has no quiz', async () => {
    api.getModule.mockResolvedValue({
      id: 2,
      title: 'Set Theory',
      quiz_form_url: null,
    });

    const { container } = renderQuiz();

    expect(await screen.findByText('No quiz yet')).toBeInTheDocument();
    expect(container.querySelector('iframe')).toBeNull();
    expect(
      screen.getByRole('link', { name: /Back to lesson/ }),
    ).toHaveAttribute('href', '/modules/2');
  });

  it('embeds the Google Form and offers a new-tab link without ?embedded', async () => {
    api.getModule.mockResolvedValue({
      id: 2,
      title: 'Set Theory',
      quiz_form_url: `${FORM}?embedded=true`,
    });

    renderQuiz();

    const frame = await screen.findByTitle('Set Theory practice quiz');
    expect(frame).toHaveAttribute('src', `${FORM}?embedded=true`);

    const newTab = screen.getByRole('link', { name: /Open it in a new tab/ });
    expect(newTab).toHaveAttribute('href', FORM);
    expect(newTab).toHaveAttribute('target', '_blank');
    expect(newTab).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('shows the error with a Retry button when the module cannot be loaded', async () => {
    api.getModule.mockRejectedValue(new Error('Module not found.'));

    renderQuiz();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent("Couldn't load this quiz");
    expect(alert).toHaveTextContent('Module not found.');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
