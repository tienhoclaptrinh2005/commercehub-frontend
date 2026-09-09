export const PRODUCT_IMAGE_WIDTH = 1200;
export const PRODUCT_IMAGE_HEIGHT = 900;
export const PRODUCT_IMAGE_MIN_CROP_WIDTH = 800;
export const PRODUCT_IMAGE_MIN_CROP_HEIGHT = 600;
export const PRODUCT_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

const PRODUCT_IMAGE_TARGET_BYTES = 700 * 1024;
const MAX_DECODED_PIXELS = 40_000_000;
const SOURCE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const WEBP_QUALITIES = [0.84, 0.8, 0.76, 0.72, 0.68];

export class ProductImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductImageValidationError";
  }
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

function getCenteredFourByThreeCrop(width: number, height: number): CropArea {
  const targetRatio = PRODUCT_IMAGE_WIDTH / PRODUCT_IMAGE_HEIGHT;
  const sourceRatio = width / height;

  if (sourceRatio > targetRatio) {
    const cropWidth = height * targetRatio;
    return { x: (width - cropWidth) / 2, y: 0, width: cropWidth, height };
  }

  const cropHeight = width / targetRatio;
  return { x: 0, y: (height - cropHeight) / 2, width, height: cropHeight };
}

function loadImage(sourceUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new ProductImageValidationError("Không thể đọc nội dung ảnh đã chọn."));
    image.src = sourceUrl;
  });
}

function encodeWebp(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob || blob.type !== "image/webp") {
        reject(new ProductImageValidationError(
          "Trình duyệt này không hỗ trợ chuyển ảnh sang WebP. Vui lòng cập nhật trình duyệt.",
        ));
        return;
      }
      resolve(blob);
    }, "image/webp", quality);
  });
}

function normalizedFileName(originalName: string) {
  const baseName = originalName
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${baseName || "product-image"}.webp`;
}

/**
 * Re-encoding through canvas strips EXIF/XMP metadata. The centered cover crop
 * also makes the stored object match every 4:3 product surface exactly.
 */
export async function normalizeProductImage(source: File): Promise<File> {
  if (!SOURCE_IMAGE_TYPES.has(source.type)) {
    throw new ProductImageValidationError("Chỉ chấp nhận ảnh nguồn JPG, PNG hoặc WebP.");
  }
  if (source.size < 1 || source.size > PRODUCT_IMAGE_MAX_BYTES) {
    throw new ProductImageValidationError("Dung lượng ảnh nguồn phải lớn hơn 0 và không vượt quá 2 MB.");
  }

  const sourceUrl = URL.createObjectURL(source);
  try {
    const image = await loadImage(sourceUrl);
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    if (!width || !height || width * height > MAX_DECODED_PIXELS) {
      throw new ProductImageValidationError("Độ phân giải ảnh không hợp lệ hoặc quá lớn để xử lý an toàn.");
    }

    const crop = getCenteredFourByThreeCrop(width, height);
    if (crop.width < PRODUCT_IMAGE_MIN_CROP_WIDTH || crop.height < PRODUCT_IMAGE_MIN_CROP_HEIGHT) {
      throw new ProductImageValidationError(
        `Vùng ảnh 4:3 phải đạt tối thiểu ${PRODUCT_IMAGE_MIN_CROP_WIDTH} × ${PRODUCT_IMAGE_MIN_CROP_HEIGHT} px.`,
      );
    }

    const canvas = document.createElement("canvas");
    canvas.width = PRODUCT_IMAGE_WIDTH;
    canvas.height = PRODUCT_IMAGE_HEIGHT;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      throw new ProductImageValidationError("Trình duyệt không thể xử lý ảnh đã chọn.");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      PRODUCT_IMAGE_WIDTH,
      PRODUCT_IMAGE_HEIGHT,
    );

    let encoded: Blob | null = null;
    for (const quality of WEBP_QUALITIES) {
      encoded = await encodeWebp(canvas, quality);
      if (encoded.size <= PRODUCT_IMAGE_TARGET_BYTES) break;
    }
    if (!encoded || encoded.size > PRODUCT_IMAGE_MAX_BYTES) {
      throw new ProductImageValidationError("Ảnh sau khi tối ưu vẫn vượt quá giới hạn 2 MB.");
    }

    return new File([encoded], normalizedFileName(source.name), {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}
