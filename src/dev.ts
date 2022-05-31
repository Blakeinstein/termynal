import "./termynal.css";
import Termynal, { LineType } from "./index";

new Termynal("#termynal", { autoplay: true }, [
  { type: LineType.INPUT, value: "pip install spacy" },
  { value: "Are you sure you want to install 'spaCy'?" },
  { type: LineType.INPUT, typeDelay: 1000, prompt: "(y/n)", value: "y" },
  { delay: 1000, value: "Installing spaCy..." },
]);
