export interface Car {
  id: string;
  name: string;
  year: number;
  price: number;
  location: string;
  info: string;
  featured: boolean;
  tel: string; // This will be fixed
  imagePaths: string[];
  createdAt: string;
  updatedAt?: string;
  status: 'active' | 'sold' | 'pending';
  uid: string;
  email: string;
}

export interface CarFormData {
  name: string;
  price: number;
  year: number;
  info: string;
  tel: string;
  location: string;
}