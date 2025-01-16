export interface Car {
  id: string;
  name: string;
  year: number;
  price: number;
  info: string;
  location: string;
  tel: string;
  featured: boolean;
  imagePaths: string[];
  status: 'active' | 'sold' | 'pending';
  createdAt: string;
  updatedAt?: string;
  uid: string;
  email: string;
  views: number;
}

export interface CarFormData {
  name: string;
  price: number;
  year: number;
  info: string;
  tel: string;
  location: string;
}