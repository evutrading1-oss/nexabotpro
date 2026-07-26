/**
 * Technical Indicators Module
 * All indicator calculations — pure functions, no side effects.
 */

class Indicators {
  /** Simple Moving Average */
  static sma(data, period) {
    if (!data || data.length < period) return null;
    const slice = data.slice(-period);
    return slice.reduce((s, v) => s + v, 0) / period;
  }

  /** Exponential Moving Average */
  static ema(data, period) {
    if (!data || data.length < period) return null;
    const k = 2 / (period + 1);
    let ema = data.slice(0, period).reduce((s, v) => s + v, 0) / period;
    for (let i = period; i < data.length; i++) {
      ema = data[i] * k + ema * (1 - k);
    }
    return ema;
  }

  /** RSI */
  static rsi(prices, period = 14) {
    if (prices.length < period + 1) return { signal: 'NEUTRAL', score: 0, value: null, reason: '' };
    let gains = 0, losses = 0;
    for (let i = prices.length - period; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff >= 0) gains += diff; else losses += Math.abs(diff);
    }
    const avgGain = gains / period, avgLoss = losses / period;
    if (avgLoss === 0) return { signal: 'CALL', score: 80, value: 100, reason: 'RSI extreme bullish momentum' };
    const rsi = 100 - (100 / (1 + avgGain / avgLoss));
    if (rsi < 30) return { signal: 'CALL', score: 70, value: rsi, reason: `RSI oversold at ${rsi.toFixed(1)} — potential bullish reversal`} };
    if (rsi > 70) return { signal: 'PUT', score: -70, value: rsi, reason: `RSI overbought at ${rsi.toFixed(1)} — potential bearish reversal`} };
    if (rsi > 50) return { signal: 'CALL', score: 25, value: rsi, reason: `RSI bullish momentum at ${rsi.toFixed(1)}` };
    return { signal: 'PUT', score: -25, value: rsi, reason: `RSI bearish momentum at ${rsi.toFixed(1)}` };
  }

  /** MACD */
  static macd(prices) {
    if (prices.length < 26) return { signal: 'NEUTRAL', score: 0, reason: '' };
    const ema12 = Indicators.ema(prices, 12);
    const ema26 = Indicators.ema(prices, 26);
    const macdLine = ema12 - ema26;
    const signalLine = macdLine * 0.9;
    const hist = macdLine - signalLine;
    if (macdLine > 0 && hist > 0.0001) return { signal: 'CALL', score: 60, value: macdLine, reason: 'MACD bullish crossover — upward momentum confirmed' };
    if (macdLine < 0 && hist < -0.0001) return { signal: 'PUT', score: -60, value: macdLine, reason: 'MACD bearish crossover — downward momentum confirmed' };
    if (macdLine > 0) return { signal: 'CALL', score: 20, value: macdLine, reason: 'MACD positive — mild bullish' };
    if (macdLine < 0) return { signal: 'PUT', score: -20, value: macdLine, reason: 'MACD negative — mild bearish' };
    return { signal: 'NEUTRAL', score: 0, value: macdLine, reason: '' };
  }

  /** SMA Crossover */
  static smaSignal(prices) {
    const sma20 = Indicators.sma(prices, 20), sma50 = Indicators.sma(prices, 50);
    if (!sma20 || !sma50) return { signal: 'NEUTRAL', score: 0, reason: '' };
    const cp = prices[prices.length - 1];
    if (sma20 > sma50 && cp > sma20) return { signal: 'CALL', score: 65, reason: 'SMA Golden Cross — strong uptrend' };
    if (sma20 < sma50 && cp < sma20) return { signal: 'PUT', score: -65, reason: 'SMA Death Cross — strong downtrend' };
    if (cp > sma20) return { signal: 'CALL', score: 20, reason: 'Price above SMA20 — mild bullish' };
    if (cp < sma20) return { signal: 'PUT', score: -20, reason: 'Price below SMA20 — mild bearish' };
    return { signal: 'NEUTRAL', score: 0, reason: '' };
  }

  /** EMA Crossover */
  static emaSignal(prices) {
    const e9 = Indicators.ema(prices, 9), e21 = Indicators.ema(prices, 21);
    if (!e9 || !e21) return { signal: 'NEUTRAL', score: 0, reason: '' };
    if (e9 > e21) return { signal: 'CALL', score: 55, reason: 'EMA 9 > EMA 21 — bullish momentum' };
    if (e9 < e21) return { signal: 'PUT', score: -55, reason: 'EMA 9 < EMA 21 — bearish momentum' };
    return { signal: 'NEUTRAL', score: 0, reason: '' };
  }

  /** Bollinger Bands */
  static bollinger(prices, period = 20, mult = 2) {
    if (prices.length < period) return { signal: 'NEUTRAL', score: 0, reason: '' };
    const mid = Indicators.sma(prices, period);
    const recent = prices.slice(-period);
    const variance = recent.reduce((s, p) => s + Math.pow(p - mid, 2), 0) / period;
    const std = Math.sqrt(variance);
    const upper = mid + mult * std, lower = mid - mult * std;
    const cp = prices[prices.length - 1];
    const pB = (cp - lower) / (upper - lower);
    if (pB < 0.05) return { signal: 'CALL', score: 70, reason: 'BB: Price at lower band — oversold reversal likely' };
    if (pB > 0.95) return { signal: 'PUT', score: -70, reason: 'BB: Price at upper band — overbought reversal likely' };
    if (pB > 0.6) return { signal: 'CALL', score: 15, reason: 'BB: Above midline — bullish bias' };
    if (pB < 0.4) return { signal: 'PUT', score: -15, reason: 'BB: Below midline — bearish bias' };
    return { signal: 'NEUTRAL', score: 0, reason: '' };
  }

  /** Stochastic */
  static stochastic(highs