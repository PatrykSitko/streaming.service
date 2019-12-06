import fs from "../../src/customFS.mjs";
import question from "../../src/questions.mjs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const homeDir = process.env.HOMEDRIVE + process.env.HOMEPATH;
const __dirname = dirname(fileURLToPath(import.meta.url));
installPackager();
export async function installPackager() {
  const startPackagerInstallation = await question.yesNoQuestion(
    "Do you want to start the packager installation process?"
  );
  if (startPackagerInstallation) {
    copyPackagerToHomeDir();
    fs.addUserPathEntry(`${homeDir}\\packager\\bin;`, "packager-win");
  } else {
    console.log("Missing packager. Exiting process with code 1.");
    await question.continueOnInput(1);
  }
}

function copyPackagerToHomeDir() {
  console.log("Starting packager installation process...");
  console.log(
    `Copying files and directories from: "${__dirname}\\**" to: "${homeDir}\\packager"`
  );
  fs.copyFolderRecursiveSync(__dirname, homeDir);
  console.log(
    `Finnished copying files and directories from: "${__dirname}\\**" to: "${homeDir}\\packager"`
  );
}
