import { LineOptions } from "./LineTypes";

type TermynalOptions = Omit<LineOptions, "delay" | "type"> & {
  lineDelay: number;
  prefix: string;
  autoplay: boolean;
};

export const DefaultOptions: TermynalOptions = {
  prefix: "ty",
  startDelay: 600,
  typeDelay: 50,
  lineDelay: 1500,
  progressLength: 40,
  progressChar: "█",
  progressPercent: 100,
  cursor: "▋",
  autoplay: false,
  className: "",
};

export default TermynalOptions;
