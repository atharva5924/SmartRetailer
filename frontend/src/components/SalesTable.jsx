import { Copy } from "lucide-react";
import { toast } from "sonner";

export function SalesTable({ data, loading = false }) {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Phone number copied to clipboard");
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-muted/50" />
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-14 border-t border-border bg-muted/20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full mim-w-[1200px]">
          <thead>
            <tr>
              <th className="table-header-cell min-w-[150px]">Transaction ID</th>
              <th className="table-header-cell min-w-[100px]">Date</th>
              <th className="table-header-cell min-w-[150px]">Customer ID</th>
              <th className="table-header-cell min-w-[150px]">Customer Name</th>
              <th className="table-header-cell min-w-[190px]">Phone</th>
              <th className="table-header-cell min-w-[120px]">Gender</th>
              <th className="table-header-cell min-w-[50px]">Age</th>
              <th className="table-header-cell min-w-[160px]">Product Category</th>
              <th className="table-header-cell min-w-[120px]">Quantity</th>
              <th className="table-header-cell min-w-[150px]">Total Amount</th>
              <th className="table-header-cell min-w-[120px]">Customer Region</th>
              <th className="table-header-cell min-w-[120px]">Product ID</th>
              <th className="table-header-cell min-w-[120px]">Employee Name</th>
            </tr>
          </thead>
          <tbody>
            {data.map((record, index) => (
              <tr
                key={`${record.transactionId}-${index}`}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="table-cell font-medium">
                  {record.transactionId}
                </td>
                <td className="table-cell">{record.date}</td>
                <td className="table-cell font-semibold">
                  {record.customerId}
                </td>
                <td className="table-cell">{record.customerName}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <span>{"+91-" + record.phoneNumber}</span>
                    <button
                      onClick={() => copyToClipboard(record.phoneNumber)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
                <td className="table-cell">{record.gender}</td>
                <td className="table-cell">{record.age}</td>
                <td className="table-cell font-medium">
                  {record.productCategory}
                </td>
                <td className="table-cell text-center">
                  {String(record.quantity).padStart(2, "0")}
                </td>
                <td className="table-cell">₹{record.totalAmount}</td>
                <td className="table-cell">{record.customerRegion}</td>
                <td className="table-cell font-medium">{record.productId}</td>
                <td className="table-cell">{record.employeeName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
