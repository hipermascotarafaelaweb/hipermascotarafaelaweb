import { cn } from '@/utils/cn';

interface LogoProps {
  className?: string;
  /** Apila el nombre en dos líneas, como en la tarjeta. */
  stacked?: boolean;
  /** Muestra la huella junto al texto. */
  icon?: boolean;
  /** Tonos claros para fondos oscuros. */
  light?: boolean;
}

// Verde lima exacto del lettering de la tarjeta.
const LIME = '#8dc63f';

function Paw({ className, color }: { className?: string; color: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <ellipse cx="24" cy="31" rx="11" ry="9" fill={color} />
      <ellipse cx="10" cy="21" rx="4.3" ry="5.6" fill={color} />
      <ellipse cx="18.5" cy="13" rx="4.3" ry="5.9" fill={color} />
      <ellipse cx="29.5" cy="13" rx="4.3" ry="5.9" fill={color} />
      <ellipse cx="38" cy="21" rx="4.3" ry="5.6" fill={color} />
    </svg>
  );
}

export default function Logo({
  className,
  stacked = false,
  icon = false,
  light = false,
}: LogoProps) {
  const textColor = light ? '#a7d65f' : LIME;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-wordmark leading-none select-none',
        className
      )}
    >
      {icon && (
        <Paw className="h-[1.05em] w-[1.05em] shrink-0" color={light ? '#a7d65f' : LIME} />
      )}
      <span
        className={cn('inline-flex', stacked ? 'flex-col items-center leading-[0.9]' : 'items-baseline')}
      >
        <span style={{ color: textColor }} className="tracking-wide">
          Hipermascota
        </span>
        <span
          style={{ color: light ? '#ffffff' : LIME }}
          className={cn('relative tracking-wide', stacked ? 'mt-0.5' : 'ml-[0.35em]')}
        >
          Rafaela
          {stacked && (
            <svg
              className="absolute left-0 -bottom-[0.22em] w-full"
              viewBox="0 0 120 8"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M3 5.2C30 2 90 2 117 5.2"
                stroke={light ? '#ffffff' : LIME}
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>
      </span>
    </span>
  );
}
