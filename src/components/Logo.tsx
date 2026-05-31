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

// Patrón determinístico de "bailoteo" del marcador (estable en SSR/CSR).
const ROT = [-3, 2, -2, 3, -1, 2, -3, 1, 3, -2, 2, -1.5];
const DY = [0, 1, -1, 0.5, 1, -0.5, 0, 1, -1, 0.5, 1, -0.5];

function Word({ text, color }: { text: string; color: string }) {
  return (
    <span className="inline-flex">
      {text.split('').map((ch, i) => (
        <span
          key={i}
          className="inline-block"
          style={{
            color,
            transform: `rotate(${ROT[i % ROT.length]}deg) translateY(${DY[i % DY.length]}px)`,
          }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

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
  const top = light ? '#a7d65f' : LIME;
  const bottom = light ? '#ffffff' : LIME;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-wordmark leading-none select-none',
        className
      )}
      aria-label="Hipermascota Rafaela"
    >
      {icon && <Paw className="h-[1.05em] w-[1.05em] shrink-0" color={top} />}
      <span
        className={cn('inline-flex', stacked ? 'flex-col items-center leading-[0.9]' : 'items-baseline')}
        aria-hidden="true"
      >
        <Word text="Hipermascota" color={top} />
        <span className={cn('relative', stacked ? 'mt-1' : 'ml-[0.35em]')}>
          <Word text="Rafaela" color={bottom} />
          {stacked && (
            <svg
              className="absolute left-0 -bottom-[0.24em] w-full"
              viewBox="0 0 120 8"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M3 5C30 1.5 90 1.5 117 5"
                stroke={bottom}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>
      </span>
    </span>
  );
}
