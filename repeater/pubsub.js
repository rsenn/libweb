import { Repeater } from '@repeaterjs/repeater';

class InMemoryPubSub {
  constructor() {
    this.publishers = {};
  }
  publish(topic, value) {
    const publishers = this.publishers[topic];
    if(publishers != null) {
      for(const { push, stop } of publishers) {
        try {
          push(value).catch(stop);
        } catch(err) {
          // push queue is full
          stop(err);
        }
      }
    }
  }
  unpublish(topic, reason) {
    const publishers = this.publishers[topic];
    if(publishers == null) {
      return;
    }
    for(const { stop } of publishers) {
      stop(reason);
    }
    publishers.clear();
  }
  subscribe(topic, buffer) {
    if(this.publishers[topic] == null) {
      this.publishers[topic] = new Set();
    }
    return new Repeater(async (push, stop) => {
      const publisher = { push, stop };
      this.publishers[topic].add(publisher);
      await stop;
      this.publishers[topic].delete(publisher);
    }, buffer);
  }
  close(reason) {
    for(const topic of Object.keys(this.publishers)) {
      this.unpublish(topic, reason);
    }
  }
}

export { InMemoryPubSub };
//# sourceMappingURL=pubsub.esm.js.map
