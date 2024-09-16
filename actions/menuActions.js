const Product = require("../db/models/Product");
const Category = require("../db/models/Category");

class MenuAction {
    // Zapis nowej kategorii
    async saveCategory(req, res) {
        const { name, description, image } = req.body; // Poprawione nazwisko opisu
        const newCategory = new Category({ name, description, image });

        try {
            await newCategory.save();
            return res.status(200).json({ message: "Category saved successfully" });
        } catch (err) {
            console.error("ERROR saving category: ", err);
            return res.status(500).json({ error: "Error saving category" });
        }
    }

    // Pobranie wszystkich kategorii
    async getAllCategories(req, res) {
        try {
            const categories = await Category.find();
            return res.status(200).json(categories);
        } catch (err) {
            console.error("ERROR fetching categories: ", err);
            return res.status(500).json({ error: "Error fetching categories" });
        }
    }

    // Aktualizacja kategorii
    async updateCategory(req, res) {
        const { id } = req.params;
        const { name, description, image } = req.body; // Poprawione req.body

        try {
            const updatedCategory = await Category.findByIdAndUpdate(
                id,
                { $set: { name, description, image } },
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

    // Usunięcie kategorii
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

    // Dodanie nowego produktu
    async addProduct(req, res) {
        const { name, description, price, image, category, isFeatured, ingridiens, isVegetarian, isGlutenFree, isAvailable } = req.body;

        try {
            const productExists = await Product.findOne({ name });
            if (productExists) {
                return res.status(400).json({ error: "Product already exists" });
            }

            const newProduct = new Product({
                name,
                description,
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

    // Aktualizacja produktu
    async updateProduct(req, res) {
        const { id } = req.params;
        const { name, description, price, image, category, isFeatured, ingridiens, isVegetarian, isGlutenFree, isAvailable } = req.body;

        try {
            const updatedProduct = await Product.findByIdAndUpdate(
                id,
                {
                    $set: {
                        name,
                        description,
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

    // Usunięcie produktu
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

    // Pobranie wszystkich produktów
    async getAllProducts(req, res) {
        try {
            const products = await Product.find().populate({ path: 'category', select: 'name -_id' });
            return res.status(200).json(products);
        } catch (err) {
            console.error("ERROR fetching products: ", err);
            return res.status(500).json({ error: "Error fetching products" });
        }
    }

    // Pobranie jednego produktu
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

    // Dodanie nowej kategorii
    async addCategory(req, res) {
        const { name, image } = req.body;

        try {
            const categoryExists = await Category.findOne({ name });
            if (categoryExists) {
                return res.status(400).json({ error: "Category already exists" });
            }

            const newCategory = new Category({ name, image });
            await newCategory.save();
            return res.status(200).json({ message: "Category saved successfully" });
        } catch (err) {
            console.error("ERROR saving category: ", err);
            return res.status(500).json({ error: "Error saving category" });
        }
    }
}

module.exports = new MenuAction();
