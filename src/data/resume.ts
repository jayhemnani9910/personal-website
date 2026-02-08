import { Resume } from "@/data/types";

export const RESUME: Resume = {
  name: "Jay Hemnani",
  tagline: "Data Engineer",
  summary: "End-to-end builder with production experience in computer vision systems and sports analytics. I ship fast—prototypes to production in days, not weeks—combining deep technical expertise with a relentless focus on user impact and operational excellence.",
  location: "San Jose, CA",
  contact: {
    email: "jayhemnani992000@gmail.com",
    github: "https://github.com/jayhemnani9910",
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
      category: "Languages",
      items: [{ name: "Python" }, { name: "SQL" }, { name: "Java" }, { name: "Go" }, { name: "JavaScript" }, { name: "TypeScript" }]
    },
    {
      category: "Data",
      items: [{ name: "PostgreSQL" }, { name: "MySQL" }, { name: "MongoDB" }, { name: "Redis" }, { name: "TimescaleDB" }, { name: "Pandas" }]
    },
    {
      category: "ML/AI",
      items: [{ name: "PyTorch" }, { name: "PyTorch Geometric" }, { name: "FAISS" }, { name: "LangChain" }, { name: "LangGraph" }, { name: "Scikit-learn" }]
    },
    {
      category: "MLOps",
      items: [{ name: "MLflow" }, { name: "DVC" }, { name: "Weights & Biases" }, { name: "Airflow" }]
    },
    {
      category: "Cloud",
      items: [{ name: "AWS" }, { name: "GCP" }, { name: "Docker" }, { name: "Kubernetes" }, { name: "Kafka" }]
    },
    {
      category: "Visualization",
      items: [{ name: "Streamlit" }, { name: "Plotly" }, { name: "Tableau" }, { name: "Dash" }]
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
          tech: ["Python", "SQL", "Tableau", "Excel", "Power BI", "Airflow"],
          bullets: [
            { text: "Automated reporting pipelines with SQL/Python, reducing manual work and improving data consistency." },
            { text: "Built dashboards for occupancy and revenue tracking across multiple properties." },
            { text: "Developed demand forecasting models to support revenue management decisions." }
          ]
        }
      ]
    },
    {
      name: "Freelance / Contract",
      roles: [
        {
          title: "Creative Lead",
          period: { label: "2022–2024", start: "2022-01", end: "2024-01" },
          employmentType: "contract",
          location: "Remote",
          tech: ["Figma", "Adobe Creative Suite", "Google Analytics", "Mixpanel"],
          summary: "Brand systems & measurable campaigns",
          bullets: [
            { text: "Delivered brand identity systems and marketing assets for clients in tech and hospitality." },
            { text: "Ran A/B experiments on campaigns and tracked engagement metrics." }
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
          tech: ["Python", "Scikit-learn", "TensorFlow", "Pandas", "NumPy"],
          summary: "Analytics & Modeling",
          bullets: [
            { text: "Built credit fraud detection system using ML with techniques for handling class imbalance (SMOTE, ensemble methods)." },
            { text: "Created data analytics dashboards with statistical models for operational reporting." }
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
          summary: "Product Engineering",
          bullets: [
            { text: "Developed CodeLock, an iOS privacy/security app with encryption and secure local storage." },
            { text: "Tracked user engagement metrics and iterated on UX based on usage patterns." }
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
          tech: ["Azure", "CI/CD", "Microservices", "REST APIs"],
          summary: "Cloud-Native Development",
          bullets: [
            { text: "Built a cloud-native communication platform for first responders using microservices on Azure." },
            { text: "Set up CI/CD pipelines for automated testing and deployment." }
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
        "Software Development",
        "Internet of Things",
        "Operating Systems",
        "Big Data Analytics",
        "Computer Vision",
        "Natural Language Processing"
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
