const crypto = require("crypto");
const bcrypt = require("bcrypt");
const fs = require("fs/promises");
const path = require("path");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar"); // створення аватарок
const Jimp = require("jimp");

const { JWT_SECRET } = process.env;

const User = require("../models/user");

const { HttpError, ctrlWrapper } = require("../helpers");
const sendEmail = require("../helpers/sendEmail");

const register = async (req, res) => {
  // перед реєстрацією користувача перевіряємо email на унікальність
  const { email, password } = req.body;
  console.log(req.body);
  const user = await User.findOne({ email });
  console.log(user);
  if (user) {
    throw HttpError(409, "Email already in use");
  }

  // хешуємо пароль
  const hashPassword = await bcrypt.hash(password, 10);
  // видаємо аватарку при реєстрації
  const avatarURL = gravatar.url(email);
  // записуємо код верефікації
  const verificationToken = crypto.randomUUID();

  // створюємо листа
  const verificationEmail = {
    to: email,
    subject: "Verification email",
    html: `<b>To confirm your registration please click on the <a href="http://localhost:3000/users/verify/${verificationToken} ">link</a>`,
    text: `<b>To confirm your registration please open the link http://localhost:3000/users/verify/${verificationToken} `,
  };

  await sendEmail(verificationEmail);

  // зберігаємо в захешованому вигляді
  const newUser = await User.create({
    ...req.body,
    verificationToken,
    avatarURL,
    password: hashPassword,
  });

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const verify = async (req, res, next) => {
  const { verificationToken } = req.params;
  try {
    const user = await User.findOne({ verificationToken }).exec();

    if (!user) {
      throw HttpError(404);
    }
    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: null,
    });

    res.json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
};
const resVerifyEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw HttpError(400, "Missing required field email");
  }

  const { verificationToken } = await User.findOne({ email });

  if (!verificationToken) {
    throw HttpError(400, "Verification has already been passed");
  }
  const verificationEmail = {
    to: email,
    subject: "Verification email",
    html: `<b>To confirm your registration please click on the <a href="http://localhost:3000/users/verify/${verificationToken} ">link</a>`,
    text: `<b>To confirm your registration please open the link http://localhost:3000/users/verify/${verificationToken} `,
  };

  await sendEmail(verificationEmail);
  res.json({ message: "Verification email sent" });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }
  const passwordCompare = await bcrypt.compare(password, user.password);

  if (!passwordCompare) {
    throw HttpError(401, "Email or password invalid");
  }
  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });

  await User.findByIdAndUpdate(user._id, { token }).exec();

  if (user.verify !== true) {
    throw HttpError(401, "Your account is not verified");
  }

  res.json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.status(204).json({
    message: "Not authorized",
  });
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};

const updateSubscription = async (req, res) => {
  const { _id, email } = req.user;
  const { subscription } = req.body;
  await User.findByIdAndUpdate(_id, { subscription: subscription });

  res.json({
    email,
    subscription,
  });
};
//
const uploadAvatar = async (req, res, next) => {
  try {
    // Використовуємо jimp для обробки аватарки
    // Встановлюємо розміри 250x250
    // Записуємо змінене зображення
    const image = await Jimp.read(req.file.path);
    image.resize(250, 250).write(req.file.path);

    await fs.rename(
      req.file.path,
      path.join(__dirname, "..", "public/avatars", req.file.filename)
    );

    // Оновлюємо користувача в базі даних і повертаємо оновленого користувача
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatarURL: req.file.filename },
      { new: true }
    ).exec();

    if (user === null) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send(user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register: ctrlWrapper(register),
  verify: ctrlWrapper(verify),
  resVerifyEmail: ctrlWrapper(resVerifyEmail),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  getCurrent: ctrlWrapper(getCurrent),
  updateSubscription: ctrlWrapper(updateSubscription),
  uploadAvatar: ctrlWrapper(uploadAvatar),
};
