/**
 * User Model
 * Represents user profile information from the API
 */
export interface User {
  id: number;
  phone: string;
  countrycode: string;
  fullname: string;
  gender: string;
  dob: string;
  mobile: string;
  annualincome: string;
  email: string;
  monthlySavings: string;
  investorType: string;
  registeredOn: string;
  paidOn: string;
  expiredOn: string;
  password: string;
  status: number;
  is_admin: boolean;
  is_verified: boolean;
  unpaid: boolean;
  paid: boolean;
  trained: boolean;
  role: string;
  target: string | null;
  otp: string;
  membership_otp: string;
  targetAmount: string;
  targetExpired: string;
  current_token: string;
  createdAt: string;
  updatedAt: string;
}
