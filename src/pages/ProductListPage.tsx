import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../app/store";
import { Product } from "../types/product";
import { Link } from "react-router-dom";
import {
  fetchProducts,
  addProduct as addProductApi,
  deleteProduct as deleteProductApi,
} from "../features/products/ProductService";
import {
  setProducts,
  addProduct,
  deleteProduct,
} from "../features/products/productSlice";
import Modal from "../components/Modal";

const ProductListPage = () => {
  const dispatch = useDispatch();
  const products = useSelector((state: RootState) => state.products.products);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [sortType, setSortType] = useState<"name" | "count">("name");

  const [formData, setFormData] = useState({
    name: "",
    count: 0,
    width: 0,
    height: 0,
    weight: "",
    imageUrl: "",
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsFromServer = await fetchProducts();
        dispatch(setProducts(productsFromServer));
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    loadProducts();
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "count" || name === "width" || name === "height" ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.weight || !formData.imageUrl) {
      alert("Please fill in all required fields!");
      return;
    }
  
    const maxId = products.length > 0 ? Math.max(...products.map(p => Number(p.id))) : 0;
    const newId = maxId + 1;
  
    const newProduct = {
      id: newId,
      name: formData.name,
      count: formData.count,
      size: {
        width: formData.width,
        height: formData.height,
      },
      weight: formData.weight,
      imageUrl: formData.imageUrl,
      comments: [],
    };
  
    try {
      await addProductApi(newProduct);
      const updatedProducts = await fetchProducts();
      dispatch(setProducts(updatedProducts));
  
      setIsAddModalOpen(false);
      setFormData({
        name: "",
        count: 0,
        width: 0,
        height: 0,
        weight: "",
        imageUrl: "",
      });
    } catch (error) {
      console.error("Failed to add product:", error);
    }
  };
  
  

  const openDeleteModal = (id: number) => {
    setSelectedProductId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedProductId == null) return;

    try {
      await deleteProductApi(selectedProductId);
      dispatch(deleteProduct(selectedProductId));
      setIsDeleteModalOpen(false);
      setSelectedProductId(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortType === "name") {
      return a.name.localeCompare(b.name);
    }
    if (sortType === "count") {
      return a.count - b.count;
    }
    return 0;
  });

  return (
    <div style={{ padding: "40px", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <div style={{
        backgroundColor: "#fff",
        padding: "30px",
        borderRadius: "16px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        maxWidth: "800px",
        margin: "0 auto"
      }}>
        <h1 style={{ marginBottom: "20px", fontSize: "28px", fontWeight: "bold" }}>Product List</h1>

        <button
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            marginBottom: "20px",
          }}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Product
        </button>

        {/* Dropdown сортування */}
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="sort" style={{ marginRight: "10px", fontWeight: "bold" }}>Sort by:</label>
          <select
            id="sort"
            value={sortType}
            onChange={(e) => setSortType(e.target.value as "name" | "count")}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              cursor: "pointer"
            }}
          >
            <option value="name">Name (A-Z)</option>
            <option value="count">Count (Ascending)</option>
          </select>
        </div>

        <ul style={{ listStyle: "none", padding: 0 }}>
          {sortedProducts.length === 0 ? (
            <p>No products available.</p>
          ) : (
            sortedProducts.map((product: Product) => (
              <li
                key={product.id}
                style={{
                  marginBottom: "16px",
                  backgroundColor: "#f1f5f9",
                  padding: "16px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <Link
                  to={`/product/${product.id}`}
                  style={{ textDecoration: "none", color: "#2563eb", fontWeight: "bold" }}
                >
                  {product.name} (Count: {product.count})
                </Link>
                <button
                  onClick={() => openDeleteModal(product.id)}
                  style={{
                    backgroundColor: "#f44336",
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Модалка додавання продукту */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <h2>Add New Product</h2>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleInputChange}
          style={{ display: "block", marginBottom: "10px", width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
        />
        <input
          type="number"
          name="count"
          placeholder="Count"
          value={formData.count}
          onChange={handleInputChange}
          style={{ display: "block", marginBottom: "10px", width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
        />
        <input
          type="number"
          name="width"
          placeholder="Width"
          value={formData.width}
          onChange={handleInputChange}
          style={{ display: "block", marginBottom: "10px", width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
        />
        <input
          type="number"
          name="height"
          placeholder="Height"
          value={formData.height}
          onChange={handleInputChange}
          style={{ display: "block", marginBottom: "10px", width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
        />
        <input
          type="text"
          name="weight"
          placeholder="Weight"
          value={formData.weight}
          onChange={handleInputChange}
          style={{ display: "block", marginBottom: "10px", width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
        />
        <input
          type="text"
          name="imageUrl"
          placeholder="Image URL"
          value={formData.imageUrl}
          onChange={handleInputChange}
          style={{ display: "block", marginBottom: "20px", width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
        />
        <button onClick={handleSubmit} style={{ padding: "8px 20px", marginRight: "10px" }}>
          Confirm
        </button>
        <button onClick={() => setIsAddModalOpen(false)} style={{ padding: "8px 20px" }}>
          Cancel
        </button>
      </Modal>

      {/* Модалка підтвердження видалення */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete this product?</p>
        <button
          onClick={confirmDelete}
          style={{ backgroundColor: "#f44336", color: "white", padding: "8px 20px", marginRight: "10px", border: "none", borderRadius: "8px", cursor: "pointer" }}
        >
          Confirm
        </button>
        <button
          onClick={() => setIsDeleteModalOpen(false)}
          style={{ padding: "8px 20px", borderRadius: "8px", border: "1px solid #ccc" }}
        >
          Cancel
        </button>
      </Modal>
    </div>
  );
};

export default ProductListPage;
