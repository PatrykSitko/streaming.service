import express from "express";

const router = express.Router();

/* GET series listing. */
router.get("/", (req, res, next) => res.send("respond with a resource"));

/* GET serie. */
router.get("/:lang/:name/:season/:episode", (req, res, next) =>
  res.send("respond with a resource")
);

export default router;
