"use client";

import { useDesk } from "./SecretsProvider";

export function CopyEmail({ email }: { email: string }) {
  const { say } = useDesk();
  const [user, host] = email.split("@");

  const copy = () => {
    const refused = () => say(`Clipboard said no. It's ${email}.`);
    if (!navigator.clipboard) return refused();
    navigator.clipboard.writeText(email).then(() => say("Copied. Now you have no excuse."), refused);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="my-2 mb-3.5 block cursor-copy text-left text-[length:clamp(24px,5vw,72px)] font-extrabold leading-none tracking-[-0.04em] [overflow-wrap:anywhere] hover:text-desk-butter"
    >
      {user}
      <wbr />@{host}
      <span className="sr-only"> (copy to clipboard)</span>
    </button>
  );
}
