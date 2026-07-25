import { ImageResponse } from 'next/og'

export const socialImageSize = {
  width: 1200,
  height: 630,
}

export function createSocialImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          color: '#f5f5f5',
          backgroundColor: '#080b09',
          backgroundImage:
            'radial-gradient(circle at 80% 20%, rgba(52,211,153,0.22), transparent 38%)',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(52,211,153,0.45)',
              borderRadius: 14,
              background: 'rgba(52,211,153,0.1)',
              color: '#34d399',
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            S
          </div>
          <div
            style={{
              display: 'flex',
              marginLeft: 18,
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            Shipyard
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 930 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 66,
              lineHeight: 1.04,
              fontWeight: 700,
              letterSpacing: '-0.045em',
            }}
          >
            Deploy Intelligent Contracts from your browser.
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 24,
              color: '#a3a3a3',
              fontSize: 26,
              lineHeight: 1.4,
            }}
          >
            Upload Python, configure parameters, and deploy across GenLayer environments.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', color: '#6ee7b7', fontSize: 20 }}>
          Bradbury · Asimov · Studionet · Localnet · Clarke coming soon
        </div>
      </div>
    ),
    socialImageSize,
  )
}
