export function Flash({ message }: { message: { type: "ok" | "err"; text: string } | null }) {
  if (!message) return null;
  return (
    <div
      className={`mb-4 border px-3 py-2 text-sm ${
        message.type === "ok" ? "border-green-300 bg-green-50 text-green-800" : "border-red-300 bg-red-50 text-red-800"
      }`}
    >
      {message.text}
    </div>
  );
}
