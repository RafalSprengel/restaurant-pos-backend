const express = require("express");
const router = express.Router();
const MenuAction = require("../actions/menuActions");
const upload = require('middleware/upload')

router.post("/saveCategory", MenuAction.saveCategory);
router.delete("/deleteCategoty/:id", MenuAction.deleteCategory);
router.get("/getAllCategories", MenuAction.getAllCategories);
router.post("/addCategory", upload.single('image'), MenuAction.addCategory);
router.put("/updateCategory/:id", upload.single('image'), MenuAction.updateCategory);
router.post("/addProduct", MenuAction.addProduct);
router.delete("/deleteProduct/:id", MenuAction.deleteProduct);
router.get("/getAllProducts", MenuAction.getAllProducts);
router.put("/updateProduct/:id", MenuAction.updateProduct);
router.get("/getSingleProduct/:id", MenuAction.getSingleProduct);
router.all("*", (req, res) => {
    res.status(404).json({ "error": "not valid API address" });
});

module.exports = router;