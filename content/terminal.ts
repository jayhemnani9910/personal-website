/**
 * Terminal Easter Egg Content
 * 
 * Edit this file to update the terminal overlay content.
 */

export const TERMINAL_FILES: Record<string, string> = {
  "about.txt": "Forward Deployed Engineer & Full Stack Developer. Building resilient systems at scale.",
  "projects.md": "Type 'projects' to navigate to the projects page.",
  "contact.txt": `Email: jayhemnani992000@gmail.com
GitHub: github.com/jayhemnani9910
LinkedIn: linkedin.com/in/jayhemnani`,
  "skills.json": JSON.stringify({
    languages: ["Python", "SQL", "TypeScript", "JavaScript", "Java", "Go"],
    frameworks: ["FastAPI", "Flask", "React", "Next.js", "Streamlit"],
    data: ["PostgreSQL", "Kafka", "Airflow", "Redis", "TimescaleDB", "Pandas"],
    cloud: ["AWS", "GCP", "Docker", "Kubernetes"],
    ml: ["PyTorch", "PyTorch Geometric", "FAISS", "LangChain", "LangGraph", "YOLOv8"],
    mlops: ["MLflow", "DVC", "Weights & Biases", "Ollama"]
  }, null, 2),
  "education.md": `## Education

**Pandit Deendayal Energy University**
B.Tech in Computer Engineering | GPA: 8.7/10 | Gujarat, India`,
  "experience.md": `## Experience

**Data Analyst** @ Elite Hotel Group
- End-to-end data pipelines and analytics

**Technical Consultant** @ Independent (2022-2024)
- Data analytics and automation consulting

**AI/ML Intern** @ Amnex
- Credit fraud detection and analytics

**iOS Dev Intern** @ Cygnus SoftTech
- Privacy app with on-device encryption

**SWE Intern** @ Cactus Creatives
- Cloud-native platform on Azure, CI/CD`,
  "secret.log": "ACCESS DENIED. ENCRYPTED. Nice try though!",
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

