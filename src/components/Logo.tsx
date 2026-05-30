export default function Logo({ className = 'h-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Hipermascota Rafaela"
    >
      {/* Paw icon */}
      <circle cx="12" cy="10" r="4" fill="#6B8E23" />
      <circle cx="24" cy="8" r="4" fill="#6B8E23" />
      <circle cx="36" cy="10" r="4" fill="#6B8E23" />
      <circle cx="8" cy="20" r="4" fill="#6B8E23" />
      <circle cx="40" cy="20" r="4" fill="#6B8E23" />
      <ellipse cx="24" cy="26" rx="14" ry="12" fill="#6B8E23" />
      {/* Text: Hipermascota */}
      <text
        x="54"
        y="24"
        fontFamily="'Arial Black', 'Helvetica Neue', sans-serif"
        fontWeight="900"
        fontSize="22"
        fill="#4A7A2E"
        letterSpacing="0.5"
      >
        Hipermascota
      </text>
      {/* Text: Rafaela */}
      <text
        x="54"
        y="46"
        fontFamily="'Arial Black', 'Helvetica Neue', sans-serif"
        fontWeight="900"
        fontSize="20"
        fill="#8CB63C"
        letterSpacing="1"
      >
        Rafaela
      </text>
    </svg>
  );
}
