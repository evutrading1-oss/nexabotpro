/**
 * Market Structure Analysis Module
 * BOS, CHoCH, Support/Resistance, Order Blocks, FVG, Liquidity
 */

class MarketStructure {
  /** Break of Structure & Change of Character */
  static bosChoch(highs, lows, prices) {
    if (prices.length < 20) return { signal: 'NEUTRAL', score: 0, reason: '' };
    const recentHighs = highs.slice(-10), recentLows = lows.slice(-10);
    const prevHighs = highs.slice(-20, -10), prevLows = lows.slice(-20, -10);
    const hh = Math.max(...recentHighs), ll = Math.min(...recentLows);
    const ph = Math.max(...prevHighs), pl = Math.min(...prevLows);
    const cp = prices[prices.length - 1];

    if (cp > ph && hh > ph)
      return { signal: 'CALL', score: 75, reason: 'Bullish BOS — uptrend continuation' };
    if (cp < pl && ll < pl)
      return { signal: 'PUT', score: -75, reason: 'Bearish BOS — downtrend continuation' };
    if (ll > pl && cp > prices[prices.length - 10])
      return { signal: 'CALL', score: 60, reason: 'Bullish CHoCH — potential reversal up' };
    if (hh < ph && cp < prices[prices.length - 10])
      return { signal: 'PUT', score: -60, reason: 'Bearish CHoCH — potential reversal down' };
    return { signal: 'NEUTRAL', score: 0, reason: '' };
  }

  /** Support & Resistance from pivot points */
  static supportResistance(highs, lows, prices) {
    if (prices.length < 20) return { signal: 'NEUTRAL', score: 0, reason: '' };
    const cp = prices[prices.length - 1];
    const pivotHighs = [], pivotLows = [];
    for (let i = 5; i < prices.length - 5; i++) {
      if (highs[i] > Math.max(...highs.slice(i - 5, i)) && highs[i] > Math.max(...highs.slice(i + 1, i + 6)))
        pivotHighs.push(highs[i]);
      if (lows[i] < Math.min(...lows.slice(i - 5, i)) && lows[i] < Math.min(...lows.slice(i + 1, i + 6)))
        pivotLows.push(lows[i]);
    }
    const resistances = pivotHighs.filter(h => h > cp).sort((a, b) => a - b);
    const supports = pivotLows.filter(l => l < cp).sort((a, b) => b - a);
    const nr = resistances[0], ns = supports[0];

    if (ns && nr) {
      const range = nr - ns;
      const pos = (cp - ns) / range;
      if (pos > 0.7) return { signal: 'PUT', score: -50, reason: `Price near resistance ${nr.toFixed(4)} — rejection likely` };
      if (pos < 0.3) return { signal: 'CALL', score: 50, reason: `Price near support ${ns.toFixed(4)} — bounce likely` };
    }
    if (ns && cp - ns < Math.abs(cp) * 0.002)
      return { signal: 'CALL', score: 55, reason: `Testing support ${ns.toFixed(4)} — bounce expected` };
    if (nr && nr - cp < Math.abs(cp) * 0.002)
      return { signal: 'PUT', score: -55, reason: `Testing resistance ${nr.toFixed(4)} — rejection expected` };
    return { signal: 'NEUTRAL', score: 0, reason: '' };
  }

  /** Order Block Detection */
  static orderBlocks(candles) {
    if (candles.length < 10) return { signal: 'NEUTRAL', score: 0, reason: '' };
    const cp = candles[candles.length - 1].close;
    for (let i = candles.length - 3; i >= 5; i--) {
      const body = Math.abs(candles[i].close - candles[i - 1].close);
      const prevBody = Math.abs(candles[i - 1].close - candles[i - 2].close);
      if (candles[i].close < candles[i - 1].close && body > prevBody * 1.5) {
        const obH = Math.max(candles[i].close, candles[i - 1].close);
        const obL = Math.min(candles[i].close, candles[i - 1].close);
        if (cp >= obL && cp <= obH)
          return { signal: 'PUT', score: -55, reason: 'Retesting bearish OB — sell pressure expected' };
      }
      if (candles[i].close > candles[i - 1].close && body > prevBody * 1.5) {
        const obH = Math.max(candles[i].close, candles[i - 1].close);
        const obL = Math.min(candles[i].close, candles[i - 1].close);
        if (cp >= obL && cp <= obH)
          return { signal: 'CALL', score: 55, reason: 'Retesting bullish OB — buy pressure expected' };
      }
    }
    return { signal: 'NEUTRAL', score: 0, reason: '' };
  }

  /** Fair Value Gap */
  static fvg(candles) {
    if (candles.length < 5) return { signal: 'NEUTRAL', score: 0, reason: '' };
    for (let i = candles.length - 2; i >= 2; i--) {
      const c0 = candles[i], c2 = candles[i - 2];
      // Bullish FVG: c2.high < c0.low (gap up)
      if (c2.high < c0.low) {
        const cp = candles[candles.length - 1].close;
        if (cp <= c0.low && cp >= c2.high)
          return { signal: 'CALL', score: 60, reason: 'Bullish FVG fill — buy on discount' };
      }
      // Bearish FVG: c2.low > c0.high (gap down)
      if (c2.low > c0.high) {
        const cp = candles[candles.length - 1].close;
        if (cp >= c0.high && cp <= c2.low)
          return { signal: 'PUT', score: -60, reason: 'Bearish FVG fill — sell on premium' };
      }
    }
    return { signal: 'NEUTRAL', score: 0, reason: '' };
  }

  /** Liquidity Analysis */
  static liquidity(highs, lows, prices) {
    if (prices.length < 20) return { signal: 'NEUTRAL', score: 0, reason: '' };
    const recentHighs = highs.slice(-10), recentLows = lows.slice(-10);
    const eqh = recentHighs.filter((h, i, arr) => Math.abs(h - arr[0]) < arr[0] * 0.0005).length;
    const eql = recentLows.filter((l, i, arr) => Math.abs(l - arr[0]) < arr[0] * 0.0005).length;
    if (eqh >= 4) return { signal: 'PUT', score: -40, reason: 'Equal highs — liquidity grab likely (sell)' };
    if (eql >= 4) return { signal: 'CALL', score: 40, reason: 'Equal lows — liquidity grab likely (buy)' };
    return { signal: 'NEUTRAL', score: 0, reason: '' };
  }
}

module.exports = MarketStructure;
