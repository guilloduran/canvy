"use client";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {}, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-black">
      <iframe
        src="https://giphy.com/embed/3oeHLhzRkRX1bQQBPi"
        width="800"
        height="600"
        className="giphy-embed pointer-events-none"
        allowFullScreen
      ></iframe>
    </main>
  );
}
