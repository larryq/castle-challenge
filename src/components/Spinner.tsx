"use client";

import React from "react";

const Spinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    </div>
  );
};

export default Spinner;
