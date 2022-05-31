import { LineData, LineOptions, LineType } from "./LineTypes";
import TermynalOptions, { DefaultOptions } from "./TermynalOptions";

/**
 * Termynal is a simple terminal emulator to simulate terminal interactions with ease.
 */
class Termynal {
  container: HTMLElement;
  options: TermynalOptions;
  lines: LineData[];

  /**
   * Create a new Instance of Termynal.
   * @param {string | HTMLElement} container Selector or HTMLElement that will be used as the container for the Termynal.
   * @param {Partial<TermynalOptions>} options typeof TermynalOptions - Options for the Termynal.
   * @param {LineData[]} lineData typeof LineData[] - Additional Lines to be rendered along with any added markup.
   */
  constructor(
    container: string | HTMLElement = "#termynal",
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
    this.options = this._mergeOptions(options);
    this.lines = lineData;
    if (this.options.autoplay) this.init();
  }

  /**
   * Initialise the widget, get lines, clear container and start animation.
   * Called automatically if autoplay is set to true.
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

  /**
   * Internal function to merge options.
   */
  _mergeOptions(options: Partial<TermynalOptions>): TermynalOptions {
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
      const type = line.type || LineType.OUTPUT;
      const delay = line.delay || this.options.lineDelay;
      const el = document.createElement("pre");
      switch (type) {
        case LineType.PROGRESS:
          await this.progress(line);
          break;
        case LineType.INPUT:
          await this.type(line);
          break;
        default:
          el.className =
            "terymnal-output " + line.className || this.options.className;
          el.innerText = line.value || "";
          this.container.appendChild(el);
      }
      await this._wait(delay);
    }
  }

  /**
   * Animate a typed line.
   * @param {LineData} line - The line params to render.
   */
  async type(line: LineData) {
    const chars = line.value?.split("") || [];
    const delay = line.typeDelay || this.options.typeDelay;
    const el = document.createElement("pre");
    el.className = "terymnal-input " + line.className || this.options.className;
    el.textContent = line.prompt ? `${line.prompt} ` : "";
    this.container.appendChild(el);
    for (const char of chars) {
      await this._wait(delay);
      el.textContent += char;
    }
  }

  /**
   * Animate a progress bar.
   * @param {LineData} line - The progress bar params element to render.
   */
  async progress(line: LineData) {
    const progressLength = line.progressLength || this.options.progressLength;
    const progressChar = line.progressChar || this.options.progressChar;
    const progressPercent =
      line.progressPercent || this.options.progressPercent;
    const chars = progressChar.repeat(progressLength);
    const el = document.createElement("pre");
    el.className = "terymnal-input " + line.className || this.options.className;
    el.textContent = "";
    this.container.appendChild(el);

    const typeDelay = line.typeDelay || this.options.typeDelay;
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
   * Internal function to convert line elements to data objects.
   *
   * @param {HTMLElement[]} lines - Lines present on the markup.
   * @returns {LineData[]} - Array of line elements.
   */
  _ElementsToLineData(lineData: HTMLElement[]): LineData[] {
    return lineData.map((line) => {
      const data: LineData = {
        ...this._getLineAttributes(line),
        type:
          (line.getAttribute(
            `data-${this.options.prefix}`
          ) as LineType | null) || LineType.OUTPUT,
        value: line.textContent || "",
      };
      return data;
    });
  }

  /**
   * Internal function to parse dataset on element.
   * @param {HTMLElement} el The Line element to parse
   * @returns {LineOptions} The parsed line options.
   */
  _getLineAttributes(el: HTMLElement): LineOptions {
    const options: LineOptions = {
      delay: this._getAttributeAsFloat(el, "delay") || this.options.lineDelay,
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
      type:
        (el.getAttribute(`data-${this.options.prefix}`) as LineType | null) ||
        LineType.INPUT,
    };
    return options;
  }

  /**
   * Internal function to parse data attribute as a float. Returns null if value is not valid.
   * @param {HTMLElement} element The element to get attribute from.
   * @param {keyof LineOptions} attribute The attribute key to parse.
   * @returns
   */
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
