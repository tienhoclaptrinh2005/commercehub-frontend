const ACCEPTED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const AVATAR_IMAGE_RULES = {
  minDimension: 256,
  maxInputDimension: 2048,
  outputDimension: 512,
  maxBytes: 1024 * 1024,
  webpQuality: 0.83,
} as const;

function canvasToWebp(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("Trình duyệt không thể chuyển ảnh sang WebP."));
      },
      "image/webp",
      AVATAR_IMAGE_RULES.webpQuality,
    );
  });
}

export async function prepareAvatarImage(source: File): Promise<File> {
  if (!ACCEPTED_AVATAR_TYPES.has(source.type.toLowerCase())) {
    throw new Error("Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP.");
  }
  if (source.size > AVATAR_IMAGE_RULES.maxBytes) {
    throw new Error("Ảnh đầu vào không được vượt quá 1 MB.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(source, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Không thể đọc file ảnh này. Vui lòng chọn ảnh khác.");
  }

  try {
    const { width, height } = bitmap;
    if (width !== height) {
      throw new Error("Ảnh đại diện bắt buộc phải có tỷ lệ vuông 1:1.");
    }
    if (
      width < AVATAR_IMAGE_RULES.minDimension ||
      height < AVATAR_IMAGE_RULES.minDimension
    ) {
      throw new Error("Ảnh đại diện phải có kích thước tối thiểu 256 × 256 px.");
    }
    if (
      width > AVATAR_IMAGE_RULES.maxInputDimension ||
      height > AVATAR_IMAGE_RULES.maxInputDimension
    ) {
      throw new Error("Ảnh đầu vào không được vượt quá 2048 × 2048 px.");
    }

    const canvas = document.createElement("canvas");
    canvas.width = AVATAR_IMAGE_RULES.outputDimension;
    canvas.height = AVATAR_IMAGE_RULES.outputDimension;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      throw new Error("Trình duyệt không hỗ trợ xử lý ảnh đại diện.");
    }
    context.drawImage(
      bitmap,
      0,
      0,
      AVATAR_IMAGE_RULES.outputDimension,
      AVATAR_IMAGE_RULES.outputDimension,
    );

    // Vẽ lại qua canvas vừa chuẩn hóa kích thước, vừa loại bỏ EXIF/XMP.
    const webp = await canvasToWebp(canvas);
    if (webp.size > AVATAR_IMAGE_RULES.maxBytes) {
      throw new Error("Ảnh WebP sau xử lý vẫn vượt quá giới hạn 1 MB.");
    }
    return new File([webp], `avatar-${Date.now()}.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}
