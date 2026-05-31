import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Hipermascota Rafaela — Accesorios para mascotas';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f4faea 0%, #ffffff 55%, #e6f3cd 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 96, fontWeight: 800, color: '#689a22' }}>
          Hipermascota
        </div>
        <div style={{ display: 'flex', fontSize: 96, fontWeight: 800, color: '#8dc63f', marginTop: -10 }}>
          Rafaela
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 28,
            fontSize: 34,
            color: '#3f5d1c',
            background: '#ffffff',
            padding: '14px 30px',
            borderRadius: 999,
            border: '2px solid #d0e8a1',
          }}
        >
          Accesorios para perros y gatos · Envío gratis en Rafaela
        </div>
      </div>
    ),
    { ...size }
  );
}
