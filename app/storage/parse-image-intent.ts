export const parseImageIntent = <const Field extends string>(
  imageField: Field,
  {
    image,
    imageFromLibrary,
    imageDelete,
  }: {
    image: string | null | undefined;
    imageFromLibrary: string | null | undefined;
    imageDelete?: boolean;
  }
): {} | { [key in Field]: string } => {
  let imageToSave: string | null | undefined = undefined;
  if (!image && !imageFromLibrary) {
    return {};
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
      [imageField]: imageToSave,
    };
  }
  return {};
};
