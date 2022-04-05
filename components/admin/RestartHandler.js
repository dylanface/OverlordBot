
class ResetHandler {
    trackedCollectors = new Map();

    constructor(client) {
        this.client = client;
    }

    addCollector(collector) {
        this.trackedCollectors.set(collector.id, collector);
    }

}

module.exports = ResetHandler;