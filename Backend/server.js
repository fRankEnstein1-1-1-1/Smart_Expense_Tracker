const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv")
const connectDB = require("./db/connection")
const authroutes = require("./routers/authRouter")
const expenseroutes = require("./routers/expenseRouter")
const ocrRoutes = require("./routers/ocrRouter")
dotenv.config();

const app = express()
app.use(express.json());

connectDB()//calling mongo

app.use(cors());
app.use("/api/auth",authroutes)//testing done working fine
app.use("/api/expense",expenseroutes)
app.use("/api/ocr",ocrRoutes)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });