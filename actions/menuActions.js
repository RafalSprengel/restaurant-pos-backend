const Product = require("../db/models/Product");
const Category = require("../db/models/Category");

class MenuAction {

    async saveCategory(req, res) {
        const { name, desc, image } = req.body; // Poprawione nazwisko opisu
        const newCategory = new Category({ name, desc, image });

        try {
            await newCategory.save();
            return res.status(200).json({ message: "Category saved successfully" });
        } catch (err) {
            console.error("ERROR saving category: ", err);
            return res.status(500).json({ error: "Error saving category" });
        }
    }

    async getAllCategories(req, res) {
        try {
            const categories = await Category.find();
            return res.status(200).json(categories);
        } catch (err) {
            console.error("ERROR fetching categories: ", err);
            return res.status(500).json({ error: "Error fetching categories" });
        }
    }

    async updateCategory(req, res) {
        const { id } = req.params;
        const { name, desc, image } = req.body; // Poprawione req.body

        try {
            const updatedCategory = await Category.findByIdAndUpdate(
                id,
                { $set: { name, desc, image } },
                { new: true }
            );

            if (updatedCategory) {
                return res.status(200).json({ message: "Category updated successfully" });
            } else {
                return res.status(404).json({ error: "Category not found" });
            }
        } catch (err) {
            console.error("ERROR updating category: ", err);
            return res.status(500).json({ error: "Error updating category" });
        }
    }

    async deleteCategory(req, res) {
        const { id } = req.params;
        try {
            const deletedCategory = await Category.findByIdAndDelete(id);
            if (deletedCategory) {
                return res.status(200).json({ message: "Category deleted successfully" });
            } else {
                return res.status(404).json({ error: "Category not found" });
            }
        } catch (err) {
            console.error("ERROR deleting category: ", err);
            return res.status(500).json({ error: "Error deleting category" });
        }
    }

    async addProduct(req, res) {
        const { name, desc, price, image, category, isFeatured, ingridiens, isVegetarian, isGlutenFree, isAvailable } = req.body;

        try {
            const productExists = await Product.findOne({ name });
            if (productExists) {
                return res.status(400).json({ error: "Product already exists" });
            }

            const newProduct = new Product({
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

            await newProduct.save();
            return res.status(200).json({ message: "Product saved successfully" });
        } catch (err) {
            console.error("ERROR saving product: ", err);
            return res.status(500).json({ error: "Error saving product" });
        }
    }

    async updateProduct(req, res) {
        const { id } = req.params;
        const { name, desc, price, image, category, isFeatured, ingridiens, isVegetarian, isGlutenFree, isAvailable } = req.body;

        try {
            const updatedProduct = await Product.findByIdAndUpdate(
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

            if (updatedProduct) {
                return res.status(200).json({ message: "Product updated successfully" });
            } else {
                return res.status(404).json({ error: "Product not found" });
            }
        } catch (err) {
            console.error("ERROR updating product: ", err);
            return res.status(500).json({ error: "Error updating product" });
        }
    }

    async deleteProduct(req, res) {
        const { id } = req.params;

        try {
            const deletedProduct = await Product.findByIdAndDelete(id);
            if (deletedProduct) {
                return res.status(200).json({ message: "Product deleted successfully" });
            } else {
                return res.status(404).json({ error: "Product not found" });
            }
        } catch (err) {
            console.error("ERROR deleting product: ", err);
            return res.status(500).json({ error: "Error deleting product" });
        }
    }

    async getAllProducts(req, res) {
        try {
            const products = await Product.find().populate({ path: 'category', select: 'name -_id' });
            return res.status(200).json(products);
        } catch (err) {
            console.error("ERROR fetching products: ", err);
            return res.status(500).json({ error: "Error fetching products" });
        }
    }

    async getSingleProduct(req, res) {
        try {
            const product = await Product.findById(req.params.id);
            if (product) {
                return res.status(200).json(product);
            } else {
                return res.status(404).json({ error: "Product not found" });
            }
        } catch (err) {
            console.error("ERROR fetching product: ", err);
            return res.status(500).json({ error: "Error fetching product" });
        }
    }

    async addCategory(req, res) {
        const { name } = req.body;
        const image = req.file ? req.file.filename : null;
        const newCategory = new Category({
            name,
            image: image ? `uploads/${image}` : null
        });

        try {
            const categoryExists = await Category.findOne({ name });
            if (categoryExists) {
                return res.status(400).json({ error: "Category already exists" });
            }
            await newCategory.save();
            return res.status(200).json({ message: "Category saved successfully" });
        } catch (err) {
            console.error("ERROR saving category: ", err);
            return res.status(500).json({ error: "Error saving category" });
        }
    }
}

module.exports = new MenuAction();
