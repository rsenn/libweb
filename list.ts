export type Node<T> = { value: T; next: Node<T> };

class List<T> {
	#size = 0;
	#cursor?: Node<T>;

	constructor(entries?: readonly T[]) {
		if (entries != null) {
			for (const value of entries) {
				this.push(value);
				this.rotate();
			}
		}
	}

	push(value: T): this {
		// Increase the size of the list
		this.#size += 1;

		// Create the current node
		const current: Partial<Node<T>> = { value };

		// If there is a cursor already, link it
		if (this.#cursor == null) {
			this.#cursor = current.next = current as Node<T>;
		} else {
			current.next = this.#cursor.next;
			this.#cursor.next = current as Node<T>;
		}

		// Chain
		return this;
	}

	pop(): T | undefined {
		// If there is no cursor, we don't have anything to pop
		if (this.#cursor == null) {
			return undefined;
		}

		// Decrease the length
		this.#size -= 1;

		// Load the values and links
		const first = this.#cursor.next;
		const { value, next } = first;

		// Pointing to itself, means it is the only one
		if (first === this.#cursor) {
			this.#cursor = undefined;
		} else {
			this.#cursor.next = next;
		}

		// Return the value
		return value;
	}

	peek(): T | undefined {
		return this.#cursor?.next.value;
	}

	clear(): void {
		this.#cursor = undefined;
		this.#size = 0;
	}

	protected rotate(): this {
		if (this.#cursor != null) {
			this.#cursor = this.#cursor.next;
		}

		return this;
	}

	get size(): number {
		return this.#size;
	}

	[Symbol.iterator](): IterableIterator<T> {
		// If there is no cursor, we don't have anythign to pop
		if (this.#cursor == null) {
			return {
				[Symbol.iterator]() {
					return this;
				},
				next: (): IteratorResult<T> => ({ done: true, value: undefined }),
			};
		}

		const first = this.#cursor.next;
		let current = first;
		let iterated = false;
		return {
			[Symbol.iterator]() {
				return this;
			},
			next: (): IteratorResult<T> => {
				if (iterated) {
					return { value: undefined, done: true };
				}

				const { value, next } = current;
				current = next;

				if (current === first) {
					iterated = true;
				}

				// Stop when we reach the first element again
				return { value, done: false };
			},
		};
	}

	keys(): IterableIterator<T> {
		return this[Symbol.iterator]();
	}

	values(): IterableIterator<T> {
		return this[Symbol.iterator]();
	}

	entities(): IterableIterator<[T, T]> {
		const iterator = this[Symbol.iterator]();
		return {
			[Symbol.iterator]() {
				return this;
			},
			next: (): IteratorResult<[T, T]> => {
				const { value, done } = iterator.next();
				return { value: [value, value], done };
			},
		};
	}

	forEach(
		callbackFn: (value: T, key: T, map: this) => void,
		thisArg?: unknown
	): void {
		for (const value of this) {
			callbackFn.call(thisArg, value, value, this);
		}
	}
}

export default List;
