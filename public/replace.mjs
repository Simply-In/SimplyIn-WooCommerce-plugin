import { replaceInFile } from "replace-in-file";

const options = {
  files: "dist/bundle.js", // Adjust the path as needed
  from: /words/g, // The string to replace
  to: "wordsSimplyin", // The replacement
};

try {
  const results = await replaceInFile(options);
  console.log("Replacement results:", results);
} catch (error) {
  console.error("Error occurred:", error);
}
