const jwt = require("jsonwebtoken");

const User = require("../models/user");

const { HttpError } = require("../helpers");

const { JWT_SECRET } = process.env;

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (typeof authHeader === "undefined") {
    next(HttpError(401, "Not authorized"));
  }

  const [bearer, token] = authHeader.split(" ", 2);

  console.log({ bearer, token });

  if (bearer !== "Bearer") {
    next(HttpError(401, "Not authorized"));
  }

  jwt.verify(token, JWT_SECRET, async (err, decode) => {
    if (err) {
      next(HttpError(401, "Not authorized"));
    }

    try {
      req.user = decode;

      const user = await User.findById(decode.id).exec();

      if (user === null) {
        next(HttpError(401, "Not authorized"));
      }

      if (user.token !== token) {
        next(HttpError(401, "Not authorized"));
      }
      if (user.verify !== true) {
        return res
          .status(401)
          .send({ message: "Your account is not verified" });
      }

      req.user = { id: user._id };

      next();
    } catch {
      next(HttpError(401, "Not authorized"));
    }
  });
};

module.exports = authenticate;
