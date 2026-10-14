"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { postJson } from "@/components/api";
import { textButton } from "@/components/styles";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      className={textButton}
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          await postJson("/api/auth/logout");
          router.push("/");
          router.refresh();
        } finally {
          setPending(false);
        }
      }}
    >
      Sign out
    </button>
  );
}
