export default function Logo({ size = 30 }: { size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="16" fill="var(--accent)" /><circle cx="32" cy="32" r="15" fill="none" stroke="#fff" strokeWidth="4" /><path d="M20 24c8 3 16 3 24 0M20 40c8-3 16-3 24 0" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>
      <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-0.5px', color: '#2a0b1c' }}>Play<span style={{ color: 'var(--accent)' }}>Smart</span></span>
    </span>
  )
}
