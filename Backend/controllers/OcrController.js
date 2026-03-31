const Tesseract = require("tesseract.js");
const axios = require("axios");
const sharp = require("sharp");

const scanBill = async (req, res) => {
  try {
    const imagePath = req.file.path;

    // Preprocessing (keep what worked for you)
    const processedBuffer = await sharp(imagePath)
      .resize({ width: 1500 })
      .grayscale()
      .normalize()
      .sharpen({ sigma: 1.2 })
      .toBuffer();

    const result = await Tesseract.recognize(processedBuffer, "eng", {
      logger: (m) =>{},
      tessedit_pageseg_mode: "4",
      tessedit_ocr_engine_mode: "1",
    });

    const rawText = result.data.text.trim();
  

    const lines = rawText.split("\n").map(line => line.trim()).filter(line => line.length > 4);

    // Improved regex to extract item + price from each line
    const priceRegex = /.*?([A-Za-z\s&\-]+?)\s*[-:Z₹$]*\s*(\d+[.,]?\d*)/i;

    const parsedItems = [];

    for (const line of lines) {
      // Skip obvious total/tax/thank you lines
      if (/subtotal|total|tax|thank|cashier|time|date/i.test(line)) continue;

      const match = line.match(priceRegex);

      if (match) {
        let itemName = match[1].trim()
          .replace(/^[-=:&•\s]+/, "")   // remove leading junk
          .trim();

        let priceStr = match[2].replace(/,/g, ""); // remove comma if any
        const price = parseFloat(priceStr);

        if (itemName.length > 2 && !isNaN(price) && price > 0) {
          parsedItems.push({
            originalLine: line,
            item: itemName,
            price: price
          });
        }
      }
    }

    // If no items found with regex, fallback to previous logic
    if (parsedItems.length === 0) {
      console.log("Regex failed, using fallback...");
      // You can keep your previous item extraction here if needed
    }

    // Send only clean item names to ML
    const itemsForML = parsedItems.map(item => item.item);

    const aiResponse = await axios.post("http://localhost:8000/predict", {
      items: itemsForML
    });

    const categories = aiResponse.data.categories || [];

    // Final clean response
    const finalItems = parsedItems.map((parsed, index) => ({
      item: parsed.item,
      price: parsed.price,
      category: categories[index] || "Other"
    }));

    res.json({
      items: finalItems   // ← This is what you wanted
    });

  } catch (error) {
    console.error("OCR Error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { scanBill };