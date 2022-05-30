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

export type TermynalOptions = Exclude<LineOptions, "delay" | "type"> & {
  lineDelay: number;
  prefix: string;
  autoplay: boolean;
};

const DefaultOptions: TermynalOptions = {
  prefix: "ty",
  startDelay: 600,
  typeDelay: 90,
  lineDelay: 1500,
  progressLength: 40,
  progressChar: "█",
  progressPercent: 100,
  cursor: "▋",
  autoplay: false,
};

class Termynal {
  container: HTMLElement;
  options: TermynalOptions;
  lines: LineData[];

  constructor(
    container = "#termynal",
    options: Partial<TermynalOptions> = {},
    lineData: LineData[] = []
  ) {
    const containerElement =
      typeof container === "string"
        ? document.querySelector(container)
        : container;
    if (!containerElement) {
      throw new Error("Termynal container not found.");
    }
    this.container = containerElement as HTMLElement;
    this.options = this.mergeOptions(options);
    this.lines = lineData;
    if (this.options.autoplay) this.init();
  }

  /**
   * Initialise the widget, get lines, clear container and start animation.
   */
  init() {
    // Appends dynamically loaded lines to existing line elements.
    this.lines = this._ElementsToLineData(
      Array.from(
        this.container.querySelectorAll(`[data-${this.options.prefix}]`)
      ) as HTMLElement[]
    ).concat(this.lines);

    /**
     * Calculates width and height of Termynal container.
     * If container is empty and lines are dynamically loaded, defaults to browser `auto` or CSS.
     */
    const containerStyle = getComputedStyle(this.container);
    containerStyle.width !== "0px" &&
      (this.container.style.width = containerStyle.width);
    containerStyle.height !== "0px" &&
      (this.container.style.minHeight = containerStyle.height);

    this.container.setAttribute("data-termynal", "");
    this.container.innerHTML = "";
    this.start();
  }

  mergeOptions(options: Partial<TermynalOptions>): TermynalOptions {
    const attrOptions: Partial<TermynalOptions> = {};
    const dataset = this.container.dataset;

    dataset["startDelay"] &&
      (attrOptions["startDelay"] = parseFloat(dataset["startDelay"]));
    dataset["typeDelay"] &&
      (attrOptions["typeDelay"] = parseFloat(dataset["typeDelay"]));
    dataset["lineDelay"] &&
      (attrOptions["lineDelay"] = parseFloat(dataset["lineDelay"]));
    dataset["progressLength"] &&
      (attrOptions["progressLength"] = parseFloat(dataset["progressLength"]));
    dataset["progressChar"] &&
      (attrOptions["progressChar"] = dataset["progressChar"]);
    dataset["progressPercent"] &&
      (attrOptions["progressPercent"] = parseFloat(dataset["progressPercent"]));
    dataset["cursor"] && (attrOptions["cursor"] = dataset["cursor"]);

    return { ...DefaultOptions, ...options, ...attrOptions };
  }

  /**
   * Start the animation and rener the lines depending on their data attributes.
   */
  async start() {
    await this._wait(this.options.startDelay);
    for (const line of this.lines) {
      const type = line.type || LineType.INPUT;
      const delay = line.delay;
      const el = document.createElement("pre");
      switch (type) {
        case LineType.PROGRESS:
          await this.progress(line);
          break;
        case LineType.INPUT:
          await this.type(line);
          break;
        default:
          el.innerText = line.value;
          this.container.appendChild(el);
      }
      await this._wait(delay);
    }
  }

  /**
   * Animate a typed line.
   * @param {Node} line - The line element to render.
   */
  async type(line: LineData) {
    const chars = line.value.split("");
    const delay = line.delay;
    const el = document.createElement("pre");
    el.textContent = "";
    this.container.appendChild(el);

    for (const char of chars) {
      await this._wait(delay);
      el.textContent += char;
    }
  }

  /**
   * Animate a progress bar.
   * @param {Node} line - The line element to render.
   */
  async progress(line: LineData) {
    const { progressLength, progressChar, progressPercent } = line;
    const chars = progressChar.repeat(progressLength);
    const el = document.createElement("span");
    el.textContent = "";
    this.container.appendChild(el);

    const typeDelay = line.typeDelay;
    for (let i = 0; i <= progressLength; i++) {
      await this._wait(typeDelay);
      const percent = Math.round((i / progressLength) * 100);
      el.textContent = `${chars.slice(0, i + 1)} ${percent}%`;
      if (percent > progressPercent) {
        break;
      }
    }
  }

  /**
   * Helper function for animation delays, called with `await`.
   * @param {number} time - Timeout, in ms.
   */
  _wait(time: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  /**
   * Converts line data objects into line elements.
   *
   * @param {Object[]} lineData - Dynamically loaded lines.
   * @param {Object} line - Line data object.
   * @returns {Element[]} - Array of line elements.
   */
  _ElementsToLineData(lineData: HTMLElement[]): LineData[] {
    return lineData.map((line) => {
      const data: LineData = {
        ...this._getLineAttributes(line),
        type:
          (line.getAttribute(
            `data-${this.options.prefix}`
          ) as LineType | null) || LineType.INPUT,
        value: line.textContent || "",
      };
      return data;
    });
  }

  _getLineAttributes(el: HTMLElement): LineOptions {
    const options: LineOptions = {
      startDelay:
        this._getAttributeAsFloat(el, "startDelay") || this.options.startDelay,
      typeDelay:
        this._getAttributeAsFloat(el, "typeDelay") || this.options.typeDelay,
      progressLength:
        this._getAttributeAsFloat(el, "progressLength") ||
        this.options.progressLength,
      progressChar:
        el.getAttribute(`data-${this.options.prefix}-progressChar`) ||
        this.options.progressChar,
      progressPercent:
        this._getAttributeAsFloat(el, "progressPercent") ||
        this.options.progressPercent,
      cursor:
        el.getAttribute(`data-${this.options.prefix}-cursor`) ||
        this.options.cursor,
    };
    return options;
  }

  _getAttributeAsFloat(
    element: HTMLElement,
    attribute: keyof LineOptions
  ): number | null {
    const attrValue = element.getAttribute(
      `data-${this.options.prefix}-${attribute}`
    );
    return attrValue ? parseFloat(attrValue) : null;
  }
}

export default Termynal;
