import { useState } from "react";

/**
 * CoinLogo — displays official coin logo from CryptoIcons CDN
 * Falls back to a colored circle with symbol text if image fails to load.
 *
 * CDN used: https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/svg/color/<symbol>.svg
 * This is the same source referenced by Binance/CoinDCX style apps.
 *
 * Symbol map handles non-standard tickers (e.g. MATIC -> matic, SHIB -> shib)
 */

const SYMBOL_OVERRIDES: Record<string, string> = {
  MATIC: "matic",
  AVAX: "avax",
  DOGE: "doge",
  SHIB: "shib",
  PEPE: "pepe",
  FLOKI: "floki",
  BONK: "bonk",
  NEAR: "near",
  ATOM: "atom",
  LINK: "link",
  USDT: "usdt",
  USDC: "usdc",
  DAI: "dai",
  TUSD: "tusd",
  UNI: "uni",
  APT: "apt",
  ARB: "arb",
  OP: "op",
  SUI: "sui",
  INJ: "inj",
  WIF: "wif",
};

function getCdnUrl(symbol: string): string {
  const key = SYMBOL_OVERRIDES[symbol] ?? symbol.toLowerCase();
  return `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/svg/color/${key}.svg`;
}

interface CoinLogoProps {
  symbol: string;
  color: string;
  size?: number; // px, defaults to 28
  className?: string;
}

export function CoinLogo({
  symbol,
  color,
  size = 28,
  className = "",
}: CoinLogoProps) {
  const [failed, setFailed] = useState(false);

  const sizeClass = "shrink-0 rounded-full overflow-hidden";
  const style = { width: size, height: size };

  if (!failed) {
    return (
      <div
        className={`${sizeClass} ${className} flex items-center justify-center`}
        style={{
          ...style,
          background: `${color}18`,
          border: `1.5px solid ${color}40`,
        }}
      >
        <img
          src={getCdnUrl(symbol)}
          alt={symbol}
          width={size - 4}
          height={size - 4}
          onError={() => setFailed(true)}
          style={{ width: size - 4, height: size - 4, objectFit: "contain" }}
          draggable={false}
        />
      </div>
    );
  }

  // Fallback: colored circle with 2-letter abbreviation
  const fontSize = Math.max(8, Math.round(size * 0.35));
  return (
    <div
      className={`${sizeClass} ${className} flex items-center justify-center font-bold font-mono`}
      style={{
        ...style,
        background: `${color}25`,
        border: `1.5px solid ${color}50`,
        color,
        fontSize,
      }}
    >
      {symbol.slice(0, 2)}
    </div>
  );
}
