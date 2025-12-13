/**
 * Terminal Easter Egg Content
 * 
 * Edit this file to update the terminal overlay content.
 */

export const TERMINAL_FILES: Record<string, string> = {
  "about.txt": "Data Engineer & Full Stack Developer. Passionate about building resilient systems.",
  "projects.md": "Check out /projects for a full list of my work.",
  "contact.txt": "Email: jay.hemnani@sjsu.edu",
  "skills.json": '["Python", "SQL", "React", "Next.js", "AWS", "Docker"]',
  "secret.log": "ACCESS DENIED. ENCRYPTED.",
};

export const BOOT_SEQUENCE: string[] = [
  "INITIALIZING JEY-OS KERNEL...",
  "LOADING MODULES: [CPU] [MEM] [NET] [GPU]",
  "MOUNTING FILESYSTEM... OK",
  "ESTABLISHING SECURE CONNECTION... OK",
  "WELCOME TO JEY-OS v2.0.0",
];

export const TERMINAL_CONFIG = {
  prompt: "guest@jey-os:~",
  version: "v2.0.0",
  welcomeMessage: "Type 'help' for available commands.",
};

