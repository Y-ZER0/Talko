export function FormActions({
  onCancel,
  isPending,
}: {
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2.5 rounded-full text-sm font-medium text-text-muted hover:bg-surface-muted transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-2.5 rounded-full bg-primary-500 text-text-inverse font-semibold text-sm hover:bg-primary-600 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Creating..." : "Start"}
      </button>
    </div>
  );
}
