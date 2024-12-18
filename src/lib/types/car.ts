export interface Car {
  id: string;
  uid: string;
  name: string;
  price: number;
  year: number;
  info: string;
  tel: string;
  email: string;
  location: string; // Added location field
  imagePath?: string;
  imagePaths?: string[];
  featured: boolean;
  status: string;
  views: number;
  posted: string;
  createdAt: string;
  // Optional array for multiple contact numbers
  contactNumbers?: string[];
}

export interface CarFormData {
  name: string;
  price: number;
  year: number;
  info: string;
  tel: string;
  location: string;
}