/**
 * Lab Experiments Content
 * 
 * Edit this file to update the "Lab" section experiments.
 */

export type ExperimentStatus = "In Progress" | "Exploration" | "Concept" | "Shipped";

export interface Experiment {
  id: string;
  title: string;
  description: string;
  icon: "flask" | "terminal" | "cpu" | "zap" | "brain";
  status: ExperimentStatus;
  link?: string;
}

export const EXPERIMENTS: Experiment[] = [
  {
    id: "match-analytics",
    title: "Match Analytics",
    description: "Real-time xG models running in browser via ONNX.",
    icon: "flask",
    status: "In Progress",
  },
  {
    id: "local-ai",
    title: "Local AI Tools",
    description: "Ollama integration for private doc search.",
    icon: "terminal",
    status: "Exploration",
  },
  {
    id: "pipeline-gen",
    title: "Pipeline Generator",
    description: "DSL to Airflow DAG transpiler.",
    icon: "cpu",
    status: "Concept",
  },
];

