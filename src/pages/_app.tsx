import type { AppProps } from "next/app";
import Head from "next/head";
import { Providers } from "@/components/Providers";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <Head>
        <title>KittyChain — Decentralized Kitty Party on Monad</title>
        <meta name="description" content="Trustless, on-chain rotating savings club (Kitty Party) for ladies on Monad Testnet. Pool MON, get guaranteed payouts every round." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </Providers>
  );
}
