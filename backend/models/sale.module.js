import mongoose, { Schema } from "mongoose";

const saleSchema = new Schema({
 
  date: String,
  customerId: String,
  customerName: String,
  phoneNumber: String,
  gender: String,
  age: Number,
  customerRegion: String,
  customerType: String,

  productId: String,
  productName: String,
  brand: String,
  productCategory: String,
  tags: String,

  quantity: Number,
  pricePerUnit: Number,
  discountPercentage: Number,
  totalAmount: Number,
  finalAmount: Number,

  paymentMethod: String,
  orderStatus: String,
  deliveryType: String,
  storeId: String,
  storeLocation: String,
  salespersonId: String,
  employeeName: String,
});

saleSchema.index({ customerName: "text", phoneNumber: "text" });
saleSchema.index({ date: -1 });
saleSchema.index({ customerRegion: 1 });
saleSchema.index({ gender: 1 });
saleSchema.index({ age: 1 });
saleSchema.index({ productCategory: 1 });
saleSchema.index({ paymentMethod: 1 });

export default mongoose.model("Sale", saleSchema);
