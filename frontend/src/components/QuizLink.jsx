import { Link } from 'react-router-dom';
import { isEmbeddedForm, safeExternalUrl } from '../quiz.js';
import { ArrowRightIcon, ExternalIcon } from './Icons.jsx';

// Button-style link to a module's practice quiz. A Google Form opens the
// in-app quiz page; any other quiz is an external site, so it goes straight
// there in a new tab.
export default function QuizLink({
  moduleId,
  url,
  className,
  iconClassName = 'h-4 w-4',
  onClick,
  children,
}) {
  const external = !isEmbeddedForm(url);
  const href = external ? safeExternalUrl(url) : null;

  if (external && href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={className}
      >
        {children}
        <ExternalIcon className={iconClassName} />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }

  return (
    <Link
      to={`/modules/${moduleId}/quiz`}
      onClick={onClick}
      className={className}
    >
      {children}
      <ArrowRightIcon className={iconClassName} />
    </Link>
  );
}
