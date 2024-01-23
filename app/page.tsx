"use client";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    redirect("/index.html");
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-black">
      <iframe
        src="https://giphy.com/embed/3oeHLhzRkRX1bQQBPi"
        width="480"
        height="360"
        frameBorder="0"
        className="giphy-embed"
        allowFullScreen
      ></iframe>
    </main>
  );
}
