const Product = require('../db/models/Product');
const Category = require('../db/models/Category');
const { Customer } = require('../db/models/Customer');
const Order = require('../db/models/Order');
const fs = require('fs');
const path = require('path');
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

class MenuAction {
    async saveCategory(req, res) {
        const { name, desc, image } = req.body; // Poprawione nazwisko opisu
        const newCategory = new Category({ name, desc, image });

        try {
            await newCategory.save();
            return res.status(200).json({ message: 'Category saved successfully' });
        } catch (err) {
            console.error('ERROR saving category: ', err);
            return res.status(500).json({ error: 'Error saving category' });
        }
    }

    async getAllCategories(req, res) {
        try {
            const categories = await Category.find().sort({ index: 1 });
            if (categories) {
                return res.status(200).json(categories);
            } else {
                return res.status(404).json({ error: 'Categories not found' });
            }
        } catch (err) {
            console.error('ERROR fetching categories: ', err);
            return res.status(500).json({ error: 'Error fetching categories' });
        }
    }

    async getCustomers(req, res) {
        try {
            const customers = await Customer.find().sort({ customerNumber: 1 });

            if (customers) {
                const customersWithOrders = await Promise.all(
                    customers.map(async (customer) => {
                        const amountOfOrders = await Order.countDocuments({ 'customer._id': customer._id });
                        return {
                            ...customer.toObject(),
                            amountOfOrders,
                        };
                    })
                );

                return res.status(200).json(customersWithOrders);
            } else {
                return res.status(404).json({ error: 'Customers not found' });
            }
        } catch (err) {
            console.error('ERROR fetching customers: ', err);
            return res.status(500).json({ error: 'Error fetching customers' });
        }
    }

    async getOrders(req, res) {
        const { id } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;
        const searchString = req.query.search || '';
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'desc' ? 1 : -1;

        const search = searchString
            ? {
                  $or: [
                      { 'customer.name': { $regex: searchString, $options: 'i' } },
                      { 'customer.surname': { $regex: searchString, $options: 'i' } },
                      { 'customer.email': { $regex: searchString, $options: 'i' } },
                      { 'product.name': { $regex: searchString, $options: 'i' } },
                      { orderType: { $regex: searchString, $options: 'i' } },
                      { orderNumber: { $regex: searchString, $options: 'i' } },
                      { note: { $regex: searchString, $options: 'i' } },
                      { status: { $regex: searchString, $options: 'i' } },
                  ],
              }
            : {};

        try {
            const orders = await Order.find(search)
                .sort({ [sortBy]: sortOrder })
                .collation({ locale: 'en', strength: 2 })
                .skip(offset)
                .limit(limit)
                .populate('customer', 'name surname');

            const totalOrders = await Order.countDocuments(search);

            if (orders) {
                return res.status(200).json({
                    currentPage: page,
                    totalPages: Math.ceil(totalOrders / limit),
                    orders,
                });
            } else {
                return res.status(404).json({ error: 'Orders not found' });
            }
        } catch (e) {
            console.log('ERROR fetching orders: ', e);
            return res.status(500).json({ error: e.message });
        }
    }

    async updateCategory(req, res) {
        const { id } = req.params;
        const { name, index } = req.body; // Poprawione req.body
        const updateFields = { name, index };
        if (req.file) updateFields.image = `${SERVER_URL}/uploads/${req.file.filename}`;

        try {
            const existingCategory = await Category.findById(id);
            if (!existingCategory) {
                return res.status(404).json({ error: 'Category not found' });
            }
            if (req.file) {
                const oldImagePath = existingCategory.image;
                updateFields.image = `${SERVER_URL}/uploads/${req.file.filename}`;
                if (oldImagePath) {
                    const oldImageFullPath = path.join(__dirname, '..', 'uploads', path.basename(oldImagePath));

                    fs.unlink(oldImageFullPath, (err) => {
                        if (err) {
                            console.error('Failed to delete old image: ', err);
                        } else {
                            console.log('Old image deleted successfully');
                        }
                    });
                }
            }

            const updatedCategory = await Category.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

            if (updatedCategory) {
                return res.status(200).json({ message: 'Category updated successfully' });
            } else {
                return res.status(404).json({ error: 'Category not found' });
            }
        } catch (err) {
            console.error('ERROR updating category: ', err);
            return res.status(500).json({ error: 'Error updating category' });
        }
    }

    async deleteCategory(req, res) {
        const { id } = req.params;
        try {
            const deletedCategory = await Category.findByIdAndDelete(id);
            if (deletedCategory) {
                return res.status(200).json({ message: 'Category deleted successfully' });
            } else {
                return res.status(404).json({ error: 'Category not found' });
            }
        } catch (err) {
            console.error('ERROR deleting category: ', err);
            return res.status(500).json({ error: 'Error deleting category' });
        }
    }

    async deleteCustomer(req, res) {
        const { id } = req.params;
        try {
            const deletedCustomer = await Customer.findByIdAndDelete(id);
            if (deletedCustomer) {
                return res.status(200).json({ message: 'Customer deleted successfully' });
            } else {
                return res.status(404).json({ error: 'Customer not found' });
            }
        } catch (err) {
            console.error('ERROR deleting customer: ', err);
            return res.status(500).json({ error: 'Error deleting customer' });
        }
    }

    async deleteOrder(req, res) {
        const { id } = req.params;
        try {
            const deletedOrder = await Order.findByIdAndDelete(id);
            if (deletedOrder) {
                return res.status(200).json({ message: 'Order deleted successfully' });
            } else {
                return res.status(404).json({ error: 'Order not found' });
            }
        } catch (err) {
            console.error('ERROR deleting order: ', err);
            return res.status(500).json({ error: 'Error deleting order' });
        }
    }

    async addProduct(req, res) {
        const { name, desc, price, image, category, isFeatured, ingridiens, isVegetarian, isGlutenFree, isAvailable } = req.body;
        if (!name || !price || !category) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        try {
            const productExists = await Product.findOne({ name });
            if (productExists) {
                return res.status(400).json({ error: 'Product already exists' });
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
                isAvailable,
            });

            await newProduct.save();
            return res.status(200).json({ message: 'Product saved successfully' });
        } catch (err) {
            console.error('ERROR saving product: ', err);
            return res.status(500).json({ error: 'Error saving product' });
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
                        isAvailable,
                    },
                },
                { new: true }
            );

            if (updatedProduct) {
                return res.status(200).json({ message: 'Product updated successfully' });
            } else {
                return res.status(404).json({ error: 'Product not found' });
            }
        } catch (err) {
            console.error('ERROR updating product: ', err);
            return res.status(500).json({ error: 'Error updating product' });
        }
    }

    async deleteProduct(req, res) {
        const { id } = req.params;
        try {
            const deletedProduct = await Product.findByIdAndDelete(id);
            if (deletedProduct) {
                return res.status(200).json({ message: 'Product deleted successfully' });
            } else {
                return res.status(404).json({ error: 'Product not found' });
            }
        } catch (err) {
            console.error('ERROR deleting product: ', err);
            return res.status(500).json({ error: 'Error deleting product' });
        }
    }

    async getProducts(req, res) {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;
        const searchString = req.query.search || '';
        const sortBy = req.query.sortBy || 'name';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

        const search = searchString ? { name: { $regex: searchString, $options: 'i' } } : {};

        try {
            let categoryFilter = {};
            if (req.query.category) {
                const category = await Category.findOne({
                    name: req.query.category,
                });
                if (category) {
                    // Użyj _id kategorii jako filtru
                } else {
                    // Jeśli kategoria nie istnieje, zwróć pustą listę
                    return res.status(404).json({ error: 'Category not found' });
                }
            }

            const filters = { ...search, ...categoryFilter };

            const products = await Product.find(filters)
                .populate({ path: 'category', select: 'name -_id' })
                .sort({ [sortBy]: sortOrder })
                .skip(offset)
                .limit(limit);

            const totalProducts = await Product.countDocuments(filters);

            return res.status(200).json({
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                products: products,
            });
        } catch (err) {
            console.error('ERROR fetching products: ', err);
            return res.status(500).json({ error: 'Error fetching products' });
        }
    }

    async getSingleProduct(req, res) {
        try {
            const product = await Product.findById(req.params.id);
            if (product) {
                return res.status(200).json(product);
            } else {
                return res.status(404).json({ error: 'Product not found' });
            }
        } catch (err) {
            console.error('ERROR fetching product: ', err);
            return res.status(500).json({ error: 'Error fetching product' });
        }
    }

    async getSingleCategory(req, res) {
        try {
            const category = await Category.findById(req.params.id);
            if (category) {
                res.status(200).json(category);
            } else {
                res.status(404).json({ error: 'Categoty not found' });
            }
        } catch (error) {
            console.error('Error: ' + error);
            return res.status(500).json({ error: 'Error fetching category' });
        }
    }

    async addCategory(req, res) {
        const { name, index } = req.body;
        const image = req.file ? req.file.filename : null;
        const newCategory = new Category({
            name,
            index,
            image: image ? `${SERVER_URL}/uploads/${image}` : null,
        });

        try {
            const categoryExists = await Category.findOne({ name });
            if (categoryExists) {
                return res.status(400).json({ error: 'Category already exists' });
            }
            await newCategory.save();
            return res.status(200).json({ message: 'Category saved successfully' });
        } catch (err) {
            console.error('ERROR saving category: ', err);
            return res.status(500).json({ error: 'Error saving category' });
        }
    }
}

module.exports = new MenuAction();
