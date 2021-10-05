const BullWorker = require('bull');
const config = require('@src/config/config');

class Worker {
  constructor({ title, job, options = {} }) {
    this.title = title;
    this.job = job;
    this.options = options;
  }

  call() {
    try {
      const newWorker = createWorker(this.title);
      const workerOptions = getWorkerOptions(this.options);

      newWorker.add(null, workerOptions);
      newWorker.process(() => this.job());

      return newWorker;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }
}

// private

function createWorker(title) {
  return new BullWorker(title, {
    redis: {
      host: config.redis.host,
      port: config.redis.port,
    },
  });
}

function getWorkerOptions(options) {
  return {
    attempts: 2,
    ...options,
  };
}

module.exports = Worker;
