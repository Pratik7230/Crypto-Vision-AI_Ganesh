import type { AppProps } from "next/app";
import { InternetIdentityProvider } from "../hooks/useInternetIdentity";

export default function PagesApp({ Component, pageProps }: AppProps) {
  return (
    <InternetIdentityProvider>
      <Component {...pageProps} />
    </InternetIdentityProvider>
  );
}
