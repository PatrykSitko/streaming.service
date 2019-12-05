import fs from "fs";
import util from "util";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import child_process from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const exec = util.promisify(child_process.exec);

function copyFileSync(source, target) {
  let targetFile = target;

  //if target is a directory a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source, target) {
  let files = [];

  //check if folder needs to be created or integrated
  const targetFolder = path.join(target, path.basename(source));
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder);
  }

  //copy
  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    files.forEach(function(file) {
      const curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        copyFileSync(curSource, targetFolder);
      }
    });
  }
}

export function installFFMPEG(messageAfterInstallationCompleted = undefined) {
  const homeDir = process.env.HOMEDRIVE + process.env.HOMEPATH;
  console.log(
    `Copying files and directories from: "${__dirname}\\**" to: "${homeDir}\\ffmpeg"`
  );
  copyFolderRecursiveSync(__dirname, homeDir);
  console.log(
    `Finnished copying files and directories from: "${__dirname}\\**" to: "${homeDir}\\ffmpeg"`
  );

  (async () => {
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
        const { stdout } = await exec(
          `setx path "${localPath}${newPathEntry}"`
        );
        console.log(stdout);
        console.log("Finnished adding new user path entry: " + newPathEntry);
      } else {
        console.log("UserPath already contains path: " + newPathEntry);
        console.log("Abording adding new user path entry.");
      }
    } catch (err) {
      console.error(err);
    }
    if (typeof messageAfterInstallationCompleted === "string") {
      console.log(messageAfterInstallationCompleted);
    }
  })();
}
