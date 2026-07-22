"use client";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];

export default function Keypad({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  function press(key: string) {
    if (key === "⌫") {
      onChange(value.slice(0, -1));
      return;
    }
    if (key === "." && value.includes(".")) return;
    if (value.length >= 8) return;
    onChange(value === "0" && key !== "." ? key : value + key);
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => press(key)}
          className="btn-touch rounded-xl bg-gray-100 text-2xl font-semibold text-gray-800 active:bg-gray-200"
        >
          {key}
        </button>
      ))}
    </div>
  );
}
