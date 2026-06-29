"use client";

import { deleteProduct } from "@/lib/admin-actions";

export function DeleteProductButton({ id }: { id: string }) {
  return (
    <form
      action={deleteProduct}
      onSubmit={(e) => {
        if (!confirm("Delete this product permanently? This cannot be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="font-body rounded-full border border-red-300/40 px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-red-300/70 transition-colors hover:border-red-300 hover:text-red-300"
      >
        Delete Product
      </button>
    </form>
  );
}
