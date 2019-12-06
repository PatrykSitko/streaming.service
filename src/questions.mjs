import fs from "./customFS.mjs";

function getStdin() {
  const stdin = process.stdin;
  stdin.setRawMode(true);
  stdin.setEncoding("UTF-8");
  if (stdin.isPaused()) {
    stdin.resume();
  }
  return stdin;
}

export function yesNoQuestion(question = "") {
  return new Promise(resolve => {
    console.log(question);
    console.log("yes/no");
    const stdin = getStdin();
    let choosenOption = false;
    stdin.on("data", async key => {
      if (!choosenOption) {
        console.log(key);
      }
      if (key.toLowerCase() === "y" && !choosenOption) {
        choosenOption = true;
        resolve(true);
        stdin.pause();
      }
      if (key.toLowerCase() === "n" && !choosenOption) {
        choosenOption = true;
        resolve(false);
        stdin.pause();
      }
    });
  });
}
export function askToReboot(isRequired = true) {
  return new Promise(resolve => {
    console.log(`Do you want to reboot?${isRequired ? " (required)" : ""}`);
    console.log("yes/no");
    const stdin = getStdin();
    let choosenOption = false;
    stdin.on("data", key => {
      if (!choosenOption) {
        console.log(key);
      }
      if (key.toLowerCase() === "y" && !choosenOption) {
        choosenOption = true;
        (async () => {
          console.log("Will be rebooting your computer shortly...");
          const { stdout } = await fs.exec("shutdown /r");
          console.log(stdout);
        })();
        resolve(true);
        stdin.pause();
      }
      if (key.toLowerCase() === "n" && !choosenOption) {
        choosenOption = true;
        console.log("Please reboot your computer.");
        resolve(false);
        stdin.pause();
      }
    });
  });
}

export function continueOnInput(exitcode = undefined) {
  console.log("Press any key to continue...");
  const stdin = getStdin();
  return new Promise(resolve => {
    stdin.on("data", () => {
      resolve();
      if (typeof exitcode === "number" && exitcode === 1) {
        process.exit(1);
      } else {
        stdin.pause();
      }
    });
  });
}

export default { yesNoQuestion, askToReboot, continueOnInput };
