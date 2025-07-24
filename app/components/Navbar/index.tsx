"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-black text-white p-4 ">
      <div className="container mx-auto flex justify-center items-center">
        <div className="space-x-4">
          <Link href="/" className="hover:text-gray-300 mr-40">
            Home
          </Link>
          <Link href="/orca" className="hover:text-gray-300">
            orca
          </Link>
          <Link href="/letry" className="hover:text-gray-300">
            letry
          </Link>
          <Link href="/particles" className="hover:text-gray-300">
            particles
          </Link>
        </div>
      </div>
    </nav>
  );
}
