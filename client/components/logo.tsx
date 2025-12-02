import Link from "next/link"

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="relative w-8 h-8 flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-foreground group-hover:text-[#e7cc01] transition-colors duration-300"
        >
          <g className="animate-blink" style={{ transformOrigin: "50px 75px" }}>
            {/* Eye Outline */}
            <path
              d="M50 25C25 25 5 50 5 50C5 50 25 75 50 75C75 75 95 50 95 50C95 50 75 25 50 25Z"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="fill-background"
            />
            {/* Lightning Bolt Iris */}
            <g clipPath="url(#eye-clip)">
              <path
                d="M55 35L45 50H55L45 65L65 45H55L65 35H55Z"
                fill="#e7cc01"
                stroke="#e7cc01"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-scan"
              />
            </g>
          </g>
          <defs>
            <clipPath id="eye-clip">
              <path d="M50 25C25 25 5 50 5 50C5 50 25 75 50 75C75 75 95 50 95 50C95 50 75 25 50 25Z" />
            </clipPath>
          </defs>
        </svg>
      </div>
      <span className="font-bold text-xl tracking-tight group-hover:text-[#e7cc01] transition-colors">Blinky</span>
    </Link>
  )
}
