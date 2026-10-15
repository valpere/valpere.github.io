import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Марку, це демо для вас — Endorphin / Валентин Соломко',
  description: 'Спеціально для Марка Гетмана: живий приклад Next.js з анімаціями для Endorphin та пояснення реалізації на CSS/JS, Motion і Lenis.',
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="uk"><body>{children}</body></html>;
}
