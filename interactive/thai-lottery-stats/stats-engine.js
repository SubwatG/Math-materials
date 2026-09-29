/**
 * stats-engine.js
 * Analytical calculations and statistical testing for Thai 2-digit lottery data
 */

(function (window) {
    'use strict';

    const StatsEngine = {
        /**
         * Computes frequency counts for 00-99 and marginal distributions for tens and units.
         */
        computeFrequencies: function (data) {
            const counts = {};
            for (let i = 0; i < 100; i++) {
                const key = i.toString().padStart(2, '0');
                counts[key] = 0;
            }

            const tens = new Array(10).fill(0);
            const units = new Array(10).fill(0);

            data.forEach(item => {
                const num = item.num.padStart(2, '0');
                if (counts[num] !== undefined) {
                    counts[num]++;
                }
                const t = parseInt(num[0], 10);
                const u = parseInt(num[1], 10);
                if (!isNaN(t)) tens[t]++;
                if (!isNaN(u)) units[u]++;
            });

            return {
                counts: counts,
                tens: tens,
                units: units,
                total: data.length
            };
        },

        /**
         * Computes Chi-square goodness-of-fit test against Discrete Uniform Distribution U{0, 99}.
         */
        computeChiSquare: function (data) {
            const n = data.length;
            if (n === 0) {
                return { chi2: 0, df: 99, pValue: 1, expected: 0, isUniform: true };
            }

            const freq = this.computeFrequencies(data);
            const expected = n / 100.0;
            let chi2 = 0;

            for (let i = 0; i < 100; i++) {
                const key = i.toString().padStart(2, '0');
                const obs = freq.counts[key] || 0;
                chi2 += Math.pow(obs - expected, 2) / expected;
            }

            const df = 99;
            // Wilson-Hilferty approximation for Chi-square p-value
            const z = (Math.pow(chi2 / df, 1 / 3) - (1 - 2 / (9 * df))) / Math.sqrt(2 / (9 * df));
            // Complementary error function approximation
            const pValue = this._approxErfc(z / Math.SQRT2) * 0.5;

            return {
                chi2: parseFloat(chi2.toFixed(4)),
                df: df,
                expected: parseFloat(expected.toFixed(2)),
                pValue: parseFloat(Math.max(0, Math.min(1, pValue)).toFixed(4)),
                isUniform: pValue >= 0.05
            };
        },

        /**
         * Computes gap intervals between winning occurrences of a specific 2-digit number.
         */
        computeGaps: function (data, targetNum) {
            const formattedTarget = targetNum.toString().padStart(2, '0');
            // Data is ordered newest first in original archive
            // We sort chronologically for interval analysis:
            const chronological = data.slice().reverse();
            const indices = [];
            const occurrences = [];

            chronological.forEach((item, index) => {
                if (item.num === formattedTarget) {
                    indices.push(index);
                    occurrences.push({
                        drawIndex: index + 1,
                        date: item.date,
                        month: item.month,
                        year: item.year
                    });
                }
            });

            const gaps = [];
            for (let i = 1; i < indices.length; i++) {
                gaps.push(indices[i] - indices[i - 1]);
            }

            const totalDraws = chronological.length;
            const lastOccurrenceIndex = indices.length > 0 ? indices[indices.length - 1] : -1;
            const currentGap = lastOccurrenceIndex >= 0 ? (totalDraws - 1) - lastOccurrenceIndex : totalDraws;

            const avgGap = gaps.length > 0 ? (gaps.reduce((a, b) => a + b, 0) / gaps.length) : null;
            const maxGap = gaps.length > 0 ? Math.max(...gaps) : null;
            const minGap = gaps.length > 0 ? Math.min(...gaps) : null;

            return {
                targetNum: formattedTarget,
                count: occurrences.length,
                occurrences: occurrences.reverse(), // newest first for display
                gaps: gaps,
                currentGap: currentGap,
                averageGap: avgGap ? parseFloat(avgGap.toFixed(1)) : null,
                maxGap: maxGap,
                minGap: minGap
            };
        },

        /**
         * Runs a Monte Carlo simulation over a given number of draws.
         */
        runMonteCarlo: function (options) {
            const draws = options.draws || 240; // e.g. 10 years * 24 draws/year
            const ticketCost = options.ticketCost || 80;
            const prizeAmount = options.prizeAmount || 2000;
            const strategy = options.strategy || 'fixed'; // 'fixed' or 'random'
            const fixedTarget = (options.targetNum !== undefined) ? options.targetNum.toString().padStart(2, '0') : '79';

            let balance = 0;
            const trajectory = [];
            const expectedValuePerDraw = (prizeAmount * 0.01) - ticketCost; // -60 for 80 THB ticket

            let wins = 0;

            for (let t = 1; t <= draws; t++) {
                balance -= ticketCost;
                const drawn = Math.floor(Math.random() * 100).toString().padStart(2, '0');
                const myPick = (strategy === 'fixed') 
                    ? fixedTarget 
                    : Math.floor(Math.random() * 100).toString().padStart(2, '0');

                if (drawn === myPick) {
                    balance += prizeAmount;
                    wins++;
                }

                const expectedBalance = t * expectedValuePerDraw;

                trajectory.push({
                    draw: t,
                    balance: balance,
                    expected: expectedBalance,
                    isWin: drawn === myPick
                });
            }

            return {
                trajectory: trajectory,
                finalBalance: balance,
                totalSpent: draws * ticketCost,
                totalWon: wins * prizeAmount,
                totalWins: wins,
                winRate: parseFloat((wins / draws * 100).toFixed(2)),
                theoreticalExpectedBalance: draws * expectedValuePerDraw
            };
        },

        /**
         * High-accuracy complementary error function approximation
         */
        _approxErfc: function (x) {
            // Abramowitz and Stegun approximation formula 7.1.26
            const a1 = 0.254829592;
            const a2 = -0.284496736;
            const a3 = 1.421413741;
            const a4 = -1.453152027;
            const a5 = 1.061405429;
            const p = 0.3275911;

            const sign = x < 0 ? -1 : 1;
            const absX = Math.abs(x);
            const t = 1.0 / (1.0 + p * absX);
            const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

            return sign === 1 ? (1.0 - y) : (1.0 + y);
        }
    };

    window.StatsEngine = StatsEngine;
})(window);
