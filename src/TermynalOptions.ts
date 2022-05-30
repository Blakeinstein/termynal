import { LineOptions } from "./LineTypes";

type TermynalOptions = Omit<LineOptions, "delay" | "type"> & {
  lineDelay: number;
  prefix: string;
  autoplay: boolean;
};

export default TermynalOptions;
