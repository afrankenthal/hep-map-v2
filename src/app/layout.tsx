import 'maplibre-gl/dist/maplibre-gl.css';
import './globals.css'

export const metadata = {
  title: 'HEPMAP — Particle physics experiments',
  description: 'Map particle physics experiments, explore Standard Model discovery histories, and find sources for historical and current research.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
