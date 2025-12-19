# Sử dụng node phiên bản mới nhất
FROM node:20

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy các file package để cài thư viện
COPY package*.json ./

# Cài đặt thư viện
RUN npm install

# Copy toàn bộ code vào container
COPY . .

# Mở cổng 3001
EXPOSE 3001

# Lệnh chạy ứng dụng
CMD ["node", "index.js"]