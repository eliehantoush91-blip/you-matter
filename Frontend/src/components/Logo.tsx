const Logo = ({ className = "w-8 h-8" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer circle - represents wholeness and peace */}
      <circle
        cx="32"
        cy="32"
        r="28"
        className="fill-primary/10 stroke-primary"
        strokeWidth="2"
      />
      
      {/* Brain/Mind shape - stylized */}
      <path
        d="M32 12C22 12 16 20 16 28C16 32 18 36 22 38C22 42 24 46 28 48C30 49 32 50 32 50C32 50 34 49 36 48C40 46 42 42 42 38C46 36 48 32 48 28C48 20 42 12 32 12Z"
        className="fill-primary/20 stroke-primary"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Heart in center - represents emotional wellbeing */}
      <path
        d="M32 28C32 28 28 24 26 26C24 28 24 31 26 33L32 39L38 33C40 31 40 28 38 26C36 24 32 28 32 28Z"
        className="fill-accent stroke-accent"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Gentle waves - represents calmness */}
      <path
        d="M20 44C22 42 26 42 28 44C30 46 34 46 36 44C38 42 42 42 44 44"
        className="stroke-primary"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default Logo;

