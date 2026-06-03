import Product from "../models/Product.js";

// Create product (Admin only)
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, image, category, countInStock } = req.body;

    const product = await Product.create({
      name,
      price,
      description,
      image,
      category,
      countInStock,
    });

    res.status(201).json(product);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all products (Public)
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedProduct);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};