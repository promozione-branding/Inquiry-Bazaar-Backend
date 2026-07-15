import { removeBackground } from "@imgly/background-removal-node";

export const removeBgImage = async (req, res) => {
  try {
    let buffer;
    
    // 1. Check if uploaded via binary file (FormData)
    if (req.file) {
      buffer = req.file.buffer;
    } 
    // 2. Check if uploaded via Base64 JSON body
    else if (req.body && req.body.image) {
      buffer = Buffer.from(req.body.image, 'base64');
    }

    if (!buffer) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Convert buffer to a Blob for processing
    const inputForImgly = new Blob([buffer], { type: 'image/jpeg' });

    // 3. Process background removal (Using 'small' model to save RAM)
    const config = { model: 'small' };
    const transparentBlob = await removeBackground(inputForImgly, config);
    const arrayBuffer = await transparentBlob.arrayBuffer();
    const outputBuffer = Buffer.from(arrayBuffer);

    // 4. Convert output to base64 string for the response
    const base64Image = outputBuffer.toString('base64');
    return res.json({
      success: true,
      mimeType: 'image/png',
      base64: base64Image
    });
  } catch (error) {
    console.error("[BG Error]", error);
    return res.status(500).json({ error: 'Background removal failed' });
  }
};
