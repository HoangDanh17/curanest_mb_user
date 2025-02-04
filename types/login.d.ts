export interface LoginBodyType {
  "phone-number": string;
  password: string;
}

export interface LoginResType {
  data: {
    "account-info": {
      "full-name": string;
      "phone-number": string;
      email: string;
      role: string;
    };
    token: {
      access_token: string;
      access_token_exp_in: number;
    };
  };
  status: number;
}

export interface RegisterBodyType {
  "full-name": string;
  password: string;
  "phone-number": string;
  email: string | null;
}
export interface RegisterResType {
  message: string;
}