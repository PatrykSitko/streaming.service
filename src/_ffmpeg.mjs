import fs from "./customFS.mjs";
import { installFFMPEG as InstallFFMPEG } from "../res/ffmpeg/install.mjs";

const formatCollection = {
  "720p": Object.freeze({
    "-c:a": "aac",
    "-ac": "2",
    "-ab": "256k",
    "-ar": "48000",
    "-c:v": "libx264",
    "-x264opts": `"keyint=24:min-keyint=24:no-scenecut"`,
    "-b:v": "1500k",
    "-maxrate": "1500k",
    "-bufsize": "1000k",
    "-vf": `"scale=-1:720"`
  }),
  "540p": Object.freeze({
    "-c:a": "aac",
    "-ac": "2",
    "-ab": "128k",
    "-ar": "44100",
    "-c:v": "libx264",
    "-x264opts": `"keyint=24:min-keyint=24:no-scenecut"`,
    "-b:v": "800k",
    "-maxrate": "800k",
    "-bufsize": "500k",
    "-vf": `"scale=-1:540"`
  }),
  "360p": Object.freeze({
    "-c:a": "aac",
    "-ac": "2",
    "-ab": "64k",
    "-ar": "22050",
    "-c:v": "libx264",
    "-x264opts": `"keyint=24:min-keyint=24:no-scenecut"`,
    "-b:v": "400k",
    "-maxrate": "400k",
    "-bufsize": "400k",
    "-vf": `"scale=-1:360"`
  })
};

async function getVideoMetadata(inputFilePath) {
  const token = /^[0-9,A-Z]{32}$/;
  const { stderr } = await fs.exec(
    `ffprobe -i "C:\\Users\\Patryk Sitko\\projecty\\streaming.service\\res\\movies\\anime\\720p\\naruto.mp4"`
  );
  return stderr;
}
export default class Ffmpeg {
  constructor(inputFilePath, verbose = false) {
    this.inputfile = inputFilePath;
    this.commands = {};
    this.verbose = verbose;
  }

  static async installFFMPEG() {
    return await InstallFFMPEG();
  }

  get metadata() {
    return getVideoMetadata(this.inputfile);
  }

  set setInputFilePath(inputFilePath) {
    this.inputfile = inputFilePath;
  }

  static get formats() {
    return Object.freeze(formatCollection);
  }
  addCommand(command = "", argument = "") {
    this.commands[command] = argument;
  }

  addExistingFormat(classFfmpeg_formats) {
    class FfmpegFormatError extends Error {
      constructor() {
        super(
          "Unknow format detected. Please add a new format or use one of the existing formats. Skipping unknown format."
        );
      }
    }
    const format = classFfmpeg_formats;
    let passedCheck = false;
    for (let ffmpegFormat of Object.values(Ffmpeg.formats)) {
      if (ffmpegFormat.toString() === format.toString()) {
        passedCheck = true;
        break;
      }
    }
    try {
      if (!passedCheck) {
        throw new FfmpegFormatError();
      } else {
        Object.entries(format).forEach(([command, argument]) => {
          this.addCommand(command, argument);
        });
      }
    } catch (ffmpegFormatError) {
      console.error(ffmpegFormatError);
    }
  }

  addNewFormat(
    format = -1,
    commandsPairedArguments = { "--command": "argument" }
  ) {
    try {
      if (typeof format !== "string" || format === "") {
        throw new MissingFfmpegFormatError();
      }
      if (
        typeof commandsPairedArguments !== "object" ||
        commandsPairedArguments.constructor.name !== "Object"
      ) {
        throw new TypeError(commandsPairedArguments);
      }
      formatCollection[format] = commandsPairedArguments;
    } catch (err) {
      console.error(`${err}. Skipping adding new ffmpeg format.`);
    }
  }

  async save(outputFilePath) {
    let ffmpegCommand = `ffmpeg -y -i "${this.inputfile}"`;
    Object.entries(this.commands).forEach(([command, argument]) => {
      ffmpegCommand = ` ${ffmpegCommand} ${command} ${argument}`;
    });
    ffmpegCommand = ` ${ffmpegCommand} "${outputFilePath}"`;
    try {
      if (this.verbose) {
        console.log(ffmpegCommand);
      }
      const { stdout } = await fs.exec(ffmpegCommand);
      if (this.verbose) {
        console.log(stdout);
      }
      return stdout;
    } catch ({ stderr }) {
      if (this.verbose) {
        console.error(stderr);
      }
      return stderr;
    }
  }
}

class MissingFfmpegFormatError extends Error {
  constructor(message) {
    super(message ? message : "Please include a format.");
  }
}

const ffmpegVideo = new Ffmpeg(
  `${fs.projectPath}res\\movies\\anime\\720p\\naruto.mp4`,
  true
);
(async () => {
  console.log(await ffmpegVideo.metadata);
  ffmpegVideo.addExistingFormat(Ffmpeg.formats["360p"]);
  console.log(await ffmpegVideo.save(`${fs.projectPath}temp\\naruto.mp4`));
})();
