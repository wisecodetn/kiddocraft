"use client";

import { useActionState } from "react";
import { FormMessage, SubmitButton, inputClass } from "@/components/admin/ui";
import { updateOrderStatus } from "../actions";

const OPTIONS = [
  ["PENDING", "En attente"],
  ["CONFIRMED", "Confirmée (client appelé)"],
  ["SHIPPED", "Expédiée"],
  ["DELIVERED", "Livrée et payée"],
  ["CANCELLED", "Annulée (remet en stock)"],
] as const;

export function StatusForm({ orderId, status }: { orderId: string; status: string }) {
  const [state, action] = useActionState(updateOrderStatus.bind(null, orderId), undefined);
  return (
    <form action={action} className="mt-4 space-y-3">
      <select name="status" defaultValue={status} className={inputClass}>
        {OPTIONS.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <FormMessage state={state} />
      <SubmitButton className="w-full">Mettre à jour</SubmitButton>
    </form>
  );
}
