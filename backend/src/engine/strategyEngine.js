/**
 * Strategy Engine
 * Orchestrates all indicator and structure analysis modules.
 * Aggregates results and produces a final trading signal.
 */

const Indicators = require('./indicators');
const MarketStructure = require('./structure');

class StrategyEngine {
  constructor(config = {}) {
    this.config = {
      minConfidence: config.minConfidence || 60,
      minModulesAgreeing: config.minModulesAgreeing || 3,
      weights: config.weights || { trend: 1.0, momentum: 0.8, volatility: 0.6, volume: 0.7, pattern: 0.9, structure: 1.0 },
      enabled: config.enabled || this._defaultEnabled()
    };
  }

  _defaultEnabled() {
    return {
      rsi: true, macd: true, sma: true, ema: true, bollinger: true,
      stochastic: true, adx: true, atr: true, 6wap: true,
      marketStructure: true, supportResistance: true, orderBlocks: true, fvg: true,
      volumeAnalysis: true, momentumAnalysis: true, volatilityAnalysis: true, priceAction: true
    };
  }

  async analyze(candles, options = {}) {
    if (!candles || candles.length < 10) {
      return { success: false, error: 'Insufficient candle data', signal: 'NEUTRAL', confidence: 0 };
    }
    const prices = candles.map(c => c.close);
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const volumes = candles.map(c => c.volume || 0);
    const en = this.config.enabled;
    const w = this.config.weights;

    const modules = [];
    const push = (name, weight, result) => {
      if (result.signal !== 'NEUTRAL') modules.push({ name, weight, ...result });
    };

    // Run all enabled modules
    if (en.priceAction) push('Price Action', w.pattern, Indicators.priceAction(candles));
    if (en.rsi) push('RSI', w.momentum, Indicators.rsi(prices));
    if (en.macd) push('MACD', w.momentum, Indicators.macd(prices));
    if (en.sma) push('SMA', w.trend, Indicators.smaSignal(prices));
    if (en.ema) push('EMA', w.trend, Indicators.emaSignal(prices));
    if (en.bollinger) push('Bollinger', w.volatility, Indicators.bollinger(prices));
    if (en.stochastic) push('Stochastic', w.momentum, Indicators.stochastic(highs, lows, prices));
    if (en.adx) push('ADX', w.trend, Indicators.adx(highs, lows, prices));
    if (en.vwap) push('VWAP', w.trend, Indicators.vwap(highs, lows, prices, volumes));
    if (en.marketStructure) push('Market Structure', w.structure, MarketStructure.bosChoch(highs, lows, prices));
    if (en.supportResistance) push('S/R', w.structure, MarketStructure.supportResistance(highs, lows, prices));
    if (en.orderBlocks) push('Order Blocks', w.structure, MarketStructure.orderBlocks(candles));
    if (en.fvg) push('FVG', w.pattern, MarketStructure.fvg(candles));
    if (en.volumeAnalysis) push('Volume', w.volume, Indicators.volumeAnalysis(volumes, prices));
    if (en.momentumAnalysis) push('Momentum', w.momentum, Indicators.momentum(prices));

    // Also compute ATR and Volatility for info (not scoring)
    const atr = Indicators.atr(highs, lows, prices);

    // Aggregate scores
    let totalScore = 0, totalWeight = 0, calls = 0, puts = 0;
    const reasons = [], activeIndicators = [];

    modules.forEach(m => {
      totalScore += m.score * m.weight;
      totalWeight += m.weight;
      if (m.signal === 'CALL') calls++;
      if (m.signal === 'PUT') puts++;
      if (m.reason) reasons.push(m.reason);
      activeIndicators.push(m.name);
    });

    // Also add ATR info
    if (atr && atr.value) activeIndicators.push(`ATR(${atr.value.toFixed(4)})`);

    const normalizedScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    const confidence = Math.min(Math.round((Math.abs(normalizedScore) / 100) * 100), 100);
    const modulesAgreeing = Math.max(calls, puts);

    let signal = 'NEUTRAL';
    if (confidence >= this.config.minConfidence && modulesAgreeing >= this.config.minModulesAgreeing) {
      signal = normalizedScore > 0 ? 'CALL' : 'PUT';
    }

    const trend = Indicators.determineTrend(prices);

    return {
      success: true,
      signal,
      confidence,
      trend,
      score: normalizedScore,
      callCount: calls,
      putCount: puts,
      modulesAgreeing,
      reasons: reasons.slice(0, 8),
      activeIndicators: [...new Set(activeIndicators)],
      latestPrice: prices[prices.length - 1],
      analysisTime: new Date().toISOString()
    };
  }
}

module.exports = StrategyEngine;
