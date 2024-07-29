const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

async function getMongoUri() {
    if (!mongoServer) {
        mongoServer = await MongoMemoryServer.create();
    }
    return mongoServer.getUri();
}

async function stopMongoServer() {
    if (mongoServer) {
        await mongoServer.stop();
    }
}

module.exports = { getMongoUri, stopMongoServer };
