'use client';
import React, { useEffect, useRef } from "react";

export default function Orca() {
  const containerRef = useRef(null);
  const scriptOutputRef = useRef(null);

  useEffect(() => {
    console.log("Orca");

    if (scriptOutputRef.current) {
      // Save original appendChild
      const originalAppendChild = document.body.appendChild;

      // Override appendChild
      document.body.appendChild = function (element) {
        if (scriptOutputRef.current) {
          return scriptOutputRef.current.appendChild(element);
        }
        return originalAppendChild.call(this, element);
      };

      const script = document.createElement("script");
      script.src = "orca.js";
      script.async = true;
      scriptOutputRef.current.appendChild(script);

      return () => {
        // Restore original appendChild
        document.body.appendChild = originalAppendChild;
        if (scriptOutputRef.current) {
          scriptOutputRef.current.removeChild(script);
        }
      };
    }
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center"
      ref={containerRef}
      style={{ height: 'calc(100vh - 56px)' }}
    >
      <div id="script-output" ref={scriptOutputRef} className="mx-auto"></div>
    </div>
  );
}