export function AboutPage() {
  const founders = [
    { name: "Sohail Shaikh", initial: "SS" },
    { name: "Adib Shaikh", initial: "AS" },
    { name: "Gaurav Pal", initial: "GP" },
    { name: "Ganesh Jadhav", initial: "GJ" },
  ];

  const features = [
    {
      title: "Real-Time Market Data",
      desc: "Live prices for 31+ coins refreshed every 30 seconds across Major, Altcoins, Digital Coins, and Meme Coins.",
    },
    {
      title: "AI Signal Engine",
      desc: "BUY / SELL / HOLD signals with confidence scores and AI reasoning for every coin in the market.",
    },
    {
      title: "Live Candlestick Charts",
      desc: "Green/red OHLC candles streaming in real-time, just like professional exchange platforms.",
    },
    {
      title: "Portfolio & Wallet",
      desc: "Track your positions, P&L, allocation, and demo wallet balance all in one place.",
    },
    {
      title: "Options & Intraday",
      desc: "Full options chain with Greeks, and a live 1-minute intraday candle chart updating every 3 seconds.",
    },
    {
      title: "Smart Notifications",
      desc: "Bell alerts for coins moving 2%+ and instant BUY/SELL toast notifications when signals change.",
    },
  ];

  return (
    <div
      className="h-full overflow-y-auto"
      data-ocid="about.page"
      style={{ background: "oklch(0.10 0.005 240)" }}
    >
      <div className="max-w-3xl mx-auto px-4 py-10 pb-24 md:pb-10">
        {/* Hero */}
        <div className="flex flex-col items-center text-center mb-12">
          <img
            src="/assets/generated/crypto-vision-ai-logo.svg"
            alt="Crypto Vision AI"
            className="w-24 h-24 mb-5"
            style={{
              filter: "drop-shadow(0 0 28px oklch(0.78 0.18 174 / 0.55))",
            }}
          />
          <h1
            className="text-4xl font-bold tracking-tight mb-2"
            style={{ color: "oklch(0.92 0.008 220)" }}
          >
            Crypto Vision{" "}
            <span style={{ color: "oklch(0.82 0.16 88)" }}>AI</span>
          </h1>
          <p
            className="text-sm font-mono max-w-md"
            style={{ color: "oklch(0.55 0.015 225)" }}
          >
            AI-Powered Crypto Market Intelligence — real-time signals, live
            charts, and smart analysis to help you trade smarter.
          </p>
        </div>

        {/* Features */}
        <section className="mb-12" data-ocid="about.features.section">
          <h2
            className="text-xs font-mono font-semibold uppercase tracking-widest mb-5 text-center"
            style={{ color: "oklch(0.78 0.18 174)" }}
          >
            What This App Does
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="rounded-xl px-4 py-3"
                data-ocid={`about.feature.card.${i + 1}`}
                style={{
                  background: "oklch(0.13 0.010 240)",
                  border: "1px solid oklch(0.22 0.012 240)",
                }}
              >
                <div
                  className="text-sm font-semibold mb-1"
                  style={{ color: "oklch(0.88 0.008 220)" }}
                >
                  {f.title}
                </div>
                <div
                  className="text-xs font-mono leading-relaxed"
                  style={{ color: "oklch(0.55 0.015 225)" }}
                >
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Founders */}
        <section className="mb-12" data-ocid="about.founders.section">
          <h2
            className="text-xs font-mono font-semibold uppercase tracking-widest mb-2 text-center"
            style={{ color: "oklch(0.78 0.18 174)" }}
          >
            Meet the Founders
          </h2>
          <p
            className="text-xs font-mono text-center mb-5"
            style={{ color: "oklch(0.50 0.010 225)" }}
          >
            Students of Artificial Intelligence &amp; Data Science (AI&amp;DS) ·
            2nd Year
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {founders.map((f, i) => (
              <div
                key={f.name}
                className="flex items-center gap-4 rounded-2xl px-5 py-4"
                data-ocid={`about.founder.card.${i + 1}`}
                style={{
                  background: "oklch(0.13 0.010 240)",
                  border: "1px solid oklch(0.22 0.012 240)",
                  boxShadow: "0 4px 20px oklch(0 0 0 / 0.25)",
                }}
              >
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
        </section>

        {/* Project Attribution */}
        <section data-ocid="about.attribution.section">
          <div
            className="rounded-2xl px-6 py-6 text-center"
            style={{
              background: "oklch(0.13 0.010 240)",
              border: "1px solid oklch(0.28 0.018 200)",
              boxShadow:
                "0 0 40px oklch(0.78 0.18 174 / 0.06), 0 4px 20px oklch(0 0 0 / 0.3)",
            }}
          >
            <div
              className="text-[10px] font-mono font-semibold uppercase tracking-widest mb-3"
              style={{ color: "oklch(0.78 0.18 174)" }}
            >
              Project Attribution
            </div>
            <p
              className="text-sm font-semibold mb-1"
              style={{ color: "oklch(0.88 0.008 220)" }}
            >
              Made in New Horizon Institute of Technology &amp; Management
            </p>
            <p
              className="text-xs font-mono"
              style={{ color: "oklch(0.60 0.012 225)" }}
            >
              Under the Guidance of{" "}
              <span style={{ color: "oklch(0.82 0.16 88)" }}>
                Dr. Megha Gupta
              </span>
            </p>
            <div
              className="mt-4 pt-4"
              style={{ borderTop: "1px solid oklch(0.22 0.010 240)" }}
            >
              <p
                className="text-[11px] font-mono"
                style={{ color: "oklch(0.50 0.010 225)" }}
              >
                AI &amp; Data Science Department · 2nd Year
              </p>
              <p
                className="text-[10px] font-mono mt-1"
                style={{ color: "oklch(0.42 0.008 225)" }}
              >
                Built with passion for crypto &amp; machine intelligence
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

