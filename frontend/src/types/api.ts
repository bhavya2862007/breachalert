export interface Asset {
  id: string;
  email_hash: string;
  label: string;
  is_verified: boolean;
}

export interface Breach {
  id: string;
  breach_name: string;
  breach_title: string;
  breach_date: string;
  pwn_count: number;
}