const Product = require("../db/models/Product");
const Category = require("../db/models/Category");

class MenuAction {
    async saveCategory(req, res) {
        const name = req.body.name;
        const desc = req.body.description;
        const image = req.body.image;
        const newCategory = new Category({
            name,
            desc,
            image
        })

        try {
            await newCategory.save();
        }
        catch (err) {
            console.log("ERROR: " + err);
            res.status(500).json("ERROR: " + err);
        }
    };

    async getAllCategories(req, res) {

        try {

            const categories = await Category.find();
            res.status(200).json(categories);
        }
        catch (err) {
            res.status(500).json("ERROR: " + err);
        }
    };

    async addProduct(req, res) {
        const item = await Product.findOne({ name: req.body.name });
        if (item) {
            console.log('item istnieje');
            res.status(400).json({ error: "Item already exists" });
            return;
        }
        const name = req.body.name;
        const desc = req.body.description;
        const price = req.body.price;
        const image = req.body.image;
        const category = req.body.category;
        const isFeatured = req.body.isFeatured;
        const ingridiens = req.body.ingridiens;
        const isVegetarian = req.body.isVegetarian;
        const isGlutenFree = req.body.isGlutenFree;
        const isAvailable = req.body.isAvailable;
        const newItem = new Product({
            name,
            desc,
            price,
            image,
            category,
            isFeatured,
            ingridiens,
            isVegetarian,
            isGlutenFree,
            isAvailable
        });

        try {
            await newItem.save();
            res.status(200).json({ message: "Item saved successfully" });
            console.log("Dodano nowy produkt do bazy");
        }
        catch (err) {
            console.log("ERROR: " + err);
            res.status(500).json("ERROR: " + err);
        }
    };

    async getAllProducts(req, res) {
        try {
            console.log("Wykonuje getAllMenuItems");
            const menuItems = await Product.find();
            res.status(200).json(menuItems);
        }
        catch (err) {
            console.log("ERROR: " + err);
            res.status(500).json("ERROR: " + err);
        }
    }

    async getSingleProduct(req, res) {
        try {
            const product = await Product.findById(req.params.id);
            res.status(200).json(product);
        }
        catch (err) {
            console.log("ERROR: " + err);
            res.status(500).json("ERROR: " + err);
        }
    }
}

module.exports = new MenuAction();