import dotenv from "dotenv";
dotenv.config();

let current_token: string;
let self_destruct: NodeJS.Timeout | undefined = undefined;
const { TEST_TOKEN, LIVE_TOKEN, DEVELOPMENT_MODE } = process.env;
if (typeof DEVELOPMENT_MODE === "undefined") {
  throw new Error("DEVELOPMENT_MODE not found in environment variables.");
} else {
  if (DEVELOPMENT_MODE === "true") {
    if (typeof TEST_TOKEN === "undefined") {
      throw new Error("TEST_TOKEN not found in environment variables.");
    } else {
      console.log("Development mode enabled.");
      current_token = TEST_TOKEN;
    }
  } else if (DEVELOPMENT_MODE === "false") {
    if (typeof LIVE_TOKEN === "undefined") {
      throw new Error("LIVE_TOKEN not found in environment variables.");
    } else {
      console.log("Launching in production mode.");
      current_token = LIVE_TOKEN;
    }
  }
}

export = () => {
  clearTimeout(self_destruct);

  self_destruct = setTimeout(() => {
    current_token = "";
    console.log("Token has self destructed.");
  }, 1000);
  return current_token;
};
