import fs from "../../src/customFS.mjs";
import question from "../../src/questions.mjs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { resolve } from "dns";

const homeDir = process.env.HOMEDRIVE + process.env.HOMEPATH;
const __dirname = dirname(fileURLToPath(import.meta.url));

/**@returns {Promise} true when installing packager is terminated. */
export function installPackager() {
  return new Promise(async resolve => {
    const startPackagerInstallation = await question.yesNoQuestion(
      "Do you want to start the packager installation process?"
    );
    if (startPackagerInstallation) {
      let addedUserPathEntry = false;
      const finnishedCopyingFFMPEG = await copyPackagerToHomeDir();
      if (finnishedCopyingFFMPEG) {
        addedUserPathEntry = await fs.addUserPathEntry(
          `${homeDir}\\packager\\bin;`,
          "packager-win"
        );
      }
      if (addedUserPathEntry) {
        resolve(true);
      }
    } else {
      console.log("Missing packager. Exiting process with code 1.");
      await question.continueOnInput(1);
      resolve(true);
    }
  });
}

/**@returns {Promise} true when copying packager to home dir is finnished. */
function copyPackagerToHomeDir() {
  return new Promise(resolve => {
    console.log("Starting packager installation process...");
    console.log(
      `Copying files and directories from: "${__dirname}\\**" to: "${homeDir}\\packager"`
    );
    fs.copyFolderRecursiveSync(__dirname, homeDir);
    console.log(
      `Finnished copying files and directories from: "${__dirname}\\**" to: "${homeDir}\\packager"`
    );
    resolve(true);
  });
}
