import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchProductById,
  updateProduct as updateProductApi,
  fetchComments,
  addComment as addCommentApi,
  deleteComment as deleteCommentApi,
} from "../features/products/ProductService";
import { useDispatch } from "react-redux";
import { updateProduct } from "../features/products/productSlice";
import { Product } from "../types/product";
import { CommentModel } from "../types/product";
import Modal from "../components/Modal";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState<Product | null>(null);
  const [comments, setComments] = useState<CommentModel[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    count: 0,
    width: 0,
    height: 0,
    weight: "",
    imageUrl: "",
  });

  useEffect(() => {
    const loadProductAndComments = async () => {
      if (!id) return;
      try {
        const productData = await fetchProductById(Number(id));
        setProduct(productData);

        const commentsData = await fetchComments(Number(id));
        setComments(commentsData);
      } catch (error) {
        console.error("Failed to fetch product or comments:", error);
      }
    };

    loadProductAndComments();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "count" || name === "width" || name === "height" ? Number(value) : value,
    }));
  };

  const handleEditClick = () => {
    if (product) {
      setFormData({
        name: product.name,
        count: product.count,
        width: product.size.width,
        height: product.size.height,
        weight: product.weight,
        imageUrl: product.imageUrl,
      });
      setIsEditModalOpen(true);
    }
  };

  const handleUpdate = async () => {
    if (!product) return;

    const updatedData: Partial<Product> = {
      ...product,
      name: formData.name,
      count: formData.count,
      size: {
        width: formData.width,
        height: formData.height,
      },
      weight: formData.weight,
      imageUrl: formData.imageUrl,
    };

    try {
      const updatedProductFromServer = await updateProductApi(product.id, updatedData);
      dispatch(updateProduct(updatedProductFromServer));
      setProduct(updatedProductFromServer);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim() || !product) return;

    const newComment = {
      productId: product.id,
      description: newCommentText,
      date: new Date().toLocaleString(),
    };

    try {
      const addedComment = await addCommentApi(newComment);
      setComments((prev) => [...prev, addedComment]);
      setNewCommentText("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteCommentApi(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

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
        <button
          onClick={() => navigate(-1)}
          style={{
            marginBottom: "20px",
            backgroundColor: "#3b82f6",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer"
          }}
        >
          ← Back
        </button>

        <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>{product.name}</h1>

        <img
          src={product.imageUrl}
          alt={product.name}
          style={{ width: "100%", height: "300px", objectFit: "cover", borderRadius: "12px", marginBottom: "20px" }}
        />

        <p><strong>Count:</strong> {product.count}</p>
        <p><strong>Size:</strong> {product.size.width} x {product.size.height}</p>
        <p><strong>Weight:</strong> {product.weight}</p>

        <button
          onClick={handleEditClick}
          style={{
            marginTop: "20px",
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer"
          }}
        >
          Edit Product
        </button>

        {/* Modal Edit Product */}
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <h2>Edit Product</h2>
          {["name", "count", "width", "height", "weight", "imageUrl"].map((field) => (
            <input
              key={field}
              type={field === "count" || field === "width" || field === "height" ? "number" : "text"}
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={(formData as any)[field]}
              onChange={handleInputChange}
              style={{ display: "block", marginBottom: "10px", width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
            />
          ))}
          <button onClick={handleUpdate} style={{ marginRight: "10px", padding: "8px 20px" }}>
            Confirm
          </button>
          <button onClick={() => setIsEditModalOpen(false)} style={{ padding: "8px 20px" }}>
            Cancel
          </button>
        </Modal>

        <hr style={{ margin: "30px 0" }} />

        <h2>Comments</h2>

        <ul style={{ marginBottom: "20px", padding: "0", listStyle: "none" }}>
          {comments.length === 0 ? (
            <p>No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <li key={comment.id} style={{
                backgroundColor: "#f1f5f9",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "8px",
              }}>
                <p style={{ marginBottom: "6px" }}>{comment.description}</p>
                <small style={{ color: "#6b7280" }}>{comment.date}</small>
                <div>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    style={{
                      backgroundColor: "#f44336",
                      color: "white",
                      padding: "5px 10px",
                      marginTop: "5px",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>

        <div>
          <input
            type="text"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Add a comment..."
            style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
          />
          <button
            onClick={handleAddComment}
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer"
            }}
          >
            Add Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
