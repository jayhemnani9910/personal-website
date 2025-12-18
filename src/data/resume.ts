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
      items: [{ name: "Python" }, { name: "Java" }, { name: "C++" }, { name: "Swift" }, { name: "Go" }, { name: "Kotlin" }]
    },
    {
      category: "Databases",
      items: [{ name: "MySQL" }, { name: "PySpark" }, { name: "MongoDB" }, { name: "Bash" }]
    },
    {
      category: "Cloud",
      items: [{ name: "AWS" }, { name: "GCP" }, { name: "Azure" }, { name: "Kubernetes" }, { name: "Docker" }]
    },
    {
      category: "Software",
      items: [{ name: "DevOps" }, { name: "CI/CD" }, { name: "Agile" }, { name: "Testing" }]
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
          period: { label: "2024–Present", start: "2024-01" },
          location: "San Jose, CA",
          tech: ["Python", "SQL", "Tableau", "Excel", "Power BI", "Airflow"],
          bullets: [
            { text: "Automated mission-critical reporting via SQL/Python pipelines, cutting manual effort by 40% and eliminating data drift across weekly/monthly closes." },
            { text: "Engineered consistency checks across multi-source exports, restoring trust in financial and operational KPIs." },
            { text: "Built executive-ready dashboards and variance analyses, enabling proactive decisions on occupancy and revenue trends." },
            { text: "Developed predictive models for demand forecasting, improving revenue management accuracy by 25%." },
            { text: "Collaborated with cross-functional teams to define and track key business metrics across 15+ properties." }
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
            { text: "Standardized templates and asset workflows, reducing creative turnaround time by ~30%." },
            { text: "Designed and tracked A/B experiments for campaign operations, using lightweight analytics to optimize engagement." },
            { text: "Delivered brand identity systems for 10+ clients across tech, hospitality, and e-commerce sectors." },
            { text: "Managed end-to-end creative projects from concept to delivery, maintaining 100% on-time delivery rate." }
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
            { text: "Engineered an advanced Credit Fraud Detection system leveraging ML algorithms and data imbalance techniques, resulting in enhanced predictive accuracy and F1-score." },
            { text: "Developed a comprehensive data analytics framework leveraging statistical models and data visualization tools, resulting in a 15% increase in operational efficiency." }
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
            { text: "Led the development of CodeLock, an iOS privacy and security application, implementing robust encryption algorithms and user-friendly design." },
            { text: "Analyzed user engagement metrics to identify areas for improvement. Implemented data-driven changes that led to a 20% increase in user retention." }
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
            { text: "Built a Cloud-Native Communication Platform for First Responders using microservices architecture on Azure." },
            { text: "Implemented cloud-native microservices architecture, increasing deployment velocity by 30%." },
            { text: "Established robust CI/CD pipelines, reducing manual deployment intervention by 15%." }
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
      start: "2023",
      end: "2025",
      gpa: "3.9/4.0",
      courses: [
        "Data Warehousing & Pipeline",
        "Big Data Analytics",
        "Distributed Systems",
        "Natural Language Processing",
        "Computer Vision",
        "Applied Statistics",
        "Machine Learning",
        "Deep Learning",
        "Data Mining",
        "Cloud Computing"
      ],
      achievements: [],
      thesis: "Real-time Sports Analytics Pipeline",
      thesisDescription: "Designed and implemented a scalable data pipeline for real-time sports analytics using Apache Kafka, Spark Streaming, and computer vision models for player tracking and performance metrics."
    },
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
