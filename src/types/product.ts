export interface Size {
    width: number;
    height: number;
  }
  
export interface Product {
    id: number;
    imageUrl: string;
    name: string;
    count: number;
    size: Size;
    weight: string;
    comments: number[]; 
  }

export interface CommentModel {
    id: number;
    productId: number;
    description: string;
    date: string;
  }
  
  