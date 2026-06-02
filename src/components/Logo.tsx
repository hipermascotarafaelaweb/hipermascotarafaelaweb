import { cn } from '@/utils/cn';

interface LogoProps {
  className?: string;
  stacked?: boolean;
  icon?: boolean;
  light?: boolean;
}

export default function Logo({
  className,
  stacked = false,
  light = false,
}: LogoProps) {
  const color = light ? '#a7d65f' : '#94C020';
  const shadow = light
    ? 'none'
    : '-1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff, 1.5px 1.5px 0 #fff, 0 2px 6px rgba(0,0,0,0.08)';

  return (
    <span
      className={cn(
        'inline-flex select-none',
        stacked ? 'flex-col items-start' : 'items-baseline gap-1.5',
        className
      )}
      aria-label="Hipermascota Rafaela"
    >
      <span
        className="font-[var(--font-nunito)] font-[900] leading-none"
        style={{ color, textShadow: shadow, fontSize: 'inherit' }}
      >
        Hipermascota
      </span>
      <span
        className={cn(
          'font-[var(--font-nunito)] font-[900] leading-none',
          stacked && '-mt-0.5'
        )}
        style={{ color, textShadow: shadow, fontSize: 'inherit' }}
      >
        Rafaela
      </span>
    </span>
  );
}
