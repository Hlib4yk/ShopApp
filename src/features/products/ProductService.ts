import axios from "axios";
import { CommentModel, Product } from "../../types/product";

const baseUrl = "http://localhost:3001/products";

export const fetchProducts = async () => {
    const response = await axios.get<Product[]>(baseUrl);
    return response.data;
};

export const addProduct = async (product: Omit<Product, "id">) => {
    const response = await axios.post<Product>(baseUrl, product);
    return response.data;
};  

export const deleteProduct = async (id: number) => {
    await axios.delete(`${baseUrl}/${id}`);
};

export const updateProduct = async (id: number, updatedData: Partial<Product>) => {
    const response = await axios.patch<Product>(`${baseUrl}/${id}`, updatedData);
    return response.data;
  };
  

export const fetchProductById = async (id: number) => {
    const response = await axios.get<Product>(`${baseUrl}/${id}`);
    return response.data;
  };

  export const fetchComments = async (productId: number) => {
    const response = await axios.get<CommentModel[]>(`http://localhost:3001/comments?productId=${productId}`);
    return response.data;
  };
  
  export const addComment = async (comment: Omit<CommentModel, "id">) => {
    const response = await axios.post<CommentModel>(`http://localhost:3001/comments`, comment);
    return response.data;
  };
  
  export const deleteComment = async (id: number) => {
    await axios.delete(`http://localhost:3001/comments/${id}`);
  };
  
  
  
