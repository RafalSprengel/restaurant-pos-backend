const Menu = require("../db/models/menuItem");
const Category = require("../db/models/menuCategory");

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
        console.log('Received JSON:', req.body);
        const item = await Menu.findOne({ name: req.body.name });
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
        const newItem = new Menu({
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
            console.log("Zapisano nowy element menu");
        }
        catch (err) {
            console.log("ERROR: " + err);
            res.status(500).json("ERROR: " + err);
        }
    };

    async getAllProducts(req, res) {
        try {
            console.log("Wykonuje getAllMenuItems");
            const menuItems = await Menu.find();
            res.status(200).json(menuItems);
        }
        catch (err) {
            console.log("ERROR: " + err);
            res.status(500).json("ERROR: " + err);
        }
    }

    async getSingleProduct(req, res) {
        try {
            const product = await Menu.findById(req.params.id);
            res.status(200).json(product);
        }
        catch (err) {
            console.log("ERROR: " + err);
            res.status(500).json("ERROR: " + err);
        }
    }
}

module.exports = new MenuAction();