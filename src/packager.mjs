import fs from "./customFS.mjs";
import { installPackager as InstallPackager } from "../res/packager/install.mjs";
import Ffmpeg, { isFfmpegInstalled, installFFMPEG } from "./ffmpeg.mjs";

export const installPackager = InstallPackager;

/**
 * @returns {Boolean} true if packager is installed; else false;
 */
export async function isPackagerInstalled() {
  try {
    await fs.exec("packager-win");
  } catch ({ stderr }) {
    const message =
      "'packager-win' is not recognized as an internal or external command,\r\n" +
      "operable program or batch file.\r\n";
    if (stderr === message) {
      return false;
    }
  }
  return true;
}

class Packager {
  constructor(verbose = false) {
    this.verbose = verbose;
    this.inputs = [];
    this.choosenProfile = this.profiles["on-demand"];
    this.choosenMinimumBufferTime = 3;
    this.choosenSegmentDuration = 3;
    if (verbose) {
      console.log("Initializing new Packager.");
    }
  }
  get profiles() {
    return Object.freeze({ "on-demand": "on-demand" });
  }
  input(file) {
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
  set profile(type) {
    if (!Object.values(this.profiles).includes(type)) {
      throw new UnknownPackageProfileError(type);
    } else {
      this.choosenProfile = type;
      if (this.verbose) {
        console.log(`Changed profile to: ${type}.`);
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
    if (!(await isFfmpegInstalled())) {
      await installFFMPEG();
    }
    if (!(await isPackagerInstalled())) {
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

class UnknownPackageProfileError extends Error {
  constructor(type) {
    super(
      `Profile of type: ${type} is unknown. Please use a profile that's accessible trough new Packager().profiles.`
    );
  }
}
const packager = new Packager("");
packager.input(
  "C:\\Users\\maras\\Desktop\\streaming.service\\res\\videos\\series\\pl\\naruto\\season_3\\naruto_boruto_134.mp4"
);
packager.save("packager1");
