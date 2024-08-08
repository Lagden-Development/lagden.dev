// app/components/LoadingSpinner.tsx
import React from "react";

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-full">
      <div
        style={{
          border: "2px solid transparent",
          borderTop: "2px solid white",
          borderRadius: "50%",
          width: "30px",
          height: "30px",
          animation: "spin 0.5s linear infinite",
        }}
      ></div>
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
