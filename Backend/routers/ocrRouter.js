const express = require("express")
const router = express.Router()
const {scanBill} = require("../controllers/OcrController")
const upload = require("../middlewares/multer")
router.post("/scan",upload.single("bill"),scanBill)

module.exports = router