const mongoose = require('mongoose');
const { envUtil } = require('../util/envUtil');

const dbInit = {
    
    async main() {
        const mongooseVariables = envUtil.getEnviromentVariable(['MONGO_USER', 'MONGO_PASS', 'MONGO_URI', 'MONGO_AUTH_SOURCE']);
        await mongoose.connect(`mongodb://${mongooseVariables[0]}:${mongooseVariables[1]}@${mongooseVariables[2]}?authSource=${mongooseVariables[3]}`);
        console.log('Connected to MongoDB');
    }

}
    
module.exports = dbInit

