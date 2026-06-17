import '@/styles/globals.css';
import { AppearanceProvider } from '@/contexts/AppearanceContext';

export default function App({ Component, pageProps }) {
  return (
    <AppearanceProvider>
      <Component {...pageProps} />
    </AppearanceProvider>
  );
}
