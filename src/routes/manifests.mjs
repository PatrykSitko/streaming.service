import express from "express";
import fs from "../customFS.mjs";
import { sendingFileResponse } from "./tools.mjs";

const router = express.Router();

router.get("/:category/:title", (req, res) => {
  const { category, title } = req.params;
  const movie =
    title.indexOf(".") > -1 ? title.slice(0, title.indexOf(".")) : title;
  if (
    !sendingFileResponse(
      `${fs.projectPath}\\res\\movies\\${category}\\manifests\\${movie}.mpd`,
      res,
      false
    )
  ) {
    sendingFileResponse(
      `${fs.projectPath}\\res\\series\\${category}\\manifests\\${movie}.mpd`,
      res
    );
  }
});

export default router;
