const template = document.createElement("template");
template.innerHTML = `
<style>
div#list {
  height: var(--height);
  width: var(--width);  
  border: var(--border);
  padding: var(--padding);
  overflow: scroll;
  scrollbar-width: none;
}
</style>
<div id="list">
  <slot></slot>
</div>
`;

export type Renderer<T> = (item: T) => HTMLElement;

export class LazyList<T> extends HTMLElement {
  // By default, the list renders the items as div-s with strings in them.
  #renderFunction: Renderer<T> = (item) => {
    const element = document.createElement("div");
    element.innerText = JSON.stringify(item);
    return element;
  };

  // These could be useful properties to consider, but not mandatory to use.
  // Similarly, feel free to edit the shadow DOM template in any way you want.

  // By default, the list is empty.
  #data: T[] = [];

  // The container that stores the spacer elements and the slot where items are inserted.
  #listElement: HTMLElement;

  // The index of the first item in the view.
  #view = 1;

  static register() {
    customElements.define("lazy-list", LazyList);
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.#listElement = this.shadowRoot.querySelector<HTMLElement>("#list")!;

    this.#listElement.onscroll = () => {
      this.#handleScroll(this.#listElement.scrollTop);
    };
  }

  #handleScroll(scrollTop: number) {
    if (this.#data.length < 4) {
      return;
    }

    if (scrollTop >= 410 + 410) {
      if (this.#view + 3 > this.#data.length - 1) {
        return;
      }

      this.#view = this.#view + 1;
      this.#reconnnedChildren(this.#view - 1);
      this.#listElement.scrollTop = 410;
    } else if (scrollTop <= 0) {
      if (this.#view - 2 < 0) {
        return;
      }

      this.#view = this.#view - 1;
      this.#reconnnedChildren(this.#view - 1);
      this.#listElement.scrollTop = 410;
    }
  }

  #reconnnedChildren(from: number) {
    this.removeChild(this.querySelector("div"));
    this.removeChild(this.querySelector("div"));
    this.removeChild(this.querySelector("div"));
    this.removeChild(this.querySelector("div"));

    this.appendChild(this.#renderFunction(this.#data[from]));
    this.appendChild(this.#renderFunction(this.#data[from + 1]));
    this.appendChild(this.#renderFunction(this.#data[from + 2]));
    this.appendChild(this.#renderFunction(this.#data[from + 3]));
  }

  setData(data: T[]) {
    this.#data = data;

    if (this.#data.length < 4) {
      for (let i = 0; i < this.#data.length; i++) {
        this.appendChild(this.#renderFunction(this.#data[i]));
      }
    } else {
      for (let i = 0; i < 4; i++) {
        this.appendChild(this.#renderFunction(this.#data[i]));
      }

      this.#view = 1;
    }
  }

  setRenderer(renderer: Renderer<T>) {
    this.#renderFunction = renderer;
    this.setData(this.#data);
  }
}
