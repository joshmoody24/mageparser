import fs from "fs";
import interpret from "./interpreter.js";

// Get CLI arguments (skip `node` and script name)
const args = process.argv.slice(2);

if (args.length < 1) {
  console.error("Usage: node interpreter.js <input-file>");
  process.exit(1);
}

const filePath = args[0];

// Read file asynchronously
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err.message);
    process.exit(1);
  }

  let result;
  try {
    result = parse(data);
  } catch (e) {
    console.error("Parsing error:", e);
    process.exit(1);
  }

  try {
    const interpretedResult = interpret(result[0]);
    console.log("Interpreted result:", interpretedResult);
  } catch (error) {
    console.error("Runtime error:", error);
    process.exit(1);
  }
});
