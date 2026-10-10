// The home page's five secrets. Read by the secrets panel on / and by the
// shell's `eggs` command everywhere else.

export type SecretId = "fling" | "cube" | "logo" | "hello" | "konami";

export const SECRETS: { id: SecretId; title: string; hint: string }[] = [
  { id: "fling", title: "Yeet", hint: "Throw a tile. Really throw it." },
  { id: "cube", title: "Scrambler", hint: "Something in House rules is clickable." },
  { id: "logo", title: "Persistent", hint: "Knock on the logo. A few times." },
  { id: "hello", title: "Polite", hint: "Just type hello. Anywhere. (Needs a keyboard.)" },
  { id: "konami", title: "Old soul", hint: "The footer knows. (Needs a keyboard.)" },
];
