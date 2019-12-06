import fs from "../../src/customFS.mjs";
import question from "../../src/questions.mjs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const homeDir = process.env.HOMEDRIVE + process.env.HOMEPATH;
const __dirname = dirname(fileURLToPath(import.meta.url));

export async function installFFMPEG() {
  const startFFMPEGInstallation = await question.yesNoQuestion(
    "Do you want to start the ffmpeg installation process?"
  );
  if (startFFMPEGInstallation) {
    copyFfmpegToHomeDir();
    fs.addUserPathEntry(`${homeDir}\\ffmpeg\\bin;`, "ffmpeg");
  } else {
    console.log("Missing ffmpeg. Exiting process with code 1.");
    await question.continueOnInput(1);
  }
}

function copyFfmpegToHomeDir() {
  console.log("Starting ffmpeg installation process...");
  console.log(
    `Copying files and directories from: "${__dirname}\\**" to: "${homeDir}\\ffmpeg"`
  );
  fs.copyFolderRecursiveSync(__dirname, homeDir);
  console.log(
    `Finnished copying files and directories from: "${__dirname}\\**" to: "${homeDir}\\ffmpeg"`
  );
}
