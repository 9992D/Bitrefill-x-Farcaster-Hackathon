// app/page.tsx
"use client";
import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export default function Home() {
  useEffect(() => {
    // Mark Mini App as ready so the splash screen goes away in Farcaster
    sdk.actions.ready();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Hello World</h1>
      <p>Welcome to your Farcaster Mini App!</p>
    </main>
  );
}
