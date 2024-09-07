const express = require("express");
const router = express.Router();
const MenuAction = require("../actions/menuActions");

router.post("/saveCategory", MenuAction.saveCategory);
router.get("/getAllCategories", MenuAction.getAllCategories);
router.post("/saveMenuItem", MenuAction.saveMenuItem);
router.get("/getAllMenuItems", MenuAction.getAllMenuItems);
router.get("/getSingleProduct/:id", MenuAction.getSingleProduct);
router.all("*", (req, res) => {
    res.status(404).json({ "error": "not valid API address" });
});

module.exports = router;