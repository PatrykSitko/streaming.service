import fs from "./customFS.mjs";
import { installFFMPEG as InstallFFMPEG } from "../res/ffmpeg/install.mjs";
import { flat } from "./polyfils.mjs";

Array.prototype.flat = function() {
  return flat(this[0]);
};

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
  await ffmpegVideo.metadata;
  ffmpegVideo.addExistingFormat(Ffmpeg.formats["360p"]);
  //   console.log(await ffmpegVideo.save(`${fs.projectPath}temp\\naruto.mp4`));
})();
const metadataKeys = [
  "configuration:",
  "libavutil",
  "libavcodec",
  "libavformat",
  "libavdevice",
  "libavfilter",
  "libswscale",
  "libswresample",
  "libpostproc"
];

async function metadataBuilder(ffmpegMetadata) {
  console.log(ffmpegMetadata);
  let rawMetadata = ffmpegMetadata.replace(
    "ffprobe version 4.2.1 Copyright (c) 2007-2019 the FFmpeg developers\r\n  built with gcc 9.1.1 (GCC) 20190807\r\n",
    ""
  );
  const buildedMetadata = {};
  for (let parameter of metadataKeys) {
    const key = parameter.replace(":", "");
    const [extractedMetadata, newRawMetadata] = extractMetadata(
      rawMetadata,
      parameter
    );
    buildedMetadata[key] = extractedMetadata;
    rawMetadata = newRawMetadata;
  }
  for (let inputCode = 0; ; inputCode++) {
    const parameter = `Input #${inputCode}`;
    const inputCodeKey = parameter.replace(" #", "");
    if (!rawMetadata.includes(parameter)) {
      break;
    }
    let [metadata, newRawMetadata] = extractMetadata(rawMetadata, parameter);
    if (
      metadata &&
      metadata.constructor &&
      metadata.constructor.name === "Array"
    ) {
      let filePath = undefined;
      let fileName = undefined;
      let formats = undefined;
      for (let index = 0; index < metadata.length; index++) {
        if (metadata[index].includes("from")) {
          filePath = metadata[index]
            .slice(5, metadata[index].length - 1)
            .trim();
          fileName = await fs.getFileName(filePath);
          formats = metadata.filter(entry => entry !== metadata[index]);
        } else if (!filePath) {
          formats = metadata;
        }
      }
      buildedMetadata[inputCodeKey] = {
        filePath,
        fileName,
        formats,
        format: fileName.slice(fileName.indexOf(".") + 1, fileName.length)
      };
    }
    rawMetadata = newRawMetadata;
    [metadata, newRawMetadata] = extractMetadata(
      rawMetadata,
      "Metadata:",
      "Stream #",
      "\r\n"
    );
    let inputMetadata = [];
    for (let data of metadata) {
      if (!data.includes("Duration:")) {
        inputMetadata = [...inputMetadata, data.replace("\r\n").split(":")];
      } else {
        const duration = data.replace("Duration:", "").split(",");
        inputMetadata = [...inputMetadata, ["Duration", duration[0]]];
        metadata.push(duration[1]);
        metadata.push(duration[2]);
      }
      buildedMetadata[inputCodeKey].metadata = {};
      for (let [key, value] of inputMetadata) {
        buildedMetadata[inputCodeKey]["metadata"][key.trim()] =
          typeof value.trim === "function"
            ? value.trim()
            : value.map
            ? value.map(entry => (entry.trim ? entry.trim() : entry))
            : value;
      }
      rawMetadata = newRawMetadata;
      //   console.log(inputMetadata);
    }
    // console.log(metadata, newRawMetadata);
  }
  console.log(buildedMetadata, [rawMetadata]);
  //   return buildedMetadata;
}
/**
 *
 * @param {String} rawMetadata the metadata from where the parameter has to be extracted.
 * @param {String} parameter the parameter that has to be extracted from the rawMetadata.
 * @returns {Array} [extractedMetadata,newRawMetadata];
 */
function extractMetadata(
  rawMetadata,
  parameter,
  cut = "\r\n",
  splittingSymbol = ","
) {
  let extractedMetadata = rawMetadata
    .slice(
      rawMetadata.indexOf(parameter) + parameter.length,
      rawMetadata.indexOf(cut)
    )
    .trim();
  const newRawMetadata = rawMetadata
    .replace(`${parameter}`, "")
    .replace(`${extractedMetadata}`, "")
    .trim();
  extractedMetadata = extractedMetadata.includes("--")
    ? extractedMetadata.split("--").join()
    : extractedMetadata;
  while (extractedMetadata.includes(" ,")) {
    extractedMetadata = extractedMetadata.replace(" ,", ",");
  }
  if (extractedMetadata.includes(splittingSymbol)) {
    extractedMetadata = extractedMetadata.split(splittingSymbol);
  }
  if (
    extractedMetadata &&
    extractedMetadata.constructor &&
    extractedMetadata.constructor.name === "Array"
  ) {
    extractedMetadata = extractedMetadata.filter(value => value !== "");
  }
  return [extractedMetadata, newRawMetadata];
}
async function getVideoMetadata(inputFilePath) {
  const { stderr: rawMetadata } = await fs.exec(
    `ffprobe -i "C:\\Users\\Patryk Sitko\\projecty\\streaming.service\\res\\movies\\anime\\720p\\naruto.mp4"`
  );
  return metadataBuilder(rawMetadata);
}
