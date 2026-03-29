import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  type Candle,
  generateCandles,
  getTimeframeCount,
  getTimeframeInterval,
} from "../data/chartData";
import { formatPrice } from "../data/cryptoData";

const TIMEFRAMES = ["1m", "5m", "15m", "1H", "4H", "1D"] as const;
type Timeframe = (typeof TIMEFRAMES)[number];

const BULL_COLOR = "oklch(0.72 0.18 155)";
const BEAR_COLOR = "oklch(0.65 0.22 25)";
const BULL_HEX = "#22c55e";
const BEAR_HEX = "#ef4444";

// ─── AI Indicators ────────────────────────────────────────────────────────────

type IndicatorCategory =
  | "Trend"
  | "Momentum"
  | "Volatility"
  | "Volume"
  | "Oscillators"
  | "AI-Powered"
  | "Pattern Recognition";

interface Indicator {
  id: string;
  name: string;
  category: IndicatorCategory;
}

const CATEGORY_COLORS: Record<IndicatorCategory, string> = {
  Trend: "#3b82f6",
  Momentum: "#f97316",
  Volatility: "#a855f7",
  Volume: "#14b8a6",
  Oscillators: "#eab308",
  "AI-Powered": "#22c55e",
  "Pattern Recognition": "#ec4899",
};

const AI_INDICATORS: Indicator[] = [
  // ── Trend (30+)
  { id: "sma7", name: "SMA 7", category: "Trend" },
  { id: "sma14", name: "SMA 14", category: "Trend" },
  { id: "sma21", name: "SMA 21", category: "Trend" },
  { id: "sma50", name: "SMA 50", category: "Trend" },
  { id: "sma100", name: "SMA 100", category: "Trend" },
  { id: "sma200", name: "SMA 200", category: "Trend" },
  { id: "ema7", name: "EMA 7", category: "Trend" },
  { id: "ema14", name: "EMA 14", category: "Trend" },
  { id: "ema21", name: "EMA 21", category: "Trend" },
  { id: "ema50", name: "EMA 50", category: "Trend" },
  { id: "ema100", name: "EMA 100", category: "Trend" },
  { id: "ema200", name: "EMA 200", category: "Trend" },
  { id: "wma", name: "WMA", category: "Trend" },
  { id: "dema", name: "DEMA", category: "Trend" },
  { id: "tema", name: "TEMA", category: "Trend" },
  { id: "hma", name: "HMA", category: "Trend" },
  { id: "alma", name: "ALMA", category: "Trend" },
  { id: "kama", name: "KAMA", category: "Trend" },
  { id: "zlema", name: "ZLEMA", category: "Trend" },
  { id: "t3", name: "T3", category: "Trend" },
  { id: "bb", name: "Bollinger Bands (BB)", category: "Trend" },
  { id: "ichimoku", name: "Ichimoku Cloud", category: "Trend" },
  { id: "psar", name: "Parabolic SAR", category: "Trend" },
  { id: "vwap", name: "VWAP", category: "Trend" },
  { id: "supertrend", name: "SuperTrend", category: "Trend" },
  { id: "donchian", name: "Donchian Channels", category: "Trend" },
  { id: "linreg", name: "Linear Regression", category: "Trend" },
  { id: "pivot", name: "Pivot Points", category: "Trend" },
  { id: "mcginley", name: "McGinley Dynamic", category: "Trend" },
  { id: "elderray", name: "Elder Ray Index", category: "Trend" },
  { id: "envbands", name: "Envelope Bands", category: "Trend" },
  { id: "pricechannel", name: "Price Channel", category: "Trend" },
  // ── Momentum (30+)
  { id: "rsi14", name: "RSI 14", category: "Momentum" },
  { id: "rsi7", name: "RSI 7", category: "Momentum" },
  { id: "macd", name: "MACD", category: "Momentum" },
  { id: "macd_signal", name: "MACD Signal", category: "Momentum" },
  { id: "macd_hist", name: "MACD Histogram", category: "Momentum" },
  { id: "stoch_k", name: "Stochastic %K", category: "Momentum" },
  { id: "stoch_d", name: "Stochastic %D", category: "Momentum" },
  { id: "stoch_rsi", name: "Stochastic RSI", category: "Momentum" },
  { id: "cci", name: "CCI", category: "Momentum" },
  { id: "willr", name: "Williams %R", category: "Momentum" },
  { id: "roc", name: "ROC", category: "Momentum" },
  { id: "momentum", name: "Momentum", category: "Momentum" },
  { id: "tsi", name: "True Strength Index", category: "Momentum" },
  { id: "kst", name: "Know Sure Thing (KST)", category: "Momentum" },
  { id: "dpo", name: "DPO", category: "Momentum" },
  { id: "aroon_up", name: "Aroon Up", category: "Momentum" },
  { id: "aroon_down", name: "Aroon Down", category: "Momentum" },
  { id: "aroon_osc", name: "Aroon Oscillator", category: "Momentum" },
  { id: "ppo", name: "PPO", category: "Momentum" },
  { id: "pvo", name: "PVO", category: "Momentum" },
  { id: "coppock", name: "Coppock Curve", category: "Momentum" },
  { id: "bop", name: "Balance of Power", category: "Momentum" },
  { id: "efi", name: "Elder Force Index", category: "Momentum" },
  { id: "mass_idx", name: "Mass Index", category: "Momentum" },
  { id: "trix", name: "TRIX", category: "Momentum" },
  { id: "ult_osc", name: "Ultimate Oscillator", category: "Momentum" },
  { id: "cmo", name: "CMO", category: "Momentum" },
  { id: "fisher", name: "Fisher Transform", category: "Momentum" },
  { id: "inv_fisher", name: "Inverse Fisher Transform", category: "Momentum" },
  { id: "stc", name: "Schaff Trend Cycle", category: "Momentum" },
  { id: "dmi", name: "DMI / ADX", category: "Momentum" },
  // ── Volatility (20+)
  { id: "atr14", name: "ATR 14", category: "Volatility" },
  { id: "atr7", name: "ATR 7", category: "Volatility" },
  { id: "keltner", name: "Keltner Channel", category: "Volatility" },
  { id: "bb_bw", name: "Bollinger Bandwidth", category: "Volatility" },
  { id: "bb_pctb", name: "Bollinger %B", category: "Volatility" },
  { id: "chaikin_vol", name: "Chaikin Volatility", category: "Volatility" },
  { id: "hist_vol", name: "Historical Volatility", category: "Volatility" },
  { id: "natr", name: "Normalized ATR", category: "Volatility" },
  { id: "vix_fix", name: "VIX Fix", category: "Volatility" },
  { id: "ulcer_idx", name: "Ulcer Index", category: "Volatility" },
  { id: "std_dev", name: "Standard Deviation", category: "Volatility" },
  { id: "variance", name: "Variance", category: "Volatility" },
  { id: "chop_idx", name: "Choppiness Index", category: "Volatility" },
  { id: "rvi_vol", name: "Relative Volatility Index", category: "Volatility" },
  { id: "inertia", name: "Inertia", category: "Volatility" },
  { id: "mass_idx2", name: "Mass Index II", category: "Volatility" },
  {
    id: "bear_power",
    name: "Elder Ray Bear Power",
    category: "Volatility",
  },
  { id: "bull_power", name: "Elder Ray Bull Power", category: "Volatility" },
  { id: "vol_stop", name: "Volatility Stop", category: "Volatility" },
  { id: "vol_ratio", name: "Volatility Ratio", category: "Volatility" },
  { id: "true_range", name: "True Range", category: "Volatility" },
  // ── Volume (20+)
  { id: "obv", name: "On-Balance Volume (OBV)", category: "Volume" },
  { id: "vol_sma", name: "Volume SMA", category: "Volume" },
  { id: "vol_ema", name: "Volume EMA", category: "Volume" },
  { id: "vwap2", name: "VWAP (Volume)", category: "Volume" },
  { id: "mfi", name: "MFI", category: "Volume" },
  { id: "cmf", name: "CMF", category: "Volume" },
  { id: "chaikin_mf", name: "Chaikin Money Flow", category: "Volume" },
  { id: "acc_dist", name: "Accumulation/Distribution", category: "Volume" },
  { id: "force_idx", name: "Force Index", category: "Volume" },
  { id: "eom", name: "Ease of Movement", category: "Volume" },
  { id: "vol_rsi", name: "Volume RSI", category: "Volume" },
  { id: "vol_osc", name: "Volume Oscillator", category: "Volume" },
  { id: "pvt", name: "PVT", category: "Volume" },
  { id: "nvi", name: "NVI", category: "Volume" },
  { id: "pvi", name: "PVI", category: "Volume" },
  { id: "dema_vol", name: "DEMA Volume", category: "Volume" },
  { id: "klinger", name: "Klinger Oscillator", category: "Volume" },
  {
    id: "vol_roc",
    name: "Volume Rate of Change",
    category: "Volume",
  },
  { id: "twiggs_mf", name: "Twiggs Money Flow", category: "Volume" },
  { id: "neg_vol", name: "Negative Volume Index", category: "Volume" },
  { id: "pos_vol", name: "Positive Volume Index", category: "Volume" },
  // ── Oscillators (20+)
  { id: "ao", name: "Awesome Oscillator", category: "Oscillators" },
  { id: "demarker", name: "DeMarker", category: "Oscillators" },
  { id: "ac_osc", name: "AC Oscillator", category: "Oscillators" },
  {
    id: "stoch_mom",
    name: "Stoch Momentum Index",
    category: "Oscillators",
  },
  {
    id: "rel_vig",
    name: "Relative Vigor Index",
    category: "Oscillators",
  },
  { id: "price_osc", name: "Price Oscillator", category: "Oscillators" },
  {
    id: "dema_osc",
    name: "DEMA Oscillator",
    category: "Oscillators",
  },
  { id: "zl_macd", name: "Zero Lag MACD", category: "Oscillators" },
  {
    id: "pfe",
    name: "Polarized Fractal Efficiency",
    category: "Oscillators",
  },
  {
    id: "rec_macd",
    name: "Recursive MACD",
    category: "Oscillators",
  },
  {
    id: "decycler",
    name: "Decycler Oscillator",
    category: "Oscillators",
  },
  { id: "cyber_cycle", name: "Cyber Cycle", category: "Oscillators" },
  {
    id: "laguerre_rsi",
    name: "Laguerre RSI",
    category: "Oscillators",
  },
  {
    id: "inv_fisher_rsi",
    name: "Inverse Fisher RSI",
    category: "Oscillators",
  },
  {
    id: "cog",
    name: "Center of Gravity",
    category: "Oscillators",
  },
  {
    id: "sine_wave",
    name: "Sine Wave Indicator",
    category: "Oscillators",
  },
  { id: "mesa_ama", name: "MESA Adaptive MA", category: "Oscillators" },
  {
    id: "hilbert",
    name: "Hilbert Transform",
    category: "Oscillators",
  },
  { id: "vrsi", name: "VRSI", category: "Oscillators" },
  { id: "vmacd", name: "VMACD", category: "Oscillators" },
  { id: "ehlers_ft", name: "Ehlers Fisher Transform", category: "Oscillators" },
  // ── AI-Powered (30+)
  { id: "ai_trend", name: "AI Trend Predictor", category: "AI-Powered" },
  { id: "neural_sig", name: "Neural Net Signal", category: "AI-Powered" },
  {
    id: "lstm_forecast",
    name: "LSTM Price Forecast",
    category: "AI-Powered",
  },
  {
    id: "ai_divergence",
    name: "AI Divergence Detector",
    category: "AI-Powered",
  },
  {
    id: "smart_money",
    name: "Smart Money Index",
    category: "AI-Powered",
  },
  {
    id: "ai_sr",
    name: "AI Support/Resistance",
    category: "AI-Powered",
  },
  {
    id: "ml_trend",
    name: "Machine Learning Trend",
    category: "AI-Powered",
  },
  {
    id: "dl_momentum",
    name: "Deep Learning Momentum",
    category: "AI-Powered",
  },
  {
    id: "ai_vol_anomaly",
    name: "AI Volume Anomaly",
    category: "AI-Powered",
  },
  {
    id: "pred_rsi",
    name: "Predictive RSI",
    category: "AI-Powered",
  },
  {
    id: "ai_candle",
    name: "AI Candle Pattern",
    category: "AI-Powered",
  },
  {
    id: "quantum_mom",
    name: "Quantum Momentum",
    category: "AI-Powered",
  },
  {
    id: "ai_breakout",
    name: "AI Breakout Detector",
    category: "AI-Powered",
  },
  {
    id: "sent_mom",
    name: "Sentiment Momentum",
    category: "AI-Powered",
  },
  {
    id: "ai_mean_rev",
    name: "AI Mean Reversion",
    category: "AI-Powered",
  },
  {
    id: "neural_osc",
    name: "Neural Oscillator",
    category: "AI-Powered",
  },
  {
    id: "ai_fib",
    name: "AI Fibonacci",
    category: "AI-Powered",
  },
  {
    id: "ai_elliott",
    name: "AI Elliott Wave",
    category: "AI-Powered",
  },
  {
    id: "reinf_sig",
    name: "Reinforcement Signal",
    category: "AI-Powered",
  },
  {
    id: "transformer_fc",
    name: "Transformer Forecast",
    category: "AI-Powered",
  },
  {
    id: "gan_price",
    name: "GAN Price Predictor",
    category: "AI-Powered",
  },
  {
    id: "bayesian_trend",
    name: "Bayesian Trend",
    category: "AI-Powered",
  },
  {
    id: "kalman_ma",
    name: "Kalman Filter MA",
    category: "AI-Powered",
  },
  {
    id: "adaptive_rsi",
    name: "Adaptive RSI",
    category: "AI-Powered",
  },
  {
    id: "dyn_bb_ai",
    name: "Dynamic Bollinger AI",
    category: "AI-Powered",
  },
  {
    id: "ai_div_rsi",
    name: "AI Divergence RSI",
    category: "AI-Powered",
  },
  {
    id: "hybrid_ma",
    name: "Hybrid MA Signal",
    category: "AI-Powered",
  },
  {
    id: "ai_cycle",
    name: "AI Cycle Detector",
    category: "AI-Powered",
  },
  {
    id: "smart_trend",
    name: "Smart Trend AI",
    category: "AI-Powered",
  },
  {
    id: "neural_pivot",
    name: "Neural Pivot AI",
    category: "AI-Powered",
  },
  {
    id: "ai_regime",
    name: "AI Market Regime",
    category: "AI-Powered",
  },
  // ── Pattern Recognition (20+)
  { id: "doji", name: "Doji", category: "Pattern Recognition" },
  { id: "hammer", name: "Hammer", category: "Pattern Recognition" },
  {
    id: "inv_hammer",
    name: "Inverted Hammer",
    category: "Pattern Recognition",
  },
  {
    id: "bull_engulf",
    name: "Bullish Engulfing",
    category: "Pattern Recognition",
  },
  {
    id: "bear_engulf",
    name: "Bearish Engulfing",
    category: "Pattern Recognition",
  },
  {
    id: "morning_star",
    name: "Morning Star",
    category: "Pattern Recognition",
  },
  {
    id: "evening_star",
    name: "Evening Star",
    category: "Pattern Recognition",
  },
  {
    id: "shooting_star",
    name: "Shooting Star",
    category: "Pattern Recognition",
  },
  {
    id: "hanging_man",
    name: "Hanging Man",
    category: "Pattern Recognition",
  },
  {
    id: "three_white",
    name: "Three White Soldiers",
    category: "Pattern Recognition",
  },
  {
    id: "three_black",
    name: "Three Black Crows",
    category: "Pattern Recognition",
  },
  {
    id: "bull_harami",
    name: "Bullish Harami",
    category: "Pattern Recognition",
  },
  {
    id: "bear_harami",
    name: "Bearish Harami",
    category: "Pattern Recognition",
  },
  {
    id: "piercing",
    name: "Piercing Pattern",
    category: "Pattern Recognition",
  },
  {
    id: "dark_cloud",
    name: "Dark Cloud Cover",
    category: "Pattern Recognition",
  },
  {
    id: "tweezer_top",
    name: "Tweezer Top",
    category: "Pattern Recognition",
  },
  {
    id: "tweezer_bot",
    name: "Tweezer Bottom",
    category: "Pattern Recognition",
  },
  { id: "inside_bar", name: "Inside Bar", category: "Pattern Recognition" },
  {
    id: "outside_bar",
    name: "Outside Bar",
    category: "Pattern Recognition",
  },
  { id: "pin_bar", name: "Pin Bar", category: "Pattern Recognition" },
  {
    id: "spinning_top",
    name: "Spinning Top",
    category: "Pattern Recognition",
  },
];

// ─── Drawing Tools ─────────────────────────────────────────────────────────────

type DrawingToolType =
  | "cursor"
  | "trendline"
  | "hline"
  | "stoploss"
  | "takeprofit"
  | "fib"
  | "text";

interface DrawnObject {
  id: string;
  type: Exclude<DrawingToolType, "cursor">;
  x1: number;
  y1: number;
  x2?: number;
  y2?: number;
  price?: number;
  label?: string;
  color: string;
}

interface LiveChartProps {
  basePrice: number;
  symbol: string;
  isPositive: boolean;
  height?: number;
  updateInterval?: number;
}

// ─── Indicator simulation helpers ─────────────────────────────────────────────

function calcSMA(closes: number[], period: number): (number | null)[] {
  return closes.map((_, i) => {
    if (i < period - 1) return null;
    const slice = closes.slice(i - period + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  });
}

function calcEMA(closes: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const result: (number | null)[] = new Array(closes.length).fill(null);
  let ema = closes[0];
  result[0] = ema;
  for (let i = 1; i < closes.length; i++) {
    ema = closes[i] * k + ema * (1 - k);
    result[i] = ema;
  }
  return result;
}

function calcBollingerBands(
  closes: number[],
  period = 20,
  mult = 2,
): { upper: (number | null)[]; lower: (number | null)[] } {
  const sma = calcSMA(closes, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (sma[i] === null) {
      upper.push(null);
      lower.push(null);
    } else {
      const slice = closes.slice(Math.max(0, i - period + 1), i + 1);
      const mean = sma[i]!;
      const variance =
        slice.reduce((a, b) => a + (b - mean) ** 2, 0) / slice.length;
      const sd = Math.sqrt(variance);
      upper.push(mean + mult * sd);
      lower.push(mean - mult * sd);
    }
  }
  return { upper, lower };
}

// Simulate a wavy AI indicator line
function calcAILine(closes: number[]): number[] {
  const base = calcSMA(closes, 7);
  return closes.map((c, i) => {
    const b = base[i] ?? c;
    const wave = Math.sin(i * 0.3) * b * 0.004;
    return b + wave;
  });
}

// ─── CandlestickSVG ────────────────────────────────────────────────────────────

function CandlestickSVG({
  candles,
  width,
  height,
  activeIndicators,
  activeTool,
  drawnObjects,
  setDrawnObjects,
  drawingStart,
  setDrawingStart,
  inProgressShape,
  setInProgressShape,
}: {
  candles: Candle[];
  width: number;
  height: number;
  activeIndicators: string[];
  activeTool: DrawingToolType;
  drawnObjects: DrawnObject[];
  setDrawnObjects: React.Dispatch<React.SetStateAction<DrawnObject[]>>;
  drawingStart: { x: number; y: number } | null;
  setDrawingStart: React.Dispatch<
    React.SetStateAction<{ x: number; y: number } | null>
  >;
  inProgressShape: DrawnObject | null;
  setInProgressShape: React.Dispatch<React.SetStateAction<DrawnObject | null>>;
}) {
  if (!candles.length || width === 0) return null;

  const padding = { top: 12, right: 8, bottom: 28, left: 62 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxCandles = Math.max(30, Math.floor(chartW / 8));
  const visible = candles.slice(-maxCandles);

  if (!visible.length) return null;

  const prices = visible.flatMap((c) => [c.high, c.low]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const toY = (price: number) =>
    padding.top + chartH - ((price - minPrice) / priceRange) * chartH;

  const toPrice = (y: number) =>
    minPrice + ((padding.top + chartH - y) / chartH) * priceRange;

  const candleWidth = Math.max(2, Math.floor(chartW / visible.length) - 2);
  const candleSpacing = chartW / visible.length;

  const yTickCount = 5;
  const yTicks = Array.from({ length: yTickCount }, (_, i) => {
    const price = minPrice + (priceRange / (yTickCount - 1)) * i;
    return { price, y: toY(price) };
  });

  const tickFmt = (v: number) => {
    if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`;
    if (v >= 1) return `$${v.toFixed(2)}`;
    return `$${v.toPrecision(3)}`;
  };

  const xLabelInterval = Math.max(1, Math.floor(visible.length / 6));
  const closes = visible.map((c) => c.close);

  // Build indicator polylines
  const indicatorLines: {
    id: string;
    points: string;
    color: string;
    dash?: string;
  }[] = [];

  for (const indId of activeIndicators) {
    const ind = AI_INDICATORS.find((x) => x.id === indId);
    if (!ind) continue;
    const color = CATEGORY_COLORS[ind.category];

    let vals: (number | null)[] | null = null;

    if (indId.startsWith("sma")) {
      const period = Number.parseInt(indId.replace("sma", "")) || 14;
      vals = calcSMA(closes, Math.min(period, closes.length));
    } else if (indId.startsWith("ema")) {
      const period = Number.parseInt(indId.replace("ema", "")) || 14;
      vals = calcEMA(closes, Math.min(period, closes.length));
    } else if (indId === "bb") {
      // Bollinger – draw upper + lower
      const { upper, lower } = calcBollingerBands(closes);
      const mkPts = (arr: (number | null)[]) =>
        arr
          .map((v, i) => {
            if (v === null) return null;
            const cx = padding.left + i * candleSpacing + candleSpacing / 2;
            return `${cx},${toY(v)}`;
          })
          .filter(Boolean)
          .join(" ");
      indicatorLines.push({
        id: `${indId}-upper`,
        points: mkPts(upper),
        color,
        dash: "4 2",
      });
      indicatorLines.push({
        id: `${indId}-lower`,
        points: mkPts(lower),
        color,
        dash: "4 2",
      });
      continue;
    } else if (
      ind.category === "AI-Powered" ||
      indId === "vwap" ||
      indId === "vwap2"
    ) {
      vals = calcAILine(closes);
    } else {
      // Fallback: generic SMA-like line
      vals = calcSMA(closes, Math.min(14, closes.length));
    }

    if (vals) {
      const pts = vals
        .map((v, i) => {
          if (v === null) return null;
          const cx = padding.left + i * candleSpacing + candleSpacing / 2;
          return `${cx},${toY(v)}`;
        })
        .filter(Boolean)
        .join(" ");
      if (pts) {
        indicatorLines.push({ id: indId, points: pts, color });
      }
    }
  }

  // Active indicator legend
  const activeLegend = activeIndicators
    .map((id) => AI_INDICATORS.find((x) => x.id === id))
    .filter(Boolean) as Indicator[];

  // Mouse event handlers
  const getCursorStyle = () => {
    if (activeTool === "cursor") return "default";
    return "crosshair";
  };

  const getSvgCoords = (
    e: React.MouseEvent<SVGSVGElement>,
  ): { x: number; y: number } => {
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool === "cursor") return;
    e.preventDefault();
    const pt = getSvgCoords(e);
    setDrawingStart(pt);
    const price = toPrice(pt.y);
    const toolType = activeTool as Exclude<DrawingToolType, "cursor">;
    const colorMap: Record<Exclude<DrawingToolType, "cursor">, string> = {
      trendline: "#f59e0b",
      hline: "#94a3b8",
      stoploss: "#ef4444",
      takeprofit: "#22c55e",
      fib: "#a78bfa",
      text: "#fbbf24",
    };
    setInProgressShape({
      id: "wip",
      type: toolType,
      x1: pt.x,
      y1: pt.y,
      x2: pt.x,
      y2: pt.y,
      price,
      color: colorMap[toolType],
    });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!drawingStart || !inProgressShape) return;
    const pt = getSvgCoords(e);
    setInProgressShape((prev) =>
      prev ? { ...prev, x2: pt.x, y2: pt.y, price: toPrice(pt.y) } : null,
    );
  };

  const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!drawingStart || !inProgressShape || activeTool === "cursor") return;
    const pt = getSvgCoords(e);
    const finalShape: DrawnObject = {
      ...inProgressShape,
      id: `drawn_${Date.now()}`,
      x2: pt.x,
      y2: pt.y,
      price: toPrice(pt.y),
    };
    setDrawnObjects((prev) => [...prev, finalShape]);
    setDrawingStart(null);
    setInProgressShape(null);
  };

  // Render a single drawn object
  const renderDrawn = (obj: DrawnObject, isWip = false) => {
    const opacity = isWip ? 0.6 : 1;
    const x2 = obj.x2 ?? obj.x1 + 80;
    const y2 = obj.y2 ?? obj.y1;
    const priceLabel = obj.price !== undefined ? tickFmt(obj.price) : "";

    switch (obj.type) {
      case "trendline":
        return (
          <line
            key={obj.id}
            x1={obj.x1}
            y1={obj.y1}
            x2={x2}
            y2={y2}
            stroke={obj.color}
            strokeWidth={1.5}
            opacity={opacity}
          />
        );
      case "hline":
        return (
          <g key={obj.id} opacity={opacity}>
            <line
              x1={padding.left}
              y1={obj.y1}
              x2={width - padding.right}
              y2={obj.y1}
              stroke={obj.color}
              strokeWidth={1}
            />
            <text
              x={width - padding.right + 2}
              y={obj.y1 + 4}
              fill={obj.color}
              fontSize={8}
              fontFamily="JetBrains Mono, monospace"
            >
              {priceLabel}
            </text>
          </g>
        );
      case "stoploss":
        return (
          <g key={obj.id} opacity={opacity}>
            <line
              x1={padding.left}
              y1={obj.y1}
              x2={width - padding.right}
              y2={obj.y1}
              stroke={obj.color}
              strokeWidth={1.5}
              strokeDasharray="6 3"
            />
            <rect
              x={width - padding.right - 52}
              y={obj.y1 - 9}
              width={52}
              height={14}
              fill="#ef444420"
              rx={2}
            />
            <text
              x={width - padding.right - 4}
              y={obj.y1 + 3}
              fill={obj.color}
              fontSize={8}
              fontFamily="JetBrains Mono, monospace"
              textAnchor="end"
            >
              SL {priceLabel}
            </text>
          </g>
        );
      case "takeprofit":
        return (
          <g key={obj.id} opacity={opacity}>
            <line
              x1={padding.left}
              y1={obj.y1}
              x2={width - padding.right}
              y2={obj.y1}
              stroke={obj.color}
              strokeWidth={1.5}
              strokeDasharray="6 3"
            />
            <rect
              x={width - padding.right - 52}
              y={obj.y1 - 9}
              width={52}
              height={14}
              fill="#22c55e20"
              rx={2}
            />
            <text
              x={width - padding.right - 4}
              y={obj.y1 + 3}
              fill={obj.color}
              fontSize={8}
              fontFamily="JetBrains Mono, monospace"
              textAnchor="end"
            >
              TP {priceLabel}
            </text>
          </g>
        );
      case "fib": {
        const fibLevels = [0, 0.236, 0.382, 0.5, 0.618, 1.0];
        const fibColors = [
          "#a78bfa",
          "#818cf8",
          "#60a5fa",
          "#34d399",
          "#fbbf24",
          "#f87171",
        ];
        const yTop = Math.min(obj.y1, y2);
        const yBot = Math.max(obj.y1, y2);
        const yDiff = yBot - yTop;
        return (
          <g key={obj.id} opacity={opacity}>
            {fibLevels.map((lvl, fi) => {
              const fy = yTop + lvl * yDiff;
              const fp = toPrice(fy);
              return (
                <g key={lvl}>
                  <line
                    x1={padding.left}
                    y1={fy}
                    x2={width - padding.right}
                    y2={fy}
                    stroke={fibColors[fi]}
                    strokeWidth={0.8}
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padding.left + 2}
                    y={fy - 2}
                    fill={fibColors[fi]}
                    fontSize={7}
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {(lvl * 100).toFixed(1)}% {tickFmt(fp)}
                  </text>
                </g>
              );
            })}
          </g>
        );
      }
      case "text":
        return (
          <text
            key={obj.id}
            x={obj.x1}
            y={obj.y1}
            fill={obj.color}
            fontSize={10}
            fontFamily="JetBrains Mono, monospace"
            opacity={opacity}
          >
            Note
          </text>
        );
      default:
        return null;
    }
  };

  return (
    <svg
      width={width}
      height={height}
      style={{ display: "block", cursor: getCursorStyle() }}
      aria-label="Candlestick chart"
      role="img"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <title>Candlestick Chart</title>

      {/* Grid lines */}
      {yTicks.map(({ y, price }) => (
        <g key={price}>
          <line
            x1={padding.left}
            y1={y}
            x2={width - padding.right}
            y2={y}
            stroke="oklch(0.22 0.010 240 / 0.5)"
            strokeWidth={0.5}
            strokeDasharray="3 5"
          />
          <text
            x={padding.left - 4}
            y={y + 4}
            textAnchor="end"
            fill="oklch(0.50 0.010 225)"
            fontSize={9}
            fontFamily="JetBrains Mono, monospace"
          >
            {tickFmt(price)}
          </text>
        </g>
      ))}

      {/* Indicator polylines (behind candles) */}
      {indicatorLines.map((line) => (
        <polyline
          key={line.id}
          points={line.points}
          fill="none"
          stroke={line.color}
          strokeWidth={1.2}
          opacity={0.75}
          strokeDasharray={line.dash}
        />
      ))}

      {/* Candles */}
      {visible.map((candle, i) => {
        const isBull = candle.close >= candle.open;
        const fillColor = isBull ? BULL_HEX : BEAR_HEX;
        const cx = padding.left + i * candleSpacing + candleSpacing / 2;
        const bodyTop = toY(Math.max(candle.open, candle.close));
        const bodyBottom = toY(Math.min(candle.open, candle.close));
        const bodyHeight = Math.max(1, bodyBottom - bodyTop);
        const wickTop = toY(candle.high);
        const wickBottom = toY(candle.low);
        const xLeft = cx - candleWidth / 2;

        return (
          <g key={candle.time}>
            <line
              x1={cx}
              y1={wickTop}
              x2={cx}
              y2={wickBottom}
              stroke={fillColor}
              strokeWidth={1}
              opacity={0.8}
            />
            <rect
              x={xLeft}
              y={bodyTop}
              width={candleWidth}
              height={bodyHeight}
              fill={fillColor}
              fillOpacity={isBull ? 0.9 : 0.85}
              stroke={fillColor}
              strokeWidth={0.5}
              rx={0.5}
              className={
                i === visible.length - 1 ? "animate-candle-live" : undefined
              }
            />
          </g>
        );
      })}

      {/* Drawn objects layer */}
      {drawnObjects.map((obj) => renderDrawn(obj))}
      {inProgressShape && renderDrawn(inProgressShape, true)}

      {/* X axis labels */}
      {visible
        .filter((_, i) => i % xLabelInterval === 0)
        .map((candle) => {
          const idx = visible.indexOf(candle);
          const cx = padding.left + idx * candleSpacing + candleSpacing / 2;
          return (
            <text
              key={`xt-${candle.time}`}
              x={cx}
              y={height - 6}
              textAnchor="middle"
              fill="oklch(0.50 0.010 225)"
              fontSize={9}
              fontFamily="JetBrains Mono, monospace"
            >
              {candle.time}
            </text>
          );
        })}

      {/* Active indicators legend */}
      {activeLegend.length > 0 && (
        <g>
          {activeLegend.slice(0, 4).map((ind, idx) => (
            <g
              key={ind.id}
              transform={`translate(${padding.left + 4}, ${padding.top + 4 + idx * 14})`}
            >
              <rect
                width={8}
                height={8}
                fill={CATEGORY_COLORS[ind.category]}
                rx={1}
                y={-1}
              />
              <text
                x={11}
                y={7}
                fill="oklch(0.75 0.008 220)"
                fontSize={7}
                fontFamily="JetBrains Mono, monospace"
              >
                {ind.name}
              </text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

// ─── CandlestickChart (responsive wrapper) ────────────────────────────────────

function CandlestickChart({
  candles,
  height,
  activeIndicators,
  activeTool,
  drawnObjects,
  setDrawnObjects,
  drawingStart,
  setDrawingStart,
  inProgressShape,
  setInProgressShape,
}: {
  candles: Candle[];
  height: number;
  activeIndicators: string[];
  activeTool: DrawingToolType;
  drawnObjects: DrawnObject[];
  setDrawnObjects: React.Dispatch<React.SetStateAction<DrawnObject[]>>;
  drawingStart: { x: number; y: number } | null;
  setDrawingStart: React.Dispatch<
    React.SetStateAction<{ x: number; y: number } | null>
  >;
  inProgressShape: DrawnObject | null;
  setInProgressShape: React.Dispatch<React.SetStateAction<DrawnObject | null>>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    setContainerWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height }}>
      <CandlestickSVG
        candles={candles}
        width={containerWidth}
        height={height}
        activeIndicators={activeIndicators}
        activeTool={activeTool}
        drawnObjects={drawnObjects}
        setDrawnObjects={setDrawnObjects}
        drawingStart={drawingStart}
        setDrawingStart={setDrawingStart}
        inProgressShape={inProgressShape}
        setInProgressShape={setInProgressShape}
      />
    </div>
  );
}

// ─── LiveChart ─────────────────────────────────────────────────────────────────

export function LiveChart({
  basePrice,
  symbol,
  isPositive,
  height = 280,
  updateInterval = 5000,
}: LiveChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1H");
  const [candles, setCandles] = useState<Candle[]>(() =>
    generateCandles(
      basePrice,
      getTimeframeCount("1H"),
      getTimeframeInterval("1H"),
    ),
  );
  const priceRef = useRef(basePrice);
  const isUp =
    candles.length > 0
      ? candles[candles.length - 1].close >= candles[0].open
      : isPositive;
  const color = isUp ? BULL_COLOR : BEAR_COLOR;

  // ── Indicator state
  const [showIndicatorsPanel, setShowIndicatorsPanel] = useState(false);
  const [indicatorSearch, setIndicatorSearch] = useState("");
  const [activeIndicators, setActiveIndicators] = useState<string[]>([]);
  const indicatorsPanelRef = useRef<HTMLDivElement>(null);

  // ── Drawing tools state
  const [activeTool, setActiveTool] = useState<DrawingToolType>("cursor");
  const [showDrawingPanel, setShowDrawingPanel] = useState(false);
  const [drawnObjects, setDrawnObjects] = useState<DrawnObject[]>([]);
  const [drawingStart, setDrawingStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [inProgressShape, setInProgressShape] = useState<DrawnObject | null>(
    null,
  );
  const drawingPanelRef = useRef<HTMLDivElement>(null);

  // Regenerate on timeframe change
  useEffect(() => {
    const count = getTimeframeCount(timeframe);
    const interval = getTimeframeInterval(timeframe);
    setCandles(generateCandles(priceRef.current, count, interval));
  }, [timeframe]);

  // Live update - wiggle last candle
  useEffect(() => {
    const id = setInterval(() => {
      setCandles((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const change = (Math.random() - 0.48) * 0.003 * last.close;
        const newClose = Math.max(last.close + change, last.low);
        priceRef.current = newClose;
        return [
          ...prev.slice(0, -1),
          {
            ...last,
            close: Number.parseFloat(newClose.toFixed(8)),
            high: Math.max(last.high, newClose),
            low: Math.min(last.low, newClose),
          },
        ];
      });
    }, updateInterval);
    return () => clearInterval(id);
  }, [updateInterval]);

  // Close panels on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        indicatorsPanelRef.current &&
        !indicatorsPanelRef.current.contains(e.target as Node)
      ) {
        setShowIndicatorsPanel(false);
      }
      if (
        drawingPanelRef.current &&
        !drawingPanelRef.current.contains(e.target as Node)
      ) {
        setShowDrawingPanel(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close panels on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowIndicatorsPanel(false);
        setShowDrawingPanel(false);
        setActiveTool("cursor");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const volumeData = useMemo(
    () =>
      candles.slice(-60).map((c) => ({
        time: c.time,
        volume: c.volume,
        isBull: c.close >= c.open,
      })),
    [candles],
  );

  const currentPrice = candles[candles.length - 1]?.close ?? basePrice;
  const priceChange =
    candles.length > 1
      ? ((currentPrice - candles[0].open) / candles[0].open) * 100
      : 0;

  // Filtered indicators for search
  const filteredIndicators = AI_INDICATORS.filter(
    (ind) =>
      ind.name.toLowerCase().includes(indicatorSearch.toLowerCase()) ||
      ind.category.toLowerCase().includes(indicatorSearch.toLowerCase()),
  );

  // Group by category
  const indicatorsByCategory = filteredIndicators.reduce(
    (acc, ind) => {
      if (!acc[ind.category]) acc[ind.category] = [];
      acc[ind.category].push(ind);
      return acc;
    },
    {} as Record<IndicatorCategory, Indicator[]>,
  );

  const toggleIndicator = (id: string) => {
    setActiveIndicators((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, id];
    });
  };

  const DRAWING_TOOLS: {
    type: DrawingToolType;
    label: string;
    icon: string;
    color?: string;
  }[] = [
    { type: "cursor", label: "Cursor", icon: "↖" },
    { type: "trendline", label: "Trend Line", icon: "↗" },
    { type: "hline", label: "H-Line", icon: "—" },
    { type: "stoploss", label: "Stop Loss", icon: "SL", color: "#ef4444" },
    {
      type: "takeprofit",
      label: "Take Profit",
      icon: "TP",
      color: "#22c55e",
    },
    { type: "fib", label: "Fibonacci", icon: "φ" },
    { type: "text", label: "Text Note", icon: "T" },
  ];

  return (
    <div className="w-full">
      {/* ── Row 1: Timeframe + Tools ────────────────────── */}
      <div className="flex items-center gap-1 mb-2 flex-wrap">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            type="button"
            onClick={() => setTimeframe(tf)}
            className="px-2.5 py-1 text-xs font-mono rounded transition-colors"
            style={
              timeframe === tf
                ? {
                    background: "oklch(0.82 0.16 88 / 0.15)",
                    color: "oklch(0.82 0.16 88)",
                    border: "1px solid oklch(0.82 0.16 88 / 0.4)",
                  }
                : {
                    background: "transparent",
                    color: "oklch(0.55 0.012 225)",
                    border: "1px solid oklch(0.22 0.010 240)",
                  }
            }
          >
            {tf}
          </button>
        ))}

        {/* Indicators button */}
        <div className="relative" ref={indicatorsPanelRef}>
          <button
            type="button"
            data-ocid="chart.indicators_button"
            onClick={() => {
              setShowIndicatorsPanel((v) => !v);
              setShowDrawingPanel(false);
            }}
            className="px-2.5 py-1 text-xs font-mono rounded transition-colors flex items-center gap-1"
            style={
              showIndicatorsPanel || activeIndicators.length > 0
                ? {
                    background: "oklch(0.62 0.22 270 / 0.18)",
                    color: "#a78bfa",
                    border: "1px solid oklch(0.62 0.22 270 / 0.5)",
                  }
                : {
                    background: "transparent",
                    color: "oklch(0.55 0.012 225)",
                    border: "1px solid oklch(0.22 0.010 240)",
                  }
            }
            title="AI Indicators"
          >
            <span style={{ fontSize: 11 }}>⚡</span>
            <span>Indicators</span>
            {activeIndicators.length > 0 && (
              <span
                className="text-[10px] rounded-full px-1"
                style={{ background: "#a78bfa30", color: "#a78bfa" }}
              >
                {activeIndicators.length}
              </span>
            )}
          </button>

          {/* Indicators panel */}
          {showIndicatorsPanel && (
            <div
              data-ocid="chart.indicators_panel"
              className="absolute top-full left-0 mt-1 z-50 rounded-xl overflow-hidden shadow-2xl"
              style={{
                width: 260,
                background: "oklch(0.135 0.007 240)",
                border: "1px solid oklch(0.25 0.012 240)",
              }}
            >
              {/* Search */}
              <div
                className="p-2 border-b"
                style={{ borderColor: "oklch(0.22 0.010 240)" }}
              >
                <input
                  type="text"
                  data-ocid="chart.indicator_search_input"
                  placeholder="Search 200+ indicators..."
                  value={indicatorSearch}
                  onChange={(e) => setIndicatorSearch(e.target.value)}
                  className="w-full rounded-lg px-3 py-1.5 text-xs font-mono outline-none"
                  style={{
                    background: "oklch(0.10 0.006 240)",
                    border: "1px solid oklch(0.22 0.010 240)",
                    color: "oklch(0.88 0.008 220)",
                  }}
                />
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 300 }}>
                {(
                  Object.entries(indicatorsByCategory) as [
                    IndicatorCategory,
                    Indicator[],
                  ][]
                ).map(([cat, inds]) => (
                  <div key={cat}>
                    <div
                      className="px-3 py-1 text-[10px] font-mono font-bold sticky top-0"
                      style={{
                        background: "oklch(0.115 0.006 240)",
                        color: CATEGORY_COLORS[cat],
                        borderBottom: `1px solid ${CATEGORY_COLORS[cat]}30`,
                      }}
                    >
                      {cat} ({inds.length})
                    </div>
                    {inds.map((ind) => {
                      const isActive = activeIndicators.includes(ind.id);
                      const isDisabled =
                        !isActive && activeIndicators.length >= 3;
                      return (
                        <button
                          key={ind.id}
                          type="button"
                          onClick={() => !isDisabled && toggleIndicator(ind.id)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-left transition-colors"
                          style={{
                            color: isDisabled
                              ? "oklch(0.40 0.008 220)"
                              : isActive
                                ? CATEGORY_COLORS[ind.category]
                                : "oklch(0.72 0.008 220)",
                            background: isActive
                              ? `${CATEGORY_COLORS[ind.category]}15`
                              : "transparent",
                            cursor: isDisabled ? "not-allowed" : "pointer",
                          }}
                        >
                          <span
                            className="w-3 h-3 rounded-sm flex-shrink-0 flex items-center justify-center border"
                            style={{
                              borderColor: isActive
                                ? CATEGORY_COLORS[ind.category]
                                : "oklch(0.30 0.010 240)",
                              background: isActive
                                ? CATEGORY_COLORS[ind.category]
                                : "transparent",
                            }}
                          >
                            {isActive && (
                              <span style={{ color: "#000", fontSize: 8 }}>
                                ✓
                              </span>
                            )}
                          </span>
                          <span className="truncate flex-1">{ind.name}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
                {filteredIndicators.length === 0 && (
                  <div
                    className="px-3 py-4 text-center text-xs font-mono"
                    style={{ color: "oklch(0.45 0.010 225)" }}
                  >
                    No indicators found
                  </div>
                )}
              </div>
              <div
                className="px-3 py-2 text-[10px] font-mono border-t"
                style={{
                  borderColor: "oklch(0.22 0.010 240)",
                  color: "oklch(0.45 0.010 225)",
                }}
              >
                {activeIndicators.length}/3 active · Max 3 at once
              </div>
            </div>
          )}
        </div>

        {/* Drawing tools button */}
        <div className="relative" ref={drawingPanelRef}>
          <button
            type="button"
            data-ocid="chart.drawing_tools_button"
            onClick={() => {
              setShowDrawingPanel((v) => !v);
              setShowIndicatorsPanel(false);
            }}
            className="px-2.5 py-1 text-xs font-mono rounded transition-colors flex items-center gap-1"
            style={
              showDrawingPanel || activeTool !== "cursor"
                ? {
                    background: "oklch(0.78 0.14 60 / 0.15)",
                    color: "#f59e0b",
                    border: "1px solid oklch(0.78 0.14 60 / 0.5)",
                  }
                : {
                    background: "transparent",
                    color: "oklch(0.55 0.012 225)",
                    border: "1px solid oklch(0.22 0.010 240)",
                  }
            }
            title="Drawing Tools"
          >
            <span style={{ fontSize: 11 }}>✏</span>
            <span>Draw</span>
          </button>

          {/* Drawing panel */}
          {showDrawingPanel && (
            <div
              data-ocid="chart.drawing_tools_panel"
              className="absolute top-full left-0 mt-1 z-50 rounded-xl overflow-hidden shadow-2xl p-2"
              style={{
                width: 140,
                background: "oklch(0.135 0.007 240)",
                border: "1px solid oklch(0.25 0.012 240)",
              }}
            >
              {DRAWING_TOOLS.map((tool) => (
                <button
                  key={tool.type}
                  type="button"
                  onClick={() => {
                    setActiveTool(tool.type);
                    setShowDrawingPanel(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-mono transition-colors mb-0.5"
                  style={{
                    background:
                      activeTool === tool.type
                        ? "oklch(0.78 0.14 60 / 0.15)"
                        : "transparent",
                    color:
                      activeTool === tool.type
                        ? "#f59e0b"
                        : (tool.color ?? "oklch(0.72 0.008 220)"),
                    border:
                      activeTool === tool.type
                        ? "1px solid oklch(0.78 0.14 60 / 0.3)"
                        : "1px solid transparent",
                  }}
                >
                  <span
                    className="w-5 text-center font-bold"
                    style={{ color: tool.color }}
                  >
                    {tool.icon}
                  </span>
                  {tool.label}
                </button>
              ))}
              <div
                className="mt-1 pt-1"
                style={{ borderTop: "1px solid oklch(0.22 0.010 240)" }}
              >
                <button
                  type="button"
                  data-ocid="chart.clear_all_button"
                  onClick={() => {
                    setDrawnObjects([]);
                    setActiveTool("cursor");
                    setShowDrawingPanel(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-mono transition-colors"
                  style={{
                    color: "#ef4444",
                    background: "transparent",
                    border: "1px solid transparent",
                  }}
                >
                  <span className="w-5 text-center">🗑</span>
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Price + change display */}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className="text-xs font-mono font-bold"
              style={{ color: "oklch(0.92 0.008 220)" }}
            >
              {formatPrice(currentPrice)}
            </span>
            <span className="text-xs font-mono" style={{ color }}>
              {priceChange >= 0 ? "+" : ""}
              {priceChange.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
              style={{ background: color }}
            />
            <span className="text-xs font-mono" style={{ color }}>
              LIVE {symbol}
            </span>
          </div>
        </div>
      </div>

      {/* ── Row 2: Active indicator pills ───────────────── */}
      {activeIndicators.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {activeIndicators.map((id) => {
            const ind = AI_INDICATORS.find((x) => x.id === id);
            if (!ind) return null;
            const col = CATEGORY_COLORS[ind.category];
            return (
              <span
                key={id}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono"
                style={{
                  background: `${col}20`,
                  color: col,
                  border: `1px solid ${col}40`,
                }}
              >
                {ind.name}
                <button
                  type="button"
                  onClick={() => toggleIndicator(id)}
                  className="hover:opacity-70"
                  style={{ lineHeight: 1 }}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* ── Active drawing tool indicator ───────────────── */}
      {activeTool !== "cursor" && (
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded-full"
            style={{
              background: "oklch(0.78 0.14 60 / 0.15)",
              color: "#f59e0b",
              border: "1px solid oklch(0.78 0.14 60 / 0.3)",
            }}
          >
            ✏ {DRAWING_TOOLS.find((t) => t.type === activeTool)?.label} active —
            draw on chart
          </span>
          <button
            type="button"
            onClick={() => setActiveTool("cursor")}
            className="text-[10px] font-mono"
            style={{ color: "oklch(0.50 0.010 225)" }}
          >
            ✕ cancel
          </button>
        </div>
      )}

      {/* ── Candlestick chart ───────────────────────────── */}
      <CandlestickChart
        candles={candles}
        height={Math.floor(height * 0.8)}
        activeIndicators={activeIndicators}
        activeTool={activeTool}
        drawnObjects={drawnObjects}
        setDrawnObjects={setDrawnObjects}
        drawingStart={drawingStart}
        setDrawingStart={setDrawingStart}
        inProgressShape={inProgressShape}
        setInProgressShape={setInProgressShape}
      />

      {/* ── Volume bars ─────────────────────────────────── */}
      <div style={{ height: Math.floor(height * 0.18), marginTop: 4 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={volumeData}
            margin={{ top: 0, right: 8, left: 62, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="2 4"
              stroke="oklch(0.22 0.010 240 / 0.4)"
              vertical={false}
            />
            <Bar
              dataKey="volume"
              isAnimationActive={false}
              {...{
                shape: (props: {
                  x?: number;
                  y?: number;
                  width?: number;
                  height?: number;
                  isBull?: boolean;
                }) => {
                  const {
                    x = 0,
                    y = 0,
                    width = 0,
                    height: h = 0,
                    isBull,
                  } = props;
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={h}
                      fill={isBull ? `${BULL_HEX}60` : `${BEAR_HEX}60`}
                      rx={1}
                    />
                  );
                },
              }}
            />
            <Tooltip
              content={() => null}
              cursor={{ fill: "oklch(0.22 0.010 240 / 0.3)" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
