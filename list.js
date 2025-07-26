export class List {
  #size = 0;
  #cursor;
  constructor(entries) {
    if(entries != null) {
      for(const value of entries) {
        this.push(value);
        this.rotate();
      }
    }
  }
  push(value) {
    // Increase the size of the list
    this.#size += 1;
    // Create the current node
    const current = {
      value,
    };
    // If there is a cursor already, link it
    if(this.#cursor == null) {
      this.#cursor = current.next = current;
    } else {
      current.next = this.#cursor.next;
      this.#cursor.next = current;
    }
    // Chain
    return this;
  }
  pop() {
    // If there is no cursor, we don't have anything to pop
    if(this.#cursor == null) {
      return undefined;
    }
    // Decrease the length
    this.#size -= 1;
    // Load the values and links
    const first = this.#cursor.next;
    const { value, next } = first;
    // Pointing to itself, means it is the only one
    if(first === this.#cursor) {
      this.#cursor = undefined;
    } else {
      this.#cursor.next = next;
    }
    // Return the value
    return value;
  }
  peek() {
    return this.#cursor?.next.value;
  }
  clear() {
    this.#cursor = undefined;
    this.#size = 0;
  }
  rotate() {
    if(this.#cursor != null) {
      this.#cursor = this.#cursor.next;
    }
    return this;
  }
  get size() {
    return this.#size;
  }
  [Symbol.iterator]() {
    // If there is no cursor, we don't have anythign to pop
    if(this.#cursor == null) {
      return {
        [Symbol.iterator]() {
          return this;
        },
        next: () => ({
          done: true,
          value: undefined,
        }),
      };
    }
    const first = this.#cursor.next;
    let current = first;
    let iterated = false;
    return {
      [Symbol.iterator]() {
        return this;
      },
      next: () => {
        if(iterated) {
          return {
            value: undefined,
            done: true,
          };
        }
        const { value, next } = current;
        current = next;
        if(current === first) {
          iterated = true;
        }
        // Stop when we reach the first element again
        return {
          value,
          done: false,
        };
      },
    };
  }
  keys() {
    return this[Symbol.iterator]();
  }
  values() {
    return this[Symbol.iterator]();
  }
  entities() {
    const iterator = this[Symbol.iterator]();
    return {
      [Symbol.iterator]() {
        return this;
      },
      next: () => {
        const { value, done } = iterator.next();
        return {
          value: [value, value],
          done,
        };
      },
    };
  }
  forEach(callbackFn, thisArg) {
    for(const value of this) {
      callbackFn.call(thisArg, value, value, this);
    }
  }
}
export default List;
