import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export const useImageUpload = () => {
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const uploadImageToConvex = async (imageUri: string): Promise<string> => {
    try {
      // Get the upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      const response = await fetch(imageUri);
      const blob = await response.blob();

      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": blob.type,
        },
        body: blob,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      const result = await uploadResponse.json();
      return result.storageId;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  };

  return { uploadImageToConvex };
};
