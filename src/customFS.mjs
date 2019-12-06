import fs from "fs";
import util from "util";
import path from "path";
import question from "./questions.mjs";
import child_process from "child_process";
import { resolve } from "dns";

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
/**
 *
 * @param newPathEntry The path entry you would like to add to the local user environment variables.
 * @param invocationCommand The command that will be used in the command-line to invoke the application that corresponds to the new path entry.
 */
async function addUserPathEntry(newPathEntry, invocationCommand) {
  return new Promise(resolve=>{try {
    const { stdout: userPath } = await exec(
      '%SystemRoot%\\System32\\reg.exe query "HKCU\\Environment" /v Path'
    );
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
      resolve(true);
    } else {
      console.log("UserPath already contains path: " + newPathEntry);
      console.log("Abording adding new user path entry.");
      try {
        await exec(invocationCommand);
      } catch ({ stderr }) {
        if (
          stderr ===
          `'${invocationCommand}' is not recognized as an internal or external command,\r\n" +
            "operable program or batch file.\r\n`
        ) {
          console.log("Command:", stderr.trim());
          console.log("path variable need to be updated.");
          await question.askToReboot();
        }
      }
      await question.continueOnInput();
      resolve(true);
    }
  } catch (err) {
    console.error(err);
    resolve(true);
  }
  resolve(true);
});
  
}

function getFileName(filepath) {
  if (fs.isDirectory(filepath)) {
    return undefined;
  } else {
    return filepath.slice(filepath.lastIndexOf("\\") + 1, filepath.length);
  }
}

export default {
  ...fs,
  exec,
  copyFileSync,
  copyFolderRecursiveSync,
  addUserPathEntry,
  getFileName
};
