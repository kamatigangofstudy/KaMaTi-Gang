import React from "react";

export default function Logo({ className = "" }) {
  return (
    <img
      src="/KaMaTi Gang of Study (2).png"
      alt="App Logo"
      className={className}
      style={{ width: 40, height: 40, borderRadius: 8 }}
    />
  );
}
