import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/format';

/**
 * <Button variant="primary|dark|secondary|ghost|danger" size="sm|md|lg" to="/path" loading icon={Icon}>
 */
export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', to, href, loading, icon: Icon, iconRight: IconRight, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  const cls = cn('btn', `btn-${size}`, `btn-${variant}`, className);
  const content = (
    <>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4 shrink-0" strokeWidth={2.2} /> : null}
      {children}
      {IconRight && !loading ? <IconRight className="h-4 w-4 shrink-0" strokeWidth={2.2} /> : null}
    </>
  );
  if (to)
    return (
      <Link ref={ref} to={to} className={cls} {...rest}>
        {content}
      </Link>
    );
  if (href)
    return (
      <a ref={ref} href={href} target="_blank" rel="noreferrer" className={cls} {...rest}>
        {content}
      </a>
    );
  return (
    <button ref={ref} type={type} className={cls} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  );
});

export function IconButton({ icon: Icon, label, className, ...rest }) {
  return (
    <button type="button" aria-label={label} title={label} className={cn('btn-icon', className)} {...rest}>
      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
    </button>
  );
}
