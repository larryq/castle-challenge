"use client";

import React from "react";

interface PulsatingBullseyeProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  "aria-label": string;
}

const PulsatingBullseye: React.FC<PulsatingBullseyeProps> = ({ ...props }) => {
  //   return (
  //     <button
  //       className="relative flex items-center justify-center w-6 h-6 rounded-full bg-accent cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent animate-bullseye-pulse"
  //       {...props}
  //     >
  //       <div className="w-2 h-2 rounded-full bg-white"></div>
  //     </button>
  //   );

  return (
    <button {...props}>
      <div className="flex justify-center">
        <span className="relative flex h-36 w-36">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-600 opacity-95"></span>
          <span className="relative inline-flex h-36 w-36 rounded-full bg-red-500"></span>
        </span>
      </div>
    </button>
  );
};

export default PulsatingBullseye;
