class WebSocketStreamImpl {
  #ws;
  #readableController;
  #writableController;
  #closedPromise = Promise.withResolvers();
  #openedPromise = Promise.withResolvers();
  opened;
  closed;
  url;
  signal;
  protocols = [];
  constructor(url, options = {}) {
    try {
      this.url = url;
      if (options?.protocols) {
        this.protocols = options.protocols;
      }
      if (options?.signal) {
        this.signal = signal;
        this.signal.addEventListener("abort", async (e) => {
          try {
            this.#closedPromise.reject(
              new DOMException("WebSocket handshake was aborted", "ABORT_ERR"),
            );
            this.#openedPromise.reject(
              new DOMException("WebSocket handshake was aborted", "ABORT_ERR"),
            );
          } catch {
          }
        });
      }
      this.#openedPromise.promise.catch(() => {});
      this.closed = this.#closedPromise.promise;
      this.opened = new Promise(async (resolve, reject) => {
        try {
          await new Promise((r) => {
            setTimeout(r, 1);
          });
          const aborted = this.signal?.aborted;
          if (aborted) {
            throw null;
          }
        } catch {
          this.#openedPromise.promise.catch((e) => reject(e));
          return;
        }
        this.#ws = new WebSocket(url, {
          protocols: this.protocols
        });
        this.#ws.binaryType = "arraybuffer";
        this.#ws.addEventListener("open", (e) => {
          this.readable = new ReadableStream({
            start: (c) => {
              this.#readableController = c;
            },
            cancel: async (reason) => {
              await this.writer.close();
            },
          }, { once: true });
          this.writable = new WritableStream({
            start: (c) => {
              this.#writableController = c;
            },
            write: (value) => {
              this.#ws.send(value);
            },
            close({ code = 1000, reason = "" } = {}) {
              new Promise((r) => {
                setTimeout(r, 50);
              }).then(() => this.#ws.close(code, reason));
            },
            close: () => {
              if (this.readable.locked) {
                this.#readableController.close();
                this.#ws.close();
              }
            },
            abort: (reason) => {
            },
          });
          this.#ws.addEventListener("close", ({ code, reason }) => {
            try {
              try {
                if (this.readable.locked) {
                  this.#readableController.close();
                }
                if (this.writable.locked) {
                  this.writable.close();
                }
              } catch {}
              this.#openedPromise.resolve({
                readable: this.readable,
                writable: this.writable,
              });
              this.#closedPromise.resolve({ closeCode: code, reason });
            } catch (e) {
            }
          }, { once: true });
          this.#ws.addEventListener("error", (e) => {
            this.#closedPromise.reject(e);
          }, { once: true });
          this.#ws.addEventListener("message", (e) => {
            this.#readableController.enqueue(e.data);
          });
          resolve({
            readable: this.readable,
            writable: this.writable,
          });
        });
      }).catch((e) => {
        throw e;
      });
    } catch {}
  }
  close({ code = 1000, reason = "" } = {}) {
    new Promise((r) => {
      setTimeout(r, 50);
    }).then(() => this.#ws.close(code, reason));
  }
}

export { WebSocketStreamImpl }
