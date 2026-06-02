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
        width={stacked ? 160 : 180}
        height={stacked ? 69 : 40}
        className={cn(
          'h-auto mix-blend-multiply',
          light && 'mix-blend-normal brightness-[1.4] saturate-[1.2]',
          stacked ? 'w-36' : 'h-10 w-auto'
        )}
        priority
      />
    </span>
  );
}
