import Tesseract from "tesseract.js";

export async function ocrImageToText(file: File): Promise<string> {
  const imageUrl = URL.createObjectURL(file);
  try {
    const { data } = await Tesseract.recognize(imageUrl, 'eng', {
      tessedit_char_whitelist: undefined,
    });
    return (data.text || '').trim();
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}


