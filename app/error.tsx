"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorComponent({
  error,
  reset,
}: Readonly<{
  error: Error;
  reset: () => void;
}>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
      <p>
        <Link href="/">← Back to Home page</Link>
      </p>
    </div>
  );
}
