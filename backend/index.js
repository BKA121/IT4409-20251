require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
// Middleware
app.use(cors());
app.use(express.json());
// Kết nối MongoDB với username là MSSV, password là MSSV, dbname là it4409
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Error:", err));

// Schema User
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number },

    email: { 
      type: String, 
      required: true, 
      unique: true,       
      trim: true,         
      lowercase: true     
    },

    address: { type: String, trim: true },
  },
  { timestamps: true }
);


const User = mongoose.model("User", UserSchema);

// Start server
const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// 1.3. Implement GET với Pagination + Search
// Format: GET /api/users?page=1&limit=5&search=nguyen
// Gợi ý:
app.get("/api/users", async (req, res) => {
  try {
    // Lấy query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    // Tạo query filter cho search
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { address: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Tính skip
    const skip = (page - 1) * limit;
    // Query database
    const users = await User.find(filter).skip(skip).limit(limit);
    // Đếm tổng số documents
    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    // Trả về response
    res.json({
      page,
      limit,
      total,
      totalPages,
      data: users,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Giải thích:
// • $or: Tìm trong nhiều field
// • $regex: Pattern matching
// • $options: "i": Không phân biệt hoa thường
// • skip(): Bỏ qua N documents đầu
// • limit(): Chỉ lấy M documents

// 1.5. Implement PUT
// Format: PUT /api/users/:id
// Content-Type: application/json
// Gợi ý:
app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, email, address } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, age, email, address },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }
    res.json({
      message: "Cập nhật người dùng thành công",
      data: updatedUser,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 1.4. Implement POST
// Format: POST /api/users
// Content-Type: application/json
// Gợi ý:
app.post("/api/users", async (req, res) => {
  try {
    let { name, age, email, address } = req.body;

    email = email.trim().toLowerCase();

    const newUser = await User.create({ name, age, email, address });
    res.status(201).json({
      message: "Tạo người dùng thành công",
      data: newUser,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email đã tồn tại" });
    }
    res.status(400).json({ error: err.message });
  }
});


// 1.6. Implement DELETE
// Format: DELETE /api/users/:id
// Gợi ý:
app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }
    res.json({ message: "Xóa người dùng thành công" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});