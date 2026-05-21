/* WhatsApp floating widget — fixed bottom-right on all screen sizes */
export function WhatsAppWidget() {
  const phone = "918910967001"; // 91 = India country code
  const url = `https://wa.me/${phone}?text=Hi%20Supratik%2C%20I%20found%20your%20portfolio%20and%20wanted%20to%20connect.`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Supratik on WhatsApp"
      className="fixed bottom-6 right-6 z-[9999] flex items-center justify-center"
      style={{ filter: "drop-shadow(0 4px 16px rgba(37,211,102,0.4))" }}
    >
      {/* Pulse ring */}
      <span
        className="absolute inline-flex h-14 w-14 rounded-full opacity-60"
        style={{
          background: "#25D366",
          animation: "whatsapp-ping 2s cubic-bezier(0,0,0.2,1) infinite",
        }}
      />

      {/* Main button */}
      <span
        className="relative flex h-14 w-14 items-center justify-center rounded-full transition-transform hover:scale-110"
        style={{ background: "#25D366" }}
      >
        {/* Official WhatsApp SVG icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="white"
          className="h-7 w-7"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.556 4.112 1.528 5.836L.057 23.215a.75.75 0 0 0 .923.923l5.379-1.471A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.872 9.872 0 0 1-5.031-1.375l-.36-.214-3.733 1.02 1.02-3.733-.214-.36A9.872 9.872 0 0 1 2.1 12C2.1 6.532 6.532 2.1 12 2.1S21.9 6.532 21.9 12 17.468 21.9 12 21.9z" />
        </svg>
      </span>

      {/* Tooltip */}
      <span
        className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none font-sans"
        style={{ background: "#075E54" }}
      >
        Chat on WhatsApp
      </span>

      <style>{`
        @keyframes whatsapp-ping {
          0%   { transform: scale(1);   opacity: 0.6; }
          70%  { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </a>
  );
}
