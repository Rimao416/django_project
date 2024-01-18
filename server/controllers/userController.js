const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("./../models/userModel");
const factory = require("./handlerFactory");
// REQUEST
const filterObj = (obj, ...allowedFields) => {
  let newObj = [];
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Créer une erreur si l'utilisateur essaie de modifier son mot de passe
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "Cette route n'est pas pour la modification du mot de passe ",
        400
      )
    );
  }

  // 2) Update User Document
  const filteredBody = filterObj(req.body, "name", "email");
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updateUser,
    },
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: "Error",
    message: "Cette route n'est pas encore définie",
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: "Error",
    message: "Cette route n'est pas encore définie",
  });
};


exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.updateUser =factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User);

// app.get("/api/v1/tours", getAllTours);
// app.post("/api/v1/tours", createTour);

// app.get("/api/v1/tours/:id", getTour);
// app.patch("/api/v1/tours/:id", updateTour);
// app.delete("/api/v1/tours/:id", deleteTour);
