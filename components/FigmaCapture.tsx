"use client";
import { useEffect } from "react";

// Loads Figma's html-to-design capture script only when the URL asks for it (#figmacapture=…).
export default function FigmaCapture() {
  useEffect(() => {
    if (!location.hash.includes("figmacapture")) return;
    const s = document.createElement("script");
    s.src = "https://mcp.figma.com/mcp/html-to-design/capture.js";
    s.async = true;
    document.head.appendChild(s);
  }, []);
  return null;
}
