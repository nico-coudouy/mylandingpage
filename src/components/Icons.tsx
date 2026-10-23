type IconProps = { size?: number };

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export const ArrowDown = ({ size = 16 }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} strokeWidth={2.2} {...base}>
    <path d="M12 5v14M5 12l7 7 7-7" />
  </svg>
);

export const ArrowUpRight = ({ size = 16 }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} strokeWidth={2.2} {...base}>
    <path d="M7 17L17 7M8 7h9v9" />
  </svg>
);

export const CodeIcon = ({ size = 22 }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} strokeWidth={2} {...base}>
    <path d="M8 9l-4 3 4 3M16 9l4 3-4 3M13.5 6l-3 12" />
  </svg>
);

export const VideoIcon = ({ size = 22 }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} strokeWidth={2} {...base}>
    <rect x="3" y="6" width="13" height="12" rx="2" />
    <path d="M16 10l5-3v10l-5-3" />
  </svg>
);

export const SendIcon = ({ size = 18 }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} strokeWidth={2.2} {...base}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
