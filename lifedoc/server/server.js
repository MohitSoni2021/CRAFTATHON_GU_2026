const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const measurementRoutes = require("./routes/measurements");
const diaryRoutes = require("./routes/diary");
const labReportRoutes = require("./routes/labReports");
const doctorReportRoutes = require("./routes/doctorReports");
const aiRoutes = require("./routes/ai");
const newsRoutes = require("./routes/news");
const appointmentRoutes = require("./routes/appointments");
const referenceRoutes = require("./routes/reference");
const familyRoutes = require("./routes/family");
const savedPostRoutes = require("./routes/savedPosts");
const shareRoutes = require("./routes/share");
const { startCronJob } = require("./jobs/newsFetcher");
const compression = require("compression");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();
dotenv.config();

// Start background jobs
if (process.env.NODE_ENV !== 'test') {
  startCronJob();
}

// Increase payload limit to 50mb
// Increase payload limit to 50mb and preserve raw body for Stripe
app.use(express.json({
  limit: '50mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(compression()); // Enable Gzip/Brotli compression

// Connect to MongoDB
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/lifedoc")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Could not connect to MongoDB", err));
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/measurements", measurementRoutes);
app.use("/api/diary", diaryRoutes);
app.use("/api/lab-reports", labReportRoutes);
app.use("/api/doctor-reports", doctorReportRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/upload", require("./routes/upload"));


app.use("/api/appointments", appointmentRoutes);
app.use("/api/reference", referenceRoutes);
app.use("/api/family", familyRoutes);
app.use("/api/saved-posts", savedPostRoutes);
app.use("/api/share", shareRoutes);
app.use("/api/admin", require("./routes/adminRoutes"));
console.log("Loading SOS Routes...");
app.use("/api/sos", require("./routes/sos")); // <--- SOS Feature
app.use("/api/doctor-verification", require("./routes/doctorVerification"));
app.use("/api/consultation", require("./routes/consultation"));
app.use("/api/consultation", require("./routes/consultation"));
app.use("/api/meetings", require("./routes/meetings"));
app.use("/api/doctors", require("./routes/doctors"));
app.use("/api/subscription", require("./routes/subscription"));






// 404 Handler - If no route matched
app.use((req, res, next) => {
  console.log(`[DEBUG] 404 - Route Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ message: "Route not found", path: req.url, method: req.method });
});

// Global Error Handler
app.use(errorMiddleware);

const PORT = process.env.SERVER_PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`The server is running on http://localhost:${PORT}`);
    console.log(`Routes registered: /api/doctor-reports, /api/upload, etc.`);
  });
}

module.exports = app;