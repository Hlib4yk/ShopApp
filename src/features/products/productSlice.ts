import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "../../types/product";

interface ProductsState {
  products: Product[];
}

const initialState: ProductsState = {
  products: [],
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts(state, action: PayloadAction<Product[]>) {
      state.products = action.payload;
    },
    addProduct(state, action: PayloadAction<Product>) {
      state.products.push(action.payload);
    },
    deleteProduct(state, action: PayloadAction<number>) {
      state.products = state.products.filter(product => product.id !== action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    
  },
});

export const { setProducts, addProduct, deleteProduct, updateProduct } = productSlice.actions;
export default productSlice.reducer;
