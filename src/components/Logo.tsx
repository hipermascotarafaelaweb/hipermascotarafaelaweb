import { cn } from '@/utils/cn';
import Image from 'next/image';

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
    <div
      className={cn('inline-flex select-none', className)}
      aria-label="Hipermascota Rafaela"
    >
      <Image
        src="/logohiperpng.png"
        alt="Hipermascota Rafaela"
        width={240}
        height={96}
        className="h-auto w-auto"
        priority
      />
    </div>
  );
}
