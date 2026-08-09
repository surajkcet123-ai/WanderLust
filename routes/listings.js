const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn} = require("../middleware.js");
const {isOwner,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer')
const {storage} = require("../CloudConfig.js");
const upload = multer({ storage})

router.route("/")
.get(home, wrapAsync(listingController.index))
.post( 
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing));
    // New Route
router.get("/new", isLoggedIn,listingController.renderNewForm);

router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(
    isLoggedIn,
    isOwner,
     upload.single("listing[image]"),
     validateListing,
       wrapAsync(listingController.updateListing))
.delete(isLoggedIn, isOwner,listingController.deleteListing);

// Edit Route
router.get("/:id/edit", isLoggedIn,isOwner,listingController.editListing);


module.exports = router;