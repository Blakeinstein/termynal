export enum LineType {
  INPUT = "input",
  OUTPUT = "output",
  PROGRESS = "progress",
}

export interface LineOptions {
  startDelay: number;
  typeDelay: number;
  progressLength: number;
  progressChar: string;
  progressPercent: number;
  cursor: string;
  type: LineType;
  delay: number;
}

export type LineData = LineOptions & {
  value: string;
};
