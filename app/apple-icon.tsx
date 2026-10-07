import { ImageResponse } from 'next/og'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'
export default function AppleIcon() {
  return new ImageResponse(
    (<div style={{ width: 180, height: 180, background: '#e11d74', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff5f8', fontSize: 96, fontWeight: 900 }}>PS</div>),
    size
  )
}
