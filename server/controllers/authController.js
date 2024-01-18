const crypto = require("crypto");
const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const AppError = require("./../utils/appError");
const sendEmail = require("./../utils/email");
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };



  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Vérifier si l'email et mot de passe existe
  if (!email || !password) {
    next(new AppError("Mettez un mot de passe et un email"));
  }

  // 2) Vérifie si l'utilisateur existe ou le mot de passe est correcte
  const user = await User.findOne({ email: email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  // 3) Si tout est correcte, envoie le token
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Obtenir le token et voir si il existe
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Vous n'etes pas connecté, connectez vous"));
  }
  // 2) Verification du token

  let decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3) Vérifier si l'utilisateur existe
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError("Le token de cet utilisateur n'existe plus"));
  }

  // 4) Vérifier si le mot de passe a changé après la création du token

  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("L'utilisateur a recemment changé son mot de passe"),
      401
    );
  }
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You are not allow to execute this", 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get USER BASED ON POSTED EMAIL
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError("Il n'y a pas d'utilisateur avec cette adresse", 404)
    );
  }
  // 2) GENERATE THE RANDOM RESET TOKEN
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3)Envoyer à l'utilisateur
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password ? Confirmez votre identité ici ${resetURL}.\n If you didn't your password, `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password Token is valid for 10 minutes",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("Erreur lors de l'envoie du mail"), 500);
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get User based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  console.log(user);
  // 2) Si le token n'a pas expiré et qu'il y'a un utilisateur, définit un mot de passe
  if (!user) {
    return next(new AppError("Token Invalide ou a expiré", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) Modifier l'attribut changedPasswordAt pour l'utilisateur

  // 4) Connectez l'utilisateur, l'envoie d'un JWT code
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // console.log(res);
  // 1) Get the user from the Collection
  const user = await User.findById(req.user.id).select("+password");
  console.log(user);
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("You're actually password is Wrong ", 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  console.log(req.user);
  await user.save();
  // 2) Check if POSTED Current Password is Correct
  // 3) If So, Update the password
  // 4) Log User In, Send Jwt
  // console.log("You can't live with your own failure");
  createSendToken(user, 200, res);
});
