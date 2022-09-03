class ReceivesFunctions {
  constructor({ ...func }) {
    if (!func || Object.keys(func).length === 0)
      throw new Error(
        "You must provide a functions object to the ReceivesFunctions constructor."
      );

    for (const key in func) {
      if (typeof func[key] !== "function")
        throw new Error(`The function ${key} is not a function.`);
      this[key] = func[key];
    }
  }
}

module.exports.ReceivesFunctions = ReceivesFunctions;
