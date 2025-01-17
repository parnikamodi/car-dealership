export interface Car {
  id: string;
  uid: string;
  name: string;
  price: number;
  year: number;
  info: string;
  email: string;
  imagePath?: string;
  imagePaths?: string[];
  featured: boolean;
  status: string;
  views: number;
  posted: string;
  createdAt: string;
}

export interface CarFormData {
  name: string;
  price: number;
  year: number;
  info: string;
}