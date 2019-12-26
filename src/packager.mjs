import fs from "./customFS.mjs";
import { installPackager as InstallPackager } from "../res/packager/install.mjs";
import Ffmpeg from "./ffmpeg.mjs";
import { flat } from "./polyfils.mjs";

Array.prototype.flat = function() {
  return flat(this[0]);
};

export const installPackager = InstallPackager;

export default class Packager {
  constructor(verbose = false) {
    this.verbose = verbose;
    this.inputs = [];
    this.choosenProfile = Packager.profiles["on-demand"];
    this.choosenMinimumBufferTime = 3;
    this.choosenSegmentDuration = 3;
    if (verbose) {
      console.log("Initializing new Packager.");
    }
  }
  static get profiles() {
    return Object.freeze({ "on-demand": "on-demand" });
  }
  async input(file, outputPath = undefined, concatResolution = true) {
    const resolution = await getResolution(file);
    let passedCheck = true;
    try {
      if (!Object.keys(Ffmpeg.formats).includes(`${resolution.height}p`)) {
        passedCheck = false;
        throw new UnknownPackageQualityError(packagerQualities);
      }
    } catch (err) {
      console.error(err);
    }
    if (passedCheck) {
      const fileName = await fs.getFileName(file);
      this.inputs.push({
        resolution,
        fileName,
        filePath: file,
        outputPath,
        concatResolution
      });
      if (this.verbose) {
        console.log(`Added input file: ${file}.`);
      }
    }
  }
  set profile(packagerProfiles) {
    if (!Object.values(Packager.profiles).includes(packagerProfiles)) {
      throw new UnknownPackageProfileError(packagerProfiles);
    } else {
      this.choosenProfile = packagerProfiles;
      if (this.verbose) {
        console.log(`Changed profile to: ${packagerProfiles}.`);
      }
    }
  }
  set minimumBufferTime(integer) {
    if (typeof integer != "number" && integer % 1 != 0) {
      throw new TypeError(
        "new Packager.minimumBufferTime has to be of type integer."
      );
    } else {
      this.choosenMinimumBufferTime = integer;
      if (this.verbose) {
        console.log(`Changed minimum buffer time to: ${integer}.`);
      }
    }
  }
  set segmentDuration(integer) {
    if (typeof integer != "number" && integer % 1 != 0) {
      throw new TypeError(
        "new Packager.segmentDuration has to be of type integer."
      );
    } else {
      this.choosenSegmentDuration = integer;
      if (verbose) {
        console.log(`Changed segment duration to: ${integer}.`);
      }
    }
  }

  async save(destination) {
    if (!(await fs.isCommandAvailable("ffmpeg"))) {
      await installFFMPEG();
    }
    if (!(await fs.isCommandAvailable("packager-win"))) {
      await installPackager();
    }
    if (this.inputs.length === 0) {
      return;
    }
    let resolution = undefined;
    let command = "packager-win ";
    let manifestName = "";
    for (let {
      resolution: { height },
      fileName,
      filePath,
      outputPath,
      concatResolution
    } of this.inputs) {
      const outputDestination = outputPath ? outputPath : destination;
      filePath =
        filePath.includes(" ") && !filePath.indexOf('"') !== 0
          ? `"${filePath}"`
          : filePath;
      resolution = height;
      const audioOutputFileName = fileName
        .slice(0, fileName.indexOf("."))
        .concat(concatResolution ? `${height}_audio` : "_audio")
        .concat(fileName.slice(fileName.indexOf("."), fileName.length));
      const videoOutputFileName = fileName
        .slice(0, fileName.indexOf("."))
        .concat(concatResolution ? `${height}_video` : "_video")
        .concat(fileName.slice(fileName.indexOf("."), fileName.length));
      const audioOutput =
        outputDestination.lastIndexOf("\\") === outputDestination.length - 1
          ? outputDestination.concat(audioOutputFileName)
          : outputDestination.concat(`\\${audioOutputFileName}`);
      const videoOutput =
        outputDestination.lastIndexOf("\\") === outputDestination.length - 1
          ? outputDestination.concat(videoOutputFileName)
          : outputDestination.concat(`\\${videoOutputFileName}`);
      command = command.concat(
        `input=${filePath},stream=audio,output=${
          audioOutput.includes(" ") ? `"${audioOutput}"` : audioOutput
        } input=${filePath},stream=video,output=${
          videoOutput.includes(" ") ? `"${videoOutput}"` : videoOutput
        } `
      );
      manifestName = fileName.slice(0, fileName.indexOf("."));
    }
    command = command.concat(` --profile ${this.choosenProfile}`);
    command = command.concat(
      ` --min_buffer_time ${this.choosenMinimumBufferTime}`
    );
    command = command.concat(
      ` --segment_duration ${this.choosenSegmentDuration}`
    );
    if (this.inputs.length > 1) {
      command = command.concat(
        ` --mpd_output ${
          destination.lastIndexOf("\\") === destination.length - 1
            ? `"${destination.concat(`${manifestName}-full.mpd`)}"`
            : `"${destination.concat(`\\${manifestName}-full.mpd`)}"`
        }`
      );
    } else {
      command = command.concat(
        ` --mpd_output ${
          destination.lastIndexOf("\\") === destination.length - 1
            ? `"${destination.concat(`${manifestName}-${resolution}.mpd`)}"`
            : `"${destination.concat(`\\${manifestName}-${resolution}.mpd`)}"`
        }`
      );
    }
    try {
      if (this.verbose) {
        console.log(command);
      }
      const { stdout } = await fs.exec(command);
      if (this.verbose) {
        console.log(stdout);
      }
    } catch ({ stderr }) {
      console.error(stderr);
    }
    this.inputs = [];
  }
}
async function getResolution(file) {
  try {
    const {
      resolution: { w, h }
    } = (await new Ffmpeg(file).metadata)["Input0"].metadata;
    return { width: w, height: h };
  } catch (ffmpegError) {
    console.error(ffmpegError);
    return undefined;
  }
}

class UnknownPackageError extends Error {
  constructor(
    objectValue = "y",
    objectName = "X",
    invocationDescription = "X.key"
  ) {
    super(
      `${objectName} of type: ${objectValue} is unknown. Please use a ${objectName} that's accessible trough ${invocationDescription}.`
    );
  }
}

class UnknownPackageProfileError extends UnknownPackageError {
  constructor(objectValue) {
    super(objectValue, "Profile", "Packager.profiles;");
  }
}

class UnknownPackageQualityError extends UnknownPackageError {
  constructor(objectValue) {
    super(objectValue, "Quality", "Packager.qualities;");
  }
}

const packager = new Packager();
packager.input(
  `${fs.projectPath}res\\movies\\anime\\720p\\naruto.mp4`,
  `${fs.projectPath}res\\movies\\anime\\720p`,
  false
);
packager.input(
  `${fs.projectPath}res\\movies\\anime\\540p\\naruto.mp4`,
  `${fs.projectPath}res\\movies\\anime\\540p`,
  false
);
packager.input(
  `${fs.projectPath}res\\movies\\anime\\360p\\naruto.mp4`,
  `${fs.projectPath}res\\movies\\anime\\360p`,
  false
);
packager.save(`${fs.projectPath}res\\movies\\anime\\manifests`);
