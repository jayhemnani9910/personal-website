import { Resume } from "@/data/types";

export const RESUME: Resume = {
  name: "Jay Hemnani",
  tagline: "Data Engineer",
  summary: "Data engineer who turns messy datasets into trustworthy pipelines and dashboards. I build SQL/Python automations and models that make metrics reliable for product and executive decisions.",
  location: "San Jose, CA",
  contact: {
    email: "jay.hemnani@sjsu.edu",
    github: "https://github.com/jeyhemnani99",
    linkedin: "https://linkedin.com/in/jayhemnani",
  },
  coreCompetencies: [
    "SQL & Python for large-scale analysis and automation",
    "Data modeling, transformation, and pipeline optimization",
    "Exploratory data analysis & statistical methods",
    "Interactive dashboards & visualization",
    "Experimentation & A/B testing design",
    "Business metrics definition & performance tracking",
    "ETL/ELT workflows and data quality assurance",
    "Cross-functional collaboration with product, engineering, and business teams"
  ],
  skills: [
    {
      category: "Data access",
      items: [{ name: "SQL/NoSQL" }, { name: "CSV/json" }]
    },
    {
      category: "Analysis",
      items: [{ name: "Python" }, { name: "Excel" }]
    },
    {
      category: "Visualization",
      items: [{ name: "Matplotlib" }, { name: "Plotly" }, { name: "dashboards" }]
    },
    {
      category: "Automation",
      items: [{ name: "ETL/ELT jobs" }, { name: "data quality checks" }]
    }
  ],
  experience: [
    {
      name: "Elite Hotel Group",
      roles: [
        {
          title: "Data Analyst",
          employmentType: "full-time",
          bullets: [
            { text: "Automated mission-critical reporting via SQL/Python pipelines, cutting manual effort by 40% and eliminating data drift across weekly/monthly closes." },
            { text: "Engineered consistency checks across multi-source exports, restoring trust in financial and operational KPIs." },
            { text: "Built executive-ready dashboards and variance analyses, enabling proactive decisions on occupancy and revenue trends." }
          ]
        }
      ]
    },
    {
      name: "Freelance / Contract",
      roles: [
        {
          title: "Creative Lead",
          period: { label: "2022–2024" },
          employmentType: "contract",
          summary: "Brand systems & measurable campaigns",
          bullets: [
            { text: "Standardized templates and asset workflows, reducing creative turnaround time by ~30%." },
            { text: "Designed and tracked A/B experiments for campaign operations, using lightweight analytics to optimize engagement." }
          ]
        }
      ]
    },
    {
      name: "Amnex",
      roles: [
        {
          title: "AI/ML Intern",
          employmentType: "internship",
          summary: "Analytics & Modeling",
          bullets: [
            { text: "Prototyped ML-based credit-fraud detection, addressing class imbalance to improve F-score on minority classes." }
          ]
        }
      ]
    },
    {
      name: "Cygnus SoftTech",
      roles: [
        {
          title: "iOS Development Intern",
          employmentType: "internship",
          summary: "Product Engineering",
          bullets: [
            { text: "Built “CodeLock” (privacy/security) in Swift, implementing encryption-first flows and a polished native UI." }
          ]
        }
      ]
    },
    {
      name: "Cactus Creatives Pvt. Ltd.",
      roles: [
        {
          title: "AI/ML Intern",
          employmentType: "internship",
          summary: "Recommendations & Delivery",
          bullets: [
            { text: "Designed a hybrid recommendation engine (popularity + collaborative filtering) to boost user retention." }
          ]
        }
      ]
    }
  ],
  education: [
    {
      institution: "San José State University",
      degree: "M.S. in Data Analytics",
      location: "San Jose, CA",
      courses: ["Data Warehousing & Pipeline", "Big Data Analytics", "Distributed Systems", "NLP", "Computer Vision", "Applied Statistics"]
    },
    {
      institution: "Pandit Deendayal Energy University (PDEU)",
      degree: "B.Tech in Computer Engineering",
      location: "Gujarat, India",
      gpa: "3.7/4.0"
    }
  ],
  publications: [
    {
      title: "Diabetes Prediction using Stacking Classifier",
      description: "six-model stack (~82.68% accuracy)."
    },
    {
      title: "Efficient Vaccine Scheduler",
      description: "priority-aware scheduling inspired by OS CPU scheduling."
    }
  ]
};
