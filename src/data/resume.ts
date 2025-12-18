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
          period: { label: "Summer 2021", start: "2021-05", end: "2021-08" },
          location: "Gujarat, India",
          tech: ["Python", "Scikit-learn", "TensorFlow", "Pandas", "NumPy"],
          summary: "Analytics & Modeling",
          bullets: [
            { text: "Prototyped ML-based credit-fraud detection, addressing class imbalance to improve F-score on minority classes." },
            { text: "Implemented SMOTE and ensemble techniques to handle imbalanced datasets with 99.9% negative class ratio." },
            { text: "Reduced false positive rate by 35% while maintaining high recall for fraud detection." }
          ]
        }
      ]
    },
    {
      name: "Cygnus SoftTech",
      location: "Gujarat, India",
      roles: [
        {
          title: "iOS Development Intern",
          employmentType: "internship",
          period: { label: "Summer 2020", start: "2020-05", end: "2020-08" },
          location: "Gujarat, India",
          tech: ["Swift", "UIKit", "Core Data", "Xcode", "Git"],
          summary: "Product Engineering",
          bullets: [
            { text: "Built 'CodeLock' (privacy/security) in Swift, implementing encryption-first flows and a polished native UI." },
            { text: "Implemented AES-256 encryption for secure local storage of sensitive user data." },
            { text: "Achieved 4.5+ star rating on App Store with 1000+ downloads in first month." }
          ]
        }
      ]
    },
    {
      name: "Cactus Creatives Pvt. Ltd.",
      location: "Gujarat, India",
      roles: [
        {
          title: "AI/ML Intern",
          employmentType: "internship",
          period: { label: "Winter 2019", start: "2019-12", end: "2020-02" },
          location: "Gujarat, India",
          tech: ["Python", "Flask", "MongoDB", "Collaborative Filtering", "REST APIs"],
          summary: "Recommendations & Delivery",
          bullets: [
            { text: "Designed a hybrid recommendation engine (popularity + collaborative filtering) to boost user retention." },
            { text: "Increased user engagement by 22% through personalized content recommendations." },
            { text: "Built RESTful APIs to serve real-time recommendations with <100ms latency." }
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
      location: "Gujarat, India",
      start: "2018",
      end: "2022",
      gpa: "3.7/4.0",
      courses: [
        "Data Structures & Algorithms",
        "Database Management Systems",
        "Operating Systems",
        "Computer Networks",
        "Software Engineering",
        "Artificial Intelligence",
        "Web Development",
        "Mobile App Development"
      ],
      achievements: [],
      thesis: "Credit Card Fraud Detection using Ensemble Learning",
      thesisDescription: "Developed an ensemble machine learning system combining Random Forest, XGBoost, and Neural Networks to detect fraudulent transactions with 98.5% accuracy on imbalanced datasets."
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
      link: "",
      github: ""
    },
    {
      title: "Efficient Vaccine Scheduler using Priority Queue Algorithms",
      venue: "Journal of Healthcare Informatics",
      year: "2021",
      description: "Priority-aware scheduling inspired by OS CPU scheduling algorithms.",
      abstract: "We propose an efficient vaccine distribution scheduler that applies operating system CPU scheduling principles to healthcare logistics. The system uses a multi-level priority queue considering age, health conditions, and occupation to optimize vaccine appointment allocation. Simulation results show 40% improvement in throughput and 60% reduction in wait times compared to FCFS approaches. The algorithm was deployed in a pilot program serving 50,000+ citizens.",
      coAuthors: [],
      link: "",
      github: ""
    }
  ]
};
