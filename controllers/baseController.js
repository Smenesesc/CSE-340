const utilities = require("../utilities/");
const baseController = {};

baseController.buildHome = async function (req, res) {
  const nav = await utilities.getNav();
  // highlight Home tab too
  req.flash("notice", "This is a flash message.")
  res.render("index", { title: "Home", nav, active: "home" });
};

module.exports = baseController;
