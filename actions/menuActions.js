const Product = require("../db/models/Product");
const Category = require("../db/models/Category");

class MenuAction {
    async saveCategory(req, res) {
        const { name, description: desc, image } = req.body;
        const newCategory = new Category({ name, desc, image });

        try {
            await newCategory.save();
            res.status(200).json({ message: "Category saved successfully" });
        } catch (err) {
            console.log("ERROR: " + err);
            res.status(500).json("ERROR: " + err);
        }
    }

    async getAllCategories(req, res) {
        try {
            const categories = await Category.find();
            res.status(200).json(categories);
        } catch (err) {
            res.status(500).json("ERROR: " + err);
        }
    }

    async addProduct(req, res) {
        const item = await Product.findOne({ name: req.body.name });
        if (item) {
            res.status(400).json({ error: "Item already exists" });
            return;
        }

        const { name, description: desc, price, image, category, isFeatured, ingridiens, isVegetarian, isGlutenFree, isAvailable } = req.body;

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
        } catch (err) {
            console.log("ERROR: " + err);
            res.status(500).json("ERROR: " + err);
        }
    }

    async deleteProduct(req, res) {
        const { id } = req.params;

        try {
            const deleteProduct = await Product.findByIdAndDelete(id);
            if (deleteProduct) {
                res.status(200).json({ message: "Item was deleted successfully" })
            } else
                res.status(500).json({ error: "unable to delete product" })
        } catch (error) {
            res.status(500).json("Error: " + error)
        }
    }

    async updateProduct(req, res) {
        const { id } = req.params;
        const { name, description: desc, price, image, category, isFeatured, ingridiens, isVegetarian, isGlutenFree, isAvailable } = req.body;

        try {
            const updatedDoc = await Product.findByIdAndUpdate(
                id,
                {
                    $set: {
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
                    }
                },
                { new: true }
            );

            if (updatedDoc) {
                res.status(200).json({ message: "Item updated successfully" });
                console.log("Zaktualizowano produkt");
            } else {
                res.status(404).json({ message: "Item not found" });
            }
        } catch (err) {
            console.log("ERROR: " + err);
            res.status(500).json("ERROR: " + err);
        }
    }

    async getAllProducts(req, res) {
        try {
            const menuItems = await Product.find().populate({ path: 'category', select: 'name -_id' });
            res.status(200).json(menuItems);
        } catch (err) {
            console.log("ERROR: " + err);
            res.status(500).json("ERROR: " + err);
        }
    }

    async getSingleProduct(req, res) {
        try {
            const product = await Product.findById(req.params.id);
            res.status(200).json(product);
        } catch (err) {
            console.log("ERROR: " + err);
            res.status(500).json("ERROR: " + err);
        }
    }
}

module.exports = new MenuAction();
