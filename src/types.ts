export type FileContent =
  | string
  | { template: string; options?: Record<string, unknown> };

export type StructureNode = {
  [key: string]: StructureNode | FileContent | null;
};

export interface GenerateOptions {
  output?: string;
  dry?: boolean;
  verbose?: boolean;
}

export interface ExportOptions {
  output?: string;
  ignore?: string[];
  depth?: number;
}

export interface ScaffoldResult {
  created: string[];
  skipped: string[];
  errors: string[];
}
