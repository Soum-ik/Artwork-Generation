/* eslint-disable @typescript-eslint/no-explicit-any */
const API_URL =
  "https://test-load-2-g0d6fwftfyhmf4gz.southeastasia-01.azurewebsites.net/api";
const PYTHON_API_URL =
  "https://test-load-huh2gzdze7dxaxd8.southeastasia-01.azurewebsites.net/";

export const signupUser = async (userData: any) => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Something went wrong");
  }

  return response.json();
};

export const loginUser = async (credentials: any) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Something went wrong");
  }

  return response.json();
};

interface UploadResponse {
  s3Url: any;
  message: string;
  upload: {
    id: string;
    artworkUrl: string;
    baseImageUrl: string;
  };
}

export const uploadArtwork = async (
  file: File,
  token: string
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("artwork", file);

  const response = await fetch(`${API_URL}/upload/artwork`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Something went wrong");
  }

  return response.json();
};

export const mapArtwork = async (
  artworkUrl: string,
  baseImageUrl: string,
  scale: number,
  rotation: number
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("artworkUrl", artworkUrl);
  formData.append("baseImageUrl", baseImageUrl);
  formData.append("scale", scale.toString());
  formData.append("rotation", rotation.toString());

  const response = await fetch(`${PYTHON_API_URL}/api/v1/map-artwork`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      artworkUrl,
      baseImageUrl,
      scale,
      rotation,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Something went wrong");
  }

  return response.json();
};

export const getUserUploads = async (token: string) => {
  const response = await fetch(`${API_URL}/user/uploads`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Something went wrong");
  }

  return response.json();
};
