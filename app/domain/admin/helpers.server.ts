export const withFileInput = <T extends object>(
  data: T,
  {
    image,
    imageFromLibrary,
    imageDelete,
  }: {
    image: string | null | undefined;
    imageFromLibrary: string | null | undefined;
    imageDelete?: boolean;
  },
  field: keyof T
): T => {
  let imageToSave: string | null | undefined = undefined;
  if (!image && !imageFromLibrary) {
    imageToSave = undefined;
  }
  if (
    imageFromLibrary &&
    typeof imageFromLibrary === "string" &&
    imageFromLibrary.length > 0 &&
    imageFromLibrary.startsWith("http")
  ) {
    imageToSave = imageFromLibrary;
  }
  if (
    image &&
    typeof image === "string" &&
    image.length > 0 &&
    image.startsWith("http")
  ) {
    imageToSave = image;
  }
  if (imageDelete) {
    imageToSave = null;
  }
  if (imageToSave !== undefined) {
    return {
      ...data,
      [field]: imageToSave,
    };
  }
  return data;
};
