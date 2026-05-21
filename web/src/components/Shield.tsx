type ShieldProps = {
  size?: number;
  strokeWidth?: number;
  variant?: 'light' | 'dark';
};

const SHIELD_PATH =
  'M 2 2 L 98 2 L 98 60 C 98 102, 50 134, 50 134 C 50 134, 2 102, 2 60 Z';

export function Shield({ size = 96, strokeWidth, variant = 'light' }: ShieldProps) {
  const sw = strokeWidth ?? (size <= 24 ? 4 : size <= 48 ? 3 : size <= 96 ? 2.4 : 2);
  const argent = variant === 'dark' ? '#F1E9D6' : '#FFFFFF';
  const id = `kcw-shield-${size}-${variant}`;
  return (
    <svg viewBox="0 0 100 140" width={size} height={(size * 140) / 100} aria-label="KCW Operations">
      <defs>
        <clipPath id={id}><path d={SHIELD_PATH} /></clipPath>
      </defs>
      <rect x="0"  y="0" width="50" height="140" fill="#701414" clipPath={`url(#${id})`} />
      <rect x="50" y="0" width="50" height="140" fill={argent}   clipPath={`url(#${id})`} />
      <path d={SHIELD_PATH} fill="none" stroke="#701414" strokeWidth={sw} strokeLinejoin="round" />
    </svg>
  );
}
