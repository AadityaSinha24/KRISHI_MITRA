const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "back", "0", "ok"];

export default function Numpad({ onDigit, onBack, onSubmit, disabled }) {
  const handle = (k) => {
    if (k === "back") return onBack();
    if (k === "ok") return onSubmit();
    onDigit(k);
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {keys.map((k) => (
        <button
          key={k}
          disabled={disabled}
          onClick={() => handle(k)}
          className={`h-16 rounded-xl text-2xl font-semibold shadow disabled:opacity-50 ${
            k === "ok"
              ? "bg-green-600 text-white hover:bg-green-700"
              : k === "back"
              ? "bg-gray-200 hover:bg-gray-300"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          {k === "back" ? "⌫" : k === "ok" ? "✓" : k}
        </button>
      ))}
    </div>
  );
}