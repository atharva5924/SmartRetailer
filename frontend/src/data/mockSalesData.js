export const generateMockData = (page, pageSize = 15) => {
  const records = [];
  const startIndex = (page - 1) * pageSize;

  // Generate realistic varied mock data
  const names = [
    "Neha Yadav",
    "Rahul Sharma",
    "Priya Singh",
    "Amit Patel",
    "Sneha Gupta",
    "Vikram Desai",
    "Riya Mehta",
  ];
  const regions = ["North", "South", "East", "West"];
  const categories = ["Clothing", "Electronics", "Food", "Home"];
  const phones = [
    "+91 9123456789",
    "+91 9876543210",
    "+91 8765432109",
    "+91 7654321098",
  ];

  for (let i = 0; i < pageSize; i++) {
    const index = (startIndex + i) % names.length;
    records.push({
      transactionId: `TXN${String(1000000 + startIndex + i).padStart(7, "0")}`,
      date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      customerId: `CUST${String(10000 + index).padStart(5, "0")}`,
      customerName: names[index],
      phone: phones[Math.floor(Math.random() * phones.length)],
      gender: Math.random() > 0.5 ? "Male" : "Female",
      age: 18 + Math.floor(Math.random() * 50),
      productCategory:
        categories[Math.floor(Math.random() * categories.length)],
      quantity: 1 + Math.floor(Math.random() * 5),
    });
  }

  return records;
};

export const mockMetrics = {
  totalUnits: 47,
  totalAmount: 89000,
  totalAmountSRs: 19,
  totalDiscount: 15000,
  totalDiscountSRs: 45,
};

export const totalPages = 6;
