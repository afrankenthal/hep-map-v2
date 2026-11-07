import 'maplibre-gl/dist/maplibre-gl.css';
import './globals.css'

export const metadata = {
  title: 'HEPMAP — A world of particle physics',
  description: 'Explore particle physics experiments, follow discovery journeys, and meet the big questions behind the smallest particles.',
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
