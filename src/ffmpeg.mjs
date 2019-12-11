import Ffmpeg from "ffmpeg";
import fs from "./customFS.mjs";
import { installFFMPEG as InstallFFMPEG } from "../res/ffmpeg/install.mjs";

export default Ffmpeg;

export const installFFMPEG = InstallFFMPEG;

export const availableQualities = Object.freeze({
  "720p": Object.freeze({
    "-c:a": "aac",
    "-ac": "2",
    "-ab": "256k",
    "-ar": "48000",
    "-c:v": "libx264",
    "-x264opts": "keyint=24:min-keyint=24:no-scenecut",
    "-b:v": "1500k",
    "-maxrate": "1500k",
    "-bufsize": "1000k",
    "-vf": "scale=-1:720"
  }),
  "540p": Object.freeze({
    "-c:a": "aac",
    "-ac": "2",
    "-ab": "128k",
    "-ar": "44100",
    "-c:v": "libx264",
    "-x264opts": "keyint=24:min-keyint=24:no-scenecut",
    "-b:v": "800k",
    "-maxrate": "800k",
    "-bufsize": "500k",
    "-vf": "scale=-1:540"
  }),
  "360p": Object.freeze({
    "-c:a": "aac",
    "-ac": "2",
    "-ab": "64k",
    "-ar": "22050",
    "-c:v": "libx264",
    "-x264opts": "keyint=24:min-keyint=24:no-scenecut",
    "-b:v": "400k",
    "-maxrate": "400k",
    "-bufsize": "400k",
    "-vf": "scale=-1:360"
  })
});

/**
 *
 * @param {Object} availableQualities_ use exported availableQualities object from ffmpeg.mjs.
 * @param {String} inputfile file location has to be relatieve to project path.
 * @param {String} outputFile file location has to be relatieve to project path.
 * @returns Promise containing: 
 * 
 *
   if created requested quality version:
 * 
 * Object{
      success: true,
      inputfile:string,
      inputfileLocation:string,
      outputFile:string,
      outputFileLocation:string,
      choosenQuality:string
    }   
 * 
   if error occured;
 *
    Object{
      success: false,
      inputfile:string,
      inputfileLocation:string,
      outputFile:string,
      outputFileLocation:string,
      choosenQuality:string
    }
 */
export async function createQualityVersion(
  availableQualities_,
  inputfile,
  outputFile
) {
  const choosenQuality = availableQualities_;
  let choosenQualityDescriptor = "unknown";
  for (let quality in availableQualities) {
    const current = availableQualities[quality];
    if (
      Object.keys(current).toString() + Object.values(current).toString() ===
      Object.keys(choosenQuality).toString() +
        Object.values(choosenQuality).toString()
    ) {
      choosenQualityDescriptor = quality;
      break;
    }
  }
  const inputfileLocation = path.join(fs.projectPath, inputfile);
  const outputFileLocation = path.join(fs.projectPath, outputFile);
  // if (
  //   containsIllegalCrawlingErrors(
  //     { inputfile: inputfileLocation },
  //     { outputfile: outputFileLocation }
  //   )
  // ) {
  //   return {
  //     success: false,
  //     inputfile,
  //     inputfileLocation,
  //     outputFile,
  //     outputFileLocation,
  //     choosenQuality: choosenQualityDescriptor
  //   };
  // }
  try {
    const ffmpegVideo = await new Ffmpeg(inputfileLocation);
    Object.entries(choosenQuality).forEach(([command, argument]) =>
      ffmpegVideo.addCommand(command, argument)
    );
    await ffmpegVideo.save(`"${outputFileLocation}"`);
  } catch (err) {
    if (!(await fs.isCommandAvailable("ffmpeg"))) {
      console.log(
        "'ffmpeg' is not recognized as an internal or external command,\r\n" +
          "operable program or batch file.\r\n"
      );
      installFFMPEG();
    } else {
      console.error(err);
    }
    return {
      success: false,
      inputfile,
      inputfileLocation,
      outputFile,
      outputFileLocation,
      choosenQuality: choosenQualityDescriptor
    };
  }
  return {
    success: true,
    inputfile,
    inputfileLocation,
    outputFile,
    outputFileLocation,
    choosenQuality: choosenQualityDescriptor
  };
}

// function containsIllegalCrawlingErrors(
//   object = { name: fs.projectPath },
//   ...optionalParams
// ) {
//   class IllegalCrawlingError extends Error {
//     constructor(attributeName) {
//       super(
//         `ffmpeg.mjs::import::createQualityVersion::param::${attributeName} is not located inside of the project_path. Please place the ${attributeName} inside of the project path.`
//       );
//     }
//   }
//   try {
//     Object.values(arguments).forEach(arg =>
//       Object.entries(arg).forEach(([name, value]) => {
//         if (!value.startsWith(fs.projectPath)) {
//           throw new IllegalCrawlingError(name);
//         }
//       })
//     );
//   } catch (illegalCrawlingError) {
//     console.error(illegalCrawlingError);
//     return true;
//   }
//   return false;
// }
