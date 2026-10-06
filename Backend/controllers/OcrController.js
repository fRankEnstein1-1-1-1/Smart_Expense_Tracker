const Tesseract = require("tesseract.js");
const axios = require("axios");
const sharp = require("sharp");

const categorizeByRule = (itemName) => {
  if (/soap|shampoo|toothpaste|face\s*wash|lotion|deodorant/i.test(itemName)) {
    return "Personal Care";
  }
  if (/shirt|jeans|trouser|dress|jacket|saree|kurta/i.test(itemName)) {
    return "Clothing";
  }
  return null;
};

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

    const worker = await Tesseract.createWorker("eng");
    await worker.setParameters({ tessedit_pageseg_mode: "6", preserve_interword_spaces: "1" });
    const result = await worker.recognize(processedBuffer);
    await worker.terminate();

    const rawText = result.data.text.trim();
    console.log("=== RAW OCR OUTPUT START ===");
    console.log(rawText);
    console.log("=== RAW OCR OUTPUT END ===");

    const lines = rawText.split("\n").map(line => line.trim()).filter(line => line.length > 2);

    let startIndex = 0;
    const headerIndex = lines.findIndex(line => /item\s*name|description/i.test(line));
    if (headerIndex !== -1) {
      startIndex = headerIndex + 1;
    }

    let endIndex = lines.length;
    for (let i = startIndex; i < lines.length; i++) {
      if (/sub\s*total|grand\s*total|susto\s*tal|\btotal\b/i.test(lines[i])) {
        endIndex = i;
        break;
      }
    }

    const candidateLines = lines.slice(startIndex, endIndex);
    const parsedItems = [];

    for (const line of candidateLines) {
      if (/sub\s*total|grand\s*total|susto\s*tal|\btotal\b|cash\b|change\b/i.test(line)) continue;

      // every decimal amount on the line; the LAST one is the Amount column
      const nums = [...line.matchAll(/\d[\d,]*\.\d{2}/g)];
      if (nums.length === 0) continue;

      const price = parseFloat(nums[nums.length - 1][0].replace(/,/g, ""));
      if (isNaN(price) || price <= 0) continue;

      // name = everything before the FIRST decimal (Price column)
      let itemPart = line.slice(0, nums[0].index);
      itemPart = itemPart
        .replace(/^[^A-Za-z0-9]+/, "")            // leading junk like ":" or "|"
        .replace(/^\d{1,3}[\s.)\-:]+/, "");       // Sr number
      if (nums.length >= 2) {
        itemPart = itemPart.replace(/\s+[\dIil|]{1,3}\s*$/, ""); // Qty column (1, i, l, I)
      }
      itemPart = itemPart.trim();
      if (itemPart.length < 2) continue;

      parsedItems.push({ originalLine: line, item: itemPart, price });
    }

    // Extract totals from raw text
    const subTotalMatch = rawText.match(/sub\s*total[^\d\n]*?([\d,]+\.\d{2})/i) ||
      rawText.match(/sub\s*total\D{0,8}([\d,]+\.\d{2})/i) ||
      rawText.match(/susto\s*tal[^\d\n]*?([\d,]+\.\d{2})/i);
    const subTotal = subTotalMatch ? parseFloat(subTotalMatch[1].replace(/,/g, "")) : null;

    const grandTotalMatch = rawText.match(/grand\s*total[^\d\n]*?([\d,]+\.\d{2})/i) ||
      rawText.match(/grand\s*total\D{0,8}([\d,]+\.\d{2})/i) ||
      rawText.match(/(?:^|\n)[^\w\n]*total[^\d\n]*?([\d,]+\.\d{2})/i);
    const grandTotal = grandTotalMatch ? parseFloat(grandTotalMatch[1].replace(/,/g, "")) : null;

    // Categorization: ML model with keyword rules fallback
    const mlApiUrl = process.env.ML_API_URL || "http://localhost:8000";
    let categories = [];

    try {
      const itemsForML = parsedItems.map(item => item.item);
      if (itemsForML.length > 0) {
        const aiResponse = await axios.post(
          `${mlApiUrl}/predict`,
          { items: itemsForML },
          { timeout: 30000 }
        );
        categories = aiResponse.data.categories || [];
      }
    } catch (mlError) {
      console.warn("ML Service error / timeout, falling back to rule-based categorization:", mlError.message);
    }

    const finalItems = parsedItems.map((parsed, index) => {
      const ruleCategory = categorizeByRule(parsed.item);
      const mlCategory = categories[index];
      const category = ruleCategory || mlCategory || "Miscellaneous";
      return {
        item: parsed.item,
        price: parsed.price,
        category: category
      };
    });

    res.json({
      items: finalItems,
      subTotal,
      grandTotal,
      extractedText: rawText
    });

  } catch (error) {
    console.error("OCR Error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { scanBill };