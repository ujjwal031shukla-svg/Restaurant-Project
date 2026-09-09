import '@/styles/globals.css';

export const metadata = {
  title: 'AURA Dine — Interactive 3D Culinary Experience',
  description:
    'Scroll-driven 3D restaurant: signature dishes, table booking, and 360° menu built with Next.js + R3F.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-on-surface antialiased">{children}</body>
    </html>
  );
}
