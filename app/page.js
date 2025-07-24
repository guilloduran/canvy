"use client";
import { useEffect, useRef } from "react";

export default function Home() {
  const containerRef = useRef(null);
  const scriptOutputRef = useRef(null);

  useEffect(() => {
    if (scriptOutputRef.current) {
      const originalAppendChild = document.body.appendChild;

      document.body.appendChild = function (element) {
        if (scriptOutputRef.current) {
          return scriptOutputRef.current.appendChild(element);
        }
        return originalAppendChild.call(this, element);
      };

      const script = document.createElement("script");
      script.src = "/network.js";
      script.async = true;
      scriptOutputRef.current.appendChild(script);

      return () => {
        document.body.appendChild = originalAppendChild;
        if (scriptOutputRef.current) {
          scriptOutputRef.current.removeChild(script);
        }
      };
    }
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center h-full"
      ref={containerRef}
    >
      <div
        id="script-output"
        ref={scriptOutputRef}
        className="mx-auto w-full h-full flex justify-center"
      ></div>
    </div>
  );
}
