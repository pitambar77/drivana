import { Link } from 'react-router-dom';
import { cn } from '../../utils/format';
import logo from '../../assets/autodealer-logo.png';
import logoLight from '../../assets/autodealer-logo-light.png';

/**
 * AutoDealer logo. The dark-text version shows on light surfaces and the light-text
 * version on dark ones. `dark` forces the light-text version (for dark sidebars and bands);
 * otherwise it follows light/dark mode.
 */
export function Logo({ dark, className, to = '/', size = 'md' }) {
  const h = size === 'sm' ? 'h-6' : size === 'lg' ? 'h-8' : 'h-7';
  return (
    <Link to={to} className={cn('flex shrink-0 items-center', dark ? 'logo-force-dark' : 'logo-auto', className)} aria-label="AutoDealer home">
      <img src={logo} alt="AutoDealer" className={cn('logo-on-light w-auto', h)} width="242" height="32" />
      <img src={logoLight} alt="AutoDealer" className={cn('logo-on-dark w-auto', h)} width="242" height="32" />
    </Link>
  );
}
