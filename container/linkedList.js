export class LinkedListItem {
  next = null;
  prev = null;

  constructor(val) {
    this.value = val;
  }
}

export class LinkedList {
  #head = null;
  #tail = null;
  #length = 0;

  constructor(...values) {
    this.#head = this.#tail = null;
    this.#length = 0;

    if(values.length > 0) {
      values.forEach(value => {
        this.append(value);
      });
    }
  }

  *iterator() /*: IterableIterator*/ {
    let currentItem = this.#head;

    while(currentItem) {
      yield currentItem.value;
      currentItem = currentItem.next;
    }
  }

  [Symbol.iterator]() {
    return this.iterator();
  }

  search(pred) {
    let currentItem = this.#head;

    while(currentItem) {
      if(pred(currentItem.value)) return currentItem;
      currentItem = currentItem.next;
    }
  }

  insertBefore(value, pred) {
    let item;

    if((item = this.search(pred))) {
      let newItem = new LinkedListItem();
      newItem.value = value;
      newItem.next = item;

      if((newItem.prev = item.prev)) item.prev.next = newItem;
      else this.#head = newItem;

      item.prev = newItem;
    } else {
      this.append(value);
    }
  }

  get items() {
    return [this.#head, this.#tail];
  }

  get head() {
    return this.#head ? this.#head.value : null;
  }

  get tail() {
    return this.#tail ? this.#tail.value : null;
  }

  get length() /**/ {
    return this.#length;
  }

  // Adds the element at a specific position inside the linked list
  insert(val, previousItem, checkDuplicates /**/ = false) /**/ {
    let predicate =
      typeof previousItem == 'function'
        ? previousItem
        : (() => {
            let prev = previousItem;
            return it => it == prev;
          })();

    if(checkDuplicates && this.isDuplicate(val)) {
      return false;
    }

    let newItem /*: LinkedListItem*/ = new LinkedListItem(/**/ val);
    let currentItem /*: LinkedListItem*/ = this.#head;

    if(!currentItem) {
      return false;
    } else {
      while(true) {
        if(predicate(currentItem.value)) {
          newItem.next = currentItem.next;
          newItem.prev = currentItem;
          currentItem.next = newItem;

          if(newItem.next) {
            newItem.next.prev = newItem;
          } else {
            this.#tail = newItem;
          }
          this.#length++;
          return true;
        } else {
          if(currentItem.next) {
            currentItem = currentItem.next;
          } else {
            // can't locate previousItem
            return false;
          }
        }
      }
    }
  }

  // Adds the element at the end of the linked list
  append(val, checkDuplicates = false) {
    if(checkDuplicates && this.isDuplicate(val)) {
      return false;
    }

    let newItem = new LinkedListItem(val);

    if(!this.#tail) {
      this.#head = this.#tail = newItem;
    } else {
      this.#tail.next = newItem;
      newItem.prev = this.#tail;
      this.#tail = newItem;
    }

    this.#length++;
    return true;
  }

  // Add the element at the beginning of the linked list
  prepend(val, checkDuplicates = false) {
    if(checkDuplicates && this.isDuplicate(val)) {
      return false;
    }

    let newItem = new LinkedListItem(val);

    if(!this.#head) {
      this.#head = this.#tail = newItem;
    } else {
      newItem.next = this.#head;
      this.#head.prev = newItem;
      this.#head = newItem;
    }

    this.#length++;
    return true;
  }

  remove(val) {
    let currentItem = this.#head;

    if(!currentItem) {
      return;
    }

    if(currentItem.value === val) {
      this.#head = currentItem.next;
      this.#head.prev = null;
      currentItem.next = currentItem.prev = null;
      this.#length--;
      return currentItem.value;
    } else {
      while(true) {
        if(currentItem.value === val) {
          if(currentItem.next) {
            // special case for last element
            currentItem.prev.next = currentItem.next;
            currentItem.next.prev = currentItem.prev;
            currentItem.next = currentItem.prev = null;
          } else {
            currentItem.prev.next = null;
            this.#tail = currentItem.prev;
            currentItem.next = currentItem.prev = null;
          }
          this.#length--;
          return currentItem.value;
        } else {
          if(currentItem.next) {
            currentItem = currentItem.next;
          } else {
            return;
          }
        }
      }
    }
  }

  removeHead() {
    let currentItem = this.#head;

    // empty list
    if(!currentItem) {
      return;
    }

    // single item list
    if(!this.#head.next) {
      this.#head = null;
      this.#tail = null;

      // full list
    } else {
      this.#head.next.prev = null;
      this.#head = this.#head.next;
      currentItem.next = currentItem.prev = null;
    }

    this.#length--;
    return currentItem.value;
  }

  removeTail() {
    let currentItem = this.#tail;

    // empty list
    if(!currentItem) {
      return;
    }

    // single item list
    if(!this.#tail.prev) {
      this.#head = null;
      this.#tail = null;

      // full list
    } else {
      this.#tail.prev.next = null;
      this.#tail = this.#tail.prev;
      currentItem.next = currentItem.prev = null;
    }

    this.#length--;
    return currentItem.value;
  }

  first(num) {
    let iter = this.iterator();
    let result = [];

    let n = Math.min(num, this.length);

    for(let i = 0; i < n; i++) {
      let val = iter.next();
      result.push(val.value);
    }
    return result;
  }

  toArray() {
    return [...this];
  }

  /*private */ isDuplicate(val) /**/ {
    let set = new Set(this.toArray());
    return set.has(val);
  }
}
