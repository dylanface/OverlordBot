require("dotenv").config();

const enviromentUtil = {
    /**
     * Get the value of an environment variable
     * @param {String} variableName 
     * @returns {String} - The value of the variable that was queried
     */
    getEnviromentVariable: (variableName) => {
        if (process.env.hasOwnProperty(variableName)) {
        return process.env[variableName];
        } else {
            throw new Error(`The enviroment variable ${variableName} is not defined`);
        }
    },
    /**
     * Get a list of all enviroment variables
     * @returns {Object} - An object containing all enviroment variables
    */
    listEnviromentVariables: () => {
        return process.env;
    }
}

module.exports = { envUtil:enviromentUtil };
