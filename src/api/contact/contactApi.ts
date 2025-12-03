interface FormData {
  name: string;
  email: string;
  phone: string;
  title: string;
  message: string;
}

export const contactApi = async (data: FormData) => {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
};
