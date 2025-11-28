import React from "react";
import { Alert } from "react-native";
import * as ExpoImagePicker from "expo-image-picker";

export interface ImageAsset {
  uri: string;
  type?: string;
  fileName?: string;
  width?: number;
  height?: number;
  fileSize?: number;
}

interface ImagePickerProps {
  onImageSelected: (image: ImageAsset) => void;
  onError?: (error: string) => void;
  quality?: number;
  allowsEditing?: boolean;
  aspect?: [number, number];
  allowsMultipleSelection?: boolean;
  children?: (props: { selectImage: () => void }) => React.ReactNode;
}

const ImagePicker = ({
  onImageSelected,
  onError,
  quality = 1.0,
  allowsEditing = false,
  aspect = [4, 3],
  allowsMultipleSelection = false,
  children,
}: ImagePickerProps) => {
  const selectImage = () => {
    Alert.alert("Select Image", "Choose how you want to select an image", [
      { text: "📷 Camera", onPress: openCamera },
      { text: "🖼️ Gallery", onPress: openGallery },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const openCamera = async () => {
    try {
      const permissionResult =
        await ExpoImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        onError?.("Camera permission is required to take photos");
        return;
      }

      const result = await ExpoImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing,
        aspect,
        quality,
        base64: false,
        exif: false,
      });

      handleImageResult(result);
    } catch (error) {
      onError?.(`Failed to open camera: ${error}`);
    }
  };

  const openGallery = async () => {
    try {
      const permissionResult =
        await ExpoImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        onError?.("Media library permission is required to select photos");
        return;
      }

      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing,
        aspect,
        quality,
        allowsMultipleSelection,
        base64: false,
        exif: false,
      });

      handleImageResult(result);
    } catch (error) {
      onError?.(`Failed to open gallery: ${error}`);
    }
  };

  const handleImageResult = (result: ExpoImagePicker.ImagePickerResult) => {
    if (result.canceled) {
      return;
    }

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];

      onImageSelected({
        uri: asset.uri,
        type: asset.mimeType || asset.type || "image",
        fileName: asset.fileName || undefined,
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize,
      });
    }
  };

  if (children) {
    return <>{children({ selectImage })}</>;
  }

  return null;
};

export default ImagePicker;
