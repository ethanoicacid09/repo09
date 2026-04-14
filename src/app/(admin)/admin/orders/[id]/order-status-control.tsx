"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateOrderStatus } from "../actions";

const statuses = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

interface OrderStatusControlProps {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusControl({
  orderId,
  currentStatus,
}: OrderStatusControlProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (newStatus: string | null) => {
    if (!newStatus || newStatus === currentStatus) return;
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Order status updated");
        router.refresh();
      }
    });
  };

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <h3 className="text-sm font-semibold">Update Status</h3>
      <div className="flex gap-2">
        <Select defaultValue={currentStatus} onValueChange={handleChange}>
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isPending && <Loader2 className="h-4 w-4 animate-spin mt-2.5" />}
      </div>
    </div>
  );
}
