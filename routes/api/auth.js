const express = require("express");

const ctrl = require("../../controllers/auth");
const { validateBody, authenticate } = require("../../middlewares");
const { schemas } = require("../../schemas/user");
const upload = require("../../middlewares/upload");

const router = express.Router();

router.post("/register", validateBody(schemas.registerSchema), ctrl.register);

router.post("/login", validateBody(schemas.loginSchema), ctrl.login);

router.post("/logout", authenticate, ctrl.logout);

router.get("/current", authenticate, ctrl.getCurrent);

router.patch(
  "/users",
  authenticate,
  validateBody(schemas.updateSubscription),
  ctrl.updateSubscription
);

router.patch(
  "/avatar",
  upload.single("ssi_avatar"),
  authenticate,
  ctrl.uploadAvatar
);

module.exports = router;
