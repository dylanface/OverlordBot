require("dotenv").config();

const enviromentUtil = {
    /**
     * Get the value of an environment variable
     * @param {String | String[]} variableName 
     * @returns {String | String[]} - The value of the variable that was queried
     */
    getEnviromentVariable: (variableName) => {
        if (typeof variableName === 'string') {
            if (process.env.hasOwnProperty(variableName)) {
                return process.env[variableName];
            } else {
                throw new Error(`The enviroment variable ${variableName} is not defined`);
            }
        }
        else if (Array.isArray(variableName)) {
            const variableValues = [];
            for (let variable of variableName) {
                if (process.env.hasOwnProperty(variable)) {
                    variableValues.push(process.env[variable]);
                } else {
                    throw new Error(`The enviroment variable ${variable} is not defined`);
                }
            }
            return variableValues;
        } else {
            throw new Error(`An invalid variable name was passed to the envUtil`);
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
