import api from "./client";

export const login = async (
  email: string,
  password: string
) => {
  const form = new URLSearchParams();

  form.append("username", email);
  form.append("password", password);

  const response = await api.post(
    "/auth/login",
    form,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data;
};

export const register = async (
  email: string,
  password: string,
  full_name: string
) => {
  const response = await api.post("/auth/register", {
    email,
    password,
    full_name,
  });

  return response.data;
};