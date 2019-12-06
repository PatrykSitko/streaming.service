import fs from "../../src/customFS.mjs";
import util from "util";
import question from "../../src/questions.mjs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import child_process from "child_process";

const homeDir = process.env.HOMEDRIVE + process.env.HOMEPATH;
const __dirname = dirname(fileURLToPath(import.meta.url));
const exec = util.promisify(child_process.exec);

export async function installFFMPEG() {
  const startFFMPEGInstallation = await question.yesNoQuestion(
    "Do you want to start the ffmpeg installation process?"
  );
  if (startFFMPEGInstallation) {
    copyFfmpegToHomeDir();
    addFfmpegPathEntry();
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

async function addFfmpegPathEntry() {
  try {
    const { stdout: userPath } = await exec(
      '%SystemRoot%\\System32\\reg.exe query "HKCU\\Environment" /v Path'
    );
    const newPathEntry = `${homeDir}\\ffmpeg\\bin;`;
    const localPath = userPath
      .replace("HKEY_CURRENT_USER\\Environment", "")
      .replace("Path    REG_EXPAND_SZ", "")
      .trim();

    console.log("Adding new user path entry: " + newPathEntry);
    if (!localPath.includes(newPathEntry)) {
      const { stdout } = await exec(`setx path "${localPath}${newPathEntry}"`);
      console.log(stdout);
      console.log("Finnished adding new user path entry: " + newPathEntry);
      await question.askToReboot();
    } else {
      console.log("UserPath already contains path: " + newPathEntry);
      console.log("Abording adding new user path entry.");
      try {
        await exec("ffmpeg");
      } catch ({ stderr }) {
        if (
          stderr ===
          "'ffmpeg' is not recognized as an internal or external command,\r\n" +
            "operable program or batch file.\r\n"
        ) {
          console.log("Command:", stderr.trim());
          console.log("path variable need to be updated.");
          await question.askToReboot();
        }
      }
      await question.continueOnInput();
    }
  } catch (err) {
    console.error(err);
  }
}
