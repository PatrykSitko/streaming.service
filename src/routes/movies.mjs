import express from "express";
import fs from "../customFS.mjs";
import { sendingFileResponse } from "./tools.mjs";

const router = express.Router();

router.get("/:category/:title/:quality/thumbnail", (req, res) => {
  const { quality, category, title } = req.params;
  const movie =
    title.indexOf(".") > -1 ? title.slice(0, title.indexOf(".")) : title;
  sendingFileResponse(
    `${fs.projectPath}\\res\\movies\\${category}\\${quality}\\thumbnails\\${movie}.png`,
    res
  );
});

router.get("/:category/:title/:quality", (req, res) => {
  const { category, quality, title } = req.params;
  const movie =
    title.indexOf(".") > -1 ? title.slice(0, title.indexOf(".")) : title;
  sendingFileResponse(
    `${fs.projectPath}\\res\\movies\\${category}\\${quality}\\${movie}.mp4`,
    res
  );
});

router.get("/:category/:title/:quality/video", (req, res) => {
  const { category, quality, title } = req.params;
  const movie =
    title.indexOf(".") > -1 ? title.slice(0, title.indexOf(".")) : title;
  sendingFileResponse(
    `${fs.projectPath}\\res\\movies\\${category}\\${quality}\\${movie}_video.mp4`,
    res
  );
});

router.get("/:category/:title/:quality/audio", (req, res) => {
  const { category, quality, title } = req.params;
  const movie =
    title.indexOf(".") > -1 ? title.slice(0, title.indexOf(".")) : title;
  sendingFileResponse(
    `${fs.projectPath}\\res\\movies\\${category}\\${quality}\\${movie}_audio.mp4`,
    res
  );
});

export default router;
