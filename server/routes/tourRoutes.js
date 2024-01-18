const express = require("express");
const router = express.Router();
const authController = require("./../controllers/authController");
const tourController = require("./../controllers/tourController");
const reviewRouter = require("./../routes/reviewRoutes");

// router.param('id',tourController.checkId)

router.use('/:tourId/reviews',reviewRouter)
router
  .route("/top-5-cheap")
  .get(tourController.aliasTopTours, tourController.getAllTours);
router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);
router.route("/tour-stats").get(tourController.getTourStats);
router
  .route("/")
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );

// Nested Routes

// router
// .route("/:tourId/reviews")
// .post(
//   authController.protect,
//   authController.restrictTo("users"),
//   reviewController.createReview
// );

module.exports = router;
