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
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header-cell">Transaction ID</th>
              <th className="table-header-cell">Date</th>
              <th className="table-header-cell">Customer ID</th>
              <th className="table-header-cell">Customer Name</th>
              <th className="table-header-cell">Phone</th>
              <th className="table-header-cell">Gender</th>
              <th className="table-header-cell">Age</th>
              <th className="table-header-cell">Product Category</th>
              <th className="table-header-cell">Quantity</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
