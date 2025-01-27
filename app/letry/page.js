'use client';
import React, { useEffect, useRef } from "react";

export default function LetryPage() {
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
            script.src = "letry.js";
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
            className="flex flex-col items-center justify-center"
            ref={containerRef}
            style={{ height: 'calc(100vh - 56px)' }}
        >
            <div id="script-output" ref={scriptOutputRef} className="mx-auto"></div>
        </div>
    );
}