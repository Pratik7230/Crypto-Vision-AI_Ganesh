export function FoundersPage() {
  const founders = [
    { name: "Sohail Shaikh", initial: "SS" },
    { name: "Adib Shaikh", initial: "AS" },
    { name: "Gaurav Pal", initial: "GP" },
    { name: "Ganesh Jadhav", initial: "GJ" },
  ];

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ background: "oklch(0.10 0.005 240)" }}
    >
      <div className="flex flex-col items-center justify-center min-h-full px-4 py-12 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-12">
        {/* App Logo + Name */}
        <div className="flex flex-col items-center mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/generated/crypto-vision-ai-logo.svg"
            alt="Crypto Vision AI"
            className="w-28 h-28 mb-4 drop-shadow-2xl"
            style={{
              filter: "drop-shadow(0 0 24px oklch(0.78 0.18 174 / 0.5))",
            }}
          />
          <h1
            className="text-3xl font-bold tracking-tight font-display"
            style={{ color: "oklch(0.92 0.008 220)" }}
          >
            Crypto Vision{" "}
            <span style={{ color: "oklch(0.82 0.16 88)" }}>AI</span>
          </h1>
          <p
            className="text-sm font-mono mt-1"
            style={{ color: "oklch(0.55 0.015 225)" }}
          >
            AI-Powered Crypto Market Intelligence
          </p>
        </div>

        {/* Section heading */}
        <div className="mb-6 text-center">
          <h2
            className="text-xs font-mono font-semibold uppercase tracking-widest mb-1"
            style={{ color: "oklch(0.78 0.18 174)" }}
          >
            Meet the Founders
          </h2>
          <p
            className="text-xs font-mono"
            style={{ color: "oklch(0.50 0.010 225)" }}
          >
            Students of Artificial Intelligence &amp; Data Science (AI&amp;DS) ·
            2nd Year
          </p>
        </div>

        {/* Founders grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
          {founders.map((f, i) => (
            <div
              key={f.name}
              className="flex items-center gap-4 rounded-2xl px-5 py-4"
              style={{
                background: "oklch(0.13 0.010 240)",
                border: "1px solid oklch(0.22 0.012 240)",
                boxShadow: "0 4px 24px oklch(0 0 0 / 0.3)",
              }}
            >
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{
                  background: "oklch(0.78 0.18 174 / 0.15)",
                  border: "2px solid oklch(0.78 0.18 174 / 0.4)",
                  color: "oklch(0.78 0.18 174)",
                }}
              >
                {f.initial}
              </div>
              {/* Info */}
              <div>
                <div
                  className="font-semibold text-sm"
                  style={{ color: "oklch(0.90 0.008 220)" }}
                >
                  {f.name}
                </div>
                <div
                  className="text-[11px] font-mono mt-0.5"
                  style={{ color: "oklch(0.55 0.015 225)" }}
                >
                  Co-Founder · #{i + 1}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom badge */}
        <div
          className="mt-10 px-5 py-3 rounded-xl text-center"
          style={{
            background: "oklch(0.13 0.010 240)",
            border: "1px solid oklch(0.22 0.012 240)",
          }}
        >
          <p
            className="text-xs font-mono"
            style={{ color: "oklch(0.70 0.015 200)" }}
          >
            AI &amp; Data Science Department · 2nd Year
          </p>
          <p
            className="text-[11px] font-mono mt-0.5"
            style={{ color: "oklch(0.50 0.010 225)" }}
          >
            Built with passion for crypto &amp; machine intelligence
          </p>
        </div>
      </div>
    </div>
  );
}

export default FoundersPage;

