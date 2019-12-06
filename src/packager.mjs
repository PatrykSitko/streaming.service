import fs from "./customFS.mjs";
import { installPackager as InstallPackager } from "../res/packager/install.mjs";
import Ffmpeg, { installFFMPEG } from "./ffmpeg.mjs";

import { flat } from "./polyfils.mjs";
Array.prototype.flat = function() {
  return flat(this[0]);
};
export const installPackager = InstallPackager;

class Packager {
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
  static get qualities() {
    return Object.freeze({ "720p": "720p", "540p": "540p", "360p": "360p" });
  }
  input(file, packagerQualities = []) {
    packagerQualities = flat(packagerQualities);
    let passedCheck = true;
    for (let packagerQuality of packagerQualities) {
      if (!Object.values(Packager.qualities).includes(packagerQuality)) {
        passedCheck = false;
        throw new UnknownPackageQualityError(packagerQualities);
      }
    }
    if (passedCheck) {
      const resolution = getResolution(file);
      this.inputs.push({
        resolution,
        fileName: fs.getFileName(file),
        filePath: file
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
    console.log(this.inputs);
  }
}
async function getResolution(file) {
  try {
    const {
      metadata: {
        video: {
          resolution: { w: width, h: height }
        }
      }
    } = await new Ffmpeg(file);
    return { width, height };
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
const packager = new Packager("");
packager.input(
  "C:\\Users\\Patryk Sitko\\projecty\\streaming.service\\res\\video.mp4"
);
packager.save("packager1");
