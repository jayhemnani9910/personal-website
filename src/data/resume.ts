import { Resume } from "@/data/types";

export const RESUME: Resume = {
  name: "Jay Hemnani",
  tagline: "Software & Data Engineer",
  summary: "End-to-end builder across data pipelines, ML systems, and distributed backends. Production experience spanning real-time streaming architectures, computer vision research, and full-stack applications — prototypes to production in days, not weeks.",
  location: "Gujarat, India (Open to Relocate)",
  contact: {
    email: "jayhemnani992000@gmail.com",
    github: "https://github.com/jayhemnani9910",
    linkedin: "https://linkedin.com/in/jayhemnani",
  },
  coreCompetencies: [
    "Data pipeline design, ETL/ELT workflows, and streaming architectures",
    "ML model development, training, and production deployment",
    "Distributed systems and microservices architecture",
    "SQL & Python for large-scale analysis and automation",
    "Interactive dashboards, visualization, and BI reporting",
    "Cloud infrastructure (AWS, GCP, Azure) and containerization",
    "Experimentation design, A/B testing, and statistical methods",
    "Cross-functional collaboration with product, engineering, and business teams"
  ],
  skills: [
    {
      category: "Languages",
      items: [{ name: "Python" }, { name: "SQL" }, { name: "Java" }, { name: "Go" }, { name: "JavaScript" }, { name: "TypeScript" }, { name: "C++" }]
    },
    {
      category: "Backend & APIs",
      items: [{ name: "Node.js" }, { name: "Express" }, { name: "FastAPI" }, { name: "REST APIs" }, { name: "GraphQL" }, { name: "gRPC" }]
    },
    {
      category: "Data Engineering",
      items: [{ name: "Kafka" }, { name: "Airflow" }, { name: "PySpark" }, { name: "Pandas" }, { name: "NumPy" }, { name: "dbt" }, { name: "ETL/ELT" }]
    },
    {
      category: "ML/AI",
      items: [{ name: "PyTorch" }, { name: "PyTorch Geometric" }, { name: "TensorFlow" }, { name: "Scikit-learn" }, { name: "FAISS" }, { name: "LangChain" }, { name: "LangGraph" }, { name: "Hugging Face" }, { name: "YOLOv8" }]
    },
    {
      category: "Databases",
      items: [{ name: "PostgreSQL" }, { name: "MySQL" }, { name: "MongoDB" }, { name: "Redis" }, { name: "TimescaleDB" }, { name: "Pinecone" }, { name: "ChromaDB" }]
    },
    {
      category: "Cloud & DevOps",
      items: [{ name: "AWS" }, { name: "GCP" }, { name: "Azure" }, { name: "Docker" }, { name: "Kubernetes" }, { name: "GitHub Actions" }, { name: "CI/CD" }]
    },
    {
      category: "MLOps",
      items: [{ name: "MLflow" }, { name: "DVC" }, { name: "Weights & Biases" }]
    },
    {
      category: "Visualization",
      items: [{ name: "Tableau" }, { name: "Power BI" }, { name: "Plotly" }, { name: "Streamlit" }, { name: "Dash" }]
    }
  ],
  experience: [
    {
      name: "Elite Hotel Group",
      location: "San Jose, CA",
      roles: [
        {
          title: "Data Analyst",
          employmentType: "full-time",
          period: { label: "Summer 2025", start: "2025-05" },
          location: "San Jose, CA",
          tech: ["Python", "SQL", "Tableau", "Power BI", "Airflow"],
          bullets: [
            { text: "Engineered automated ETL pipelines using SQL and Python, reducing manual data preparation by 40% and improving data consistency across multi-property analytics." },
            { text: "Built interactive dashboards in Tableau and Power BI for occupancy, revenue, and KPI tracking across multiple hotel properties." },
            { text: "Developed demand forecasting models using time-series analysis to support dynamic pricing and revenue management decisions." }
          ]
        }
      ]
    },
    {
      name: "Independent",
      roles: [
        {
          title: "Technical Consultant",
          period: { label: "2022–2024", start: "2022-01", end: "2024-01" },
          employmentType: "contract",
          location: "Remote",
          tech: ["Python", "SQL", "Google Analytics", "Mixpanel", "Tableau", "Figma"],
          summary: "Data analytics & automation consulting",
          bullets: [
            { text: "Provided data analytics and pipeline consulting for small businesses, building reporting automation and data infrastructure solutions." },
            { text: "Designed A/B testing frameworks and tracked engagement metrics to optimize client campaigns and product decisions." }
          ]
        }
      ]
    },
    {
      name: "Amnex",
      location: "Gujarat, India",
      roles: [
        {
          title: "AI/ML Intern",
          employmentType: "internship",
          period: { label: "Jan–May 2022", start: "2022-01", end: "2022-05" },
          location: "Gujarat, India",
          tech: ["Python", "Scikit-learn", "TensorFlow", "Pandas", "NumPy", "XGBoost"],
          summary: "ML Engineering & Analytics",
          bullets: [
            { text: "Built credit fraud detection system using ensemble ML (Random Forest, XGBoost) with SMOTE for class imbalance, achieving 94% precision on transaction data." },
            { text: "Developed automated analytics dashboards with statistical models for operational reporting and anomaly detection." }
          ]
        }
      ]
    },
    {
      name: "Cygnus SoftTech",
      location: "Gujarat, India",
      roles: [
        {
          title: "iOS App Development Intern",
          employmentType: "internship",
          period: { label: "Jun–Aug 2021", start: "2021-06", end: "2021-08" },
          location: "Gujarat, India",
          tech: ["Swift", "UIKit", "Core Data", "Xcode", "Git"],
          summary: "Mobile Engineering",
          bullets: [
            { text: "Developed CodeLock, an iOS privacy/security app with AES encryption and secure local storage using Core Data." },
            { text: "Instrumented user engagement analytics and iterated on UX based on usage patterns and retention data." }
          ]
        }
      ]
    },
    {
      name: "Cactus Creatives Pvt. Ltd.",
      location: "Gujarat, India",
      roles: [
        {
          title: "SWE Intern",
          employmentType: "internship",
          period: { label: "May–Nov 2019", start: "2019-05", end: "2019-11" },
          location: "Gujarat, India",
          tech: ["Azure", "CI/CD", "Microservices", "REST APIs", "Docker"],
          summary: "Cloud-Native Development",
          bullets: [
            { text: "Built cloud-native communication platform for first responders using microservices architecture on Azure with REST APIs." },
            { text: "Configured CI/CD pipelines for automated testing and deployment, reducing deployment time by 60%." }
          ]
        }
      ]
    }
  ],
  education: [
    {
      institution: "Pandit Deendayal Energy University (PDEU)",
      degree: "B.Tech in Computer Engineering",
      location: "Gandhinagar, India",
      start: "2018",
      end: "2022",
      gpa: "8.7/10",
      courses: [
        "Big Data Analytics",
        "Computer Vision",
        "Natural Language Processing",
        "Operating Systems",
        "Database Systems",
        "Software Development"
      ],
      achievements: [
        "Rubik's Cube: 16.7 sec (WCA)",
        "Graphic Design: 2 internships, 1 conference, 1 startup, 3 clubs"
      ],
      thesis: "",
      thesisDescription: ""
    }
  ],
  publications: [
    {
      title: "Diabetes Prediction using Stacking Classifier",
      venue: "IEEE International Conference on Machine Learning & Data Science",
      year: "2022",
      description: "Six-model stack achieving ~82.68% accuracy on PIMA dataset.",
      abstract: "This paper presents a novel stacking ensemble approach for diabetes prediction combining six base classifiers (Random Forest, SVM, KNN, Logistic Regression, Decision Tree, and Naive Bayes) with a meta-learner. The proposed method achieves 82.68% accuracy on the PIMA Indians Diabetes dataset, outperforming individual classifiers by 5-8%. We demonstrate the effectiveness of feature engineering and hyperparameter optimization in improving prediction reliability for early diabetes detection.",
      coAuthors: [],
      link: "https://ieeexplore.ieee.org/document/9670920",
      github: "https://github.com/jayhemnani9910/diabetes-prediction-stacking"
    },
    {
      title: "CPU Scheduling Algorithms Analysis",
      venue: "IEEE International Conference",
      year: "2021",
      description: "Comparative analysis of CPU scheduling algorithms with priority queue optimization.",
      abstract: "This paper presents a comparative study of various CPU scheduling algorithms including FCFS, SJF, Priority, and Round Robin. We analyze their performance metrics and propose optimizations using priority queue data structures for improved throughput and reduced waiting times.",
      coAuthors: [],
      link: "https://ieeexplore.ieee.org/document/9670986",
      github: "https://github.com/jayhemnani9910/cpu-scheduling-algorithms"
    }
  ]
};
