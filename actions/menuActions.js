const Product = require("../db/models/Product");
const Category = require("../db/models/Category");
const fs = require('fs');
const path = require('path');
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

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
        const { name, index } = req.body; // Poprawione req.body
        const updateFields = { name, index };
        if (req.file) updateFields.image = `${SERVER_URL}/uploads/${req.file.filename}`

        try {
            const existingCategory = await Category.findById(id);
            if (!existingCategory) {
                return res.status(404).json({ error: "Category not found" });
            }
            if (req.file) {
                const oldImagePath = existingCategory.image;
                updateFields.image = `${SERVER_URL}/uploads/${req.file.filename}`;
                if (oldImagePath) {
                    const oldImageFullPath = path.join(__dirname, '..', 'uploads', path.basename(oldImagePath));

                    fs.unlink(oldImageFullPath, (err) => {
                        if (err) {
                            console.error("Failed to delete old image: ", err);
                        } else {
                            console.log("Old image deleted successfully");
                        }
                    });
                }
            }

            const updatedCategory = await Category.findByIdAndUpdate(
                id,
                { $set: updateFields },
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
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;
        try {
            const products = await Product.find()
                .populate({ path: 'category', select: 'name -_id' })
                .skip(offset)
                .limit(limit);

            const totalProducts = await Product.countDocuments();

            return res.status(200).json({
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                products: products,
            });

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

    async getSingleCategory(req, res) {
        try {
            const category = await Category.findById(req.params.id);
            if (category) {
                res.status(200).json(category)
            } else {
                res.status(404).json({ error: "Categoty not found" });
            }
        } catch (error) {
            console.error('Error: ' + error);
            return res.status(500).json({ error: "Error fetching category" });
        }
    }
    async addCategory(req, res) {
        const { name, index } = req.body;
        const image = req.file ? req.file.filename : null;
        const newCategory = new Category({
            name,
            index,
            image: image ? `${SERVER_URL}/uploads/${image}` : null
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
