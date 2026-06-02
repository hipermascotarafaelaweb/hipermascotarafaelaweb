import Image from 'next/image';
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
  return (
    <span
      className={cn(
        'inline-flex items-center select-none',
        className
      )}
      aria-label="Hipermascota Rafaela"
    >
      <Image
        src="/logohiper.svg"
        alt="Hipermascota Rafaela"
        width={stacked ? 180 : 220}
        height={stacked ? 78 : 50}
        className={cn(
          'h-auto',
          light && 'brightness-[1.3] contrast-[0.9]',
          stacked ? 'w-40 sm:w-44' : 'w-36 sm:w-48'
        )}
        priority
      />
    </span>
  );
}
