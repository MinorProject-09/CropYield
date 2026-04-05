const express = require("express");
const multer = require("multer");
const { chat } = require("../controllers/chatController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 5 },
});

function chatBodyParser(req, res, next) {
  const ct = req.headers["content-type"] || "";
  if (ct.includes("multipart/form-data")) {
    return upload.array("files", 5)(req, res, next);
  }
  return express.json()(req, res, next);
}

router.post("/", chatBodyParser, chat);

module.exports = router;
