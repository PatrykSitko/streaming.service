import fs from "../../src/customFS.mjs";
import question from "../../src/questions.mjs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const homeDir = process.env.HOMEDRIVE + process.env.HOMEPATH;
const __dirname = dirname(fileURLToPath(import.meta.url));

/**@returns {Promise} true when installing ffmpeg is terminated. */
export async function installFFMPEG() {
  return new Promise(resolve=>{const startFFMPEGInstallation = await question.yesNoQuestion(
    "Do you want to start the ffmpeg installation process?"
  );
  if (startFFMPEGInstallation) {
    let addedUserPathEntry = false;
    const finnishedCopyingFFMPEG = await copyFfmpegToHomeDir();
    if (finnishedCopyingFFMPEG) {
      addedUserPathEntry = await fs.addUserPathEntry(
        `${homeDir}\\ffmpeg\\bin;`,
        "ffmpeg"
      );
    }
    if (addedUserPathEntry) {
      resolve(true);
    }
  } else {
    console.log("Missing ffmpeg. Exiting process with code 1.");
    await question.continueOnInput(1);
    resolve(true);
  }});
}

/**@returns {Promise} true when copying ffmpeg to home dir is finnished. */
function copyFfmpegToHomeDir() {
  return new Promise(resolve => {
    console.log("Starting ffmpeg installation process...");
    console.log(
      `Copying files and directories from: "${__dirname}\\**" to: "${homeDir}\\ffmpeg"`
    );
    fs.copyFolderRecursiveSync(__dirname, homeDir);
    console.log(
      `Finnished copying files and directories from: "${__dirname}\\**" to: "${homeDir}\\ffmpeg"`
    );
    resolve(true);
  });
}
