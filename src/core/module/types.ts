export type ModuleStatus = "available" | "deprecated" | "retired";

export type ModuleDefinition = {
  moduleKey: string;
  displayName: string;
  description: string;
  status: ModuleStatus;
};
