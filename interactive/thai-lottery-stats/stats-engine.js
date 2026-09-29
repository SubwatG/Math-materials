/**
 * stats-engine.js
 * Analytical calculations and statistical testing for Thai 2-digit, 3-digit, and 1st prize (6-digit) lottery data
 */

(function (window) {
    'use strict';

    const StatsEngine = {
        /* =========================================================================
         * 2-DIGIT PRIZE ANALYTICS (00 - 99)
         * ========================================================================= */

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

            let validCount = 0;
            data.forEach(item => {
                const num = (item.num || item.p2 || '').toString().padStart(2, '0');
                if (counts[num] !== undefined) {
                    counts[num]++;
                    validCount++;
                    const t = parseInt(num[0], 10);
                    const u = parseInt(num[1], 10);
                    if (!isNaN(t)) tens[t]++;
                    if (!isNaN(u)) units[u]++;
                }
            });

            return {
                counts: counts,
                tens: tens,
                units: units,
                total: validCount
            };
        },

        /**
         * Computes Chi-square goodness-of-fit test against Discrete Uniform Distribution U{0, 99}.
         */
        computeChiSquare: function (data) {
            const freq = this.computeFrequencies(data);
            const n = freq.total;
            if (n === 0) {
                return { chi2: 0, df: 99, pValue: 1, expected: 0, isUniform: true };
            }

            const expected = n / 100.0;
            let chi2 = 0;

            for (let i = 0; i < 100; i++) {
                const key = i.toString().padStart(2, '0');
                const obs = freq.counts[key] || 0;
                chi2 += Math.pow(obs - expected, 2) / expected;
            }

            const df = 99;
            const z = (Math.pow(chi2 / df, 1 / 3) - (1 - 2 / (9 * df))) / Math.sqrt(2 / (9 * df));
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
            const chronological = data.slice().reverse();
            const indices = [];
            const occurrences = [];

            chronological.forEach((item, index) => {
                const num = (item.num || item.p2 || '').toString().padStart(2, '0');
                if (num === formattedTarget) {
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
                occurrences: occurrences.reverse(),
                gaps: gaps,
                currentGap: currentGap,
                averageGap: avgGap ? parseFloat(avgGap.toFixed(1)) : null,
                maxGap: maxGap,
                minGap: minGap
            };
        },

        /* =========================================================================
         * 3-DIGIT PRIZE ANALYTICS (000 - 999)
         * ========================================================================= */

        /**
         * Computes frequency counts for 000-999 and marginal distributions for hundreds, tens, and units.
         * @param {Array} data
         * @param {string} category 'sub3' (ท้าย 3 ตัว), 'pre3' (หน้า 3 ตัว), or 'all3' (ทั้งหน้าและท้าย)
         */
        compute3DFrequencies: function (data, category) {
            category = category || 'sub3';
            const counts = {};
            for (let i = 0; i < 1000; i++) {
                const key = i.toString().padStart(3, '0');
                counts[key] = 0;
            }

            const hundreds = new Array(10).fill(0);
            const tens = new Array(10).fill(0);
            const units = new Array(10).fill(0);

            let totalDrawsWithData = 0;
            let totalPrizes = 0;

            data.forEach(item => {
                let pool = [];
                if (category === 'sub3') pool = item.sub3 || [];
                else if (category === 'pre3') pool = item.pre3 || [];
                else if (category === 'all3') pool = (item.sub3 || []).concat(item.pre3 || []);

                if (pool.length > 0) {
                    totalDrawsWithData++;
                }

                pool.forEach(nStr => {
                    const clean = nStr.toString().padStart(3, '0');
                    if (counts[clean] !== undefined) {
                        counts[clean]++;
                        totalPrizes++;
                        const h = parseInt(clean[0], 10);
                        const t = parseInt(clean[1], 10);
                        const u = parseInt(clean[2], 10);
                        if (!isNaN(h)) hundreds[h]++;
                        if (!isNaN(t)) tens[t]++;
                        if (!isNaN(u)) units[u]++;
                    }
                });
            });

            return {
                counts: counts,
                hundreds: hundreds,
                tens: tens,
                units: units,
                totalDraws: totalDrawsWithData,
                totalPrizes: totalPrizes
            };
        },

        /**
         * Computes gap intervals and occurrences for a specific 3-digit number.
         */
        compute3DGaps: function (data, target3D, category) {
            category = category || 'sub3';
            const formatted = target3D.toString().padStart(3, '0');
            const chronological = data.slice().reverse();
            const occurrences = [];
            const indices = [];

            chronological.forEach((item, index) => {
                const sub3 = item.sub3 || [];
                const pre3 = item.pre3 || [];

                const inSub = sub3.includes(formatted);
                const inPre = pre3.includes(formatted);

                let matched = false;
                let typeLabel = '';

                if (category === 'sub3' && inSub) {
                    matched = true;
                    typeLabel = 'เลขท้าย 3 ตัว';
                } else if (category === 'pre3' && inPre) {
                    matched = true;
                    typeLabel = 'เลขหน้า 3 ตัว';
                } else if (category === 'all3' && (inSub || inPre)) {
                    matched = true;
                    typeLabel = (inSub && inPre) ? 'ทั้งหน้าและท้าย' : (inSub ? 'เลขท้าย 3 ตัว' : 'เลขหน้า 3 ตัว');
                }

                if (matched) {
                    indices.push(index);
                    occurrences.push({
                        drawIndex: index + 1,
                        date: item.date,
                        month: item.month,
                        year: item.year,
                        type: typeLabel
                    });
                }
            });

            const gaps = [];
            for (let i = 1; i < indices.length; i++) {
                gaps.push(indices[i] - indices[i - 1]);
            }

            const totalDraws = chronological.filter(item => (item.sub3 && item.sub3.length > 0) || (item.pre3 && item.pre3.length > 0)).length;
            const lastOccurrenceIndex = indices.length > 0 ? indices[indices.length - 1] : -1;
            const currentGap = lastOccurrenceIndex >= 0 ? (chronological.length - 1) - lastOccurrenceIndex : totalDraws;

            const avgGap = gaps.length > 0 ? (gaps.reduce((a, b) => a + b, 0) / gaps.length) : null;
            const maxGap = gaps.length > 0 ? Math.max(...gaps) : null;
            const minGap = gaps.length > 0 ? Math.min(...gaps) : null;

            return {
                targetNum: formatted,
                count: occurrences.length,
                occurrences: occurrences.reverse(),
                gaps: gaps,
                currentGap: currentGap,
                averageGap: avgGap ? parseFloat(avgGap.toFixed(1)) : null,
                maxGap: maxGap,
                minGap: minGap
            };
        },

        /* =========================================================================
         * 1ST PRIZE (6-DIGIT) ANALYTICS & CENTRAL LIMIT THEOREM
         * ========================================================================= */

        /**
         * Computes Central Limit Theorem (digit sum), Combinatorial Duplication patterns,
         * consecutive duplicates, and 6-position frequency distributions.
         */
        compute1stPrizeStats: function (data) {
            const valid = data.filter(d => d.p1 && d.p1.toString().length === 6);
            const n = valid.length;
            if (n === 0) return null;

            const sumFreq = new Array(55).fill(0);
            let sumTotal = 0;
            const digitSums = [];

            // 6 positions (0: Hundred-thousands to 5: Units)
            const positions = Array.from({ length: 6 }, () => new Array(10).fill(0));

            const patterns = {
                distinct: 0,
                onePair: 0,
                twoPairs: 0,
                threeKind: 0,
                fullHouse: 0,
                fourPlus: 0
            };

            let consecutiveDuplicates = 0;

            valid.forEach(item => {
                const str = item.p1.toString().padStart(6, '0');
                let s = 0;
                const dCount = {};
                let hasConsec = false;

                for (let i = 0; i < 6; i++) {
                    const digit = parseInt(str[i], 10);
                    s += digit;
                    positions[i][digit]++;
                    dCount[digit] = (dCount[digit] || 0) + 1;
                    if (i < 5 && str[i] === str[i + 1]) {
                        hasConsec = true;
                    }
                }

                sumFreq[s]++;
                sumTotal += s;
                digitSums.push(s);
                if (hasConsec) consecutiveDuplicates++;

                const counts = Object.values(dCount).sort((a, b) => b - a);
                if (counts.length === 6) {
                    patterns.distinct++;
                } else if (counts[0] === 2 && counts[1] === 1) {
                    patterns.onePair++;
                } else if (counts[0] === 2 && counts[1] === 2) {
                    patterns.twoPairs++;
                } else if (counts[0] === 3 && counts[1] === 1) {
                    patterns.threeKind++;
                } else if (counts[0] === 3 && counts[1] === 2) {
                    patterns.fullHouse++;
                } else if (counts[0] >= 4) {
                    patterns.fourPlus++;
                }
            });

            const meanSum = sumTotal / n;
            let varSum = 0;
            digitSums.forEach(s => {
                varSum += Math.pow(s - meanSum, 2);
            });
            const stdSum = Math.sqrt(varSum / n);

            // Chi-Square per position (df = 9)
            const posStats = positions.map(posArray => {
                const expected = n / 10.0;
                let chi2 = 0;
                posArray.forEach(obs => {
                    chi2 += Math.pow(obs - expected, 2) / expected;
                });
                const df = 9;
                const z = (Math.pow(chi2 / df, 1 / 3) - (1 - 2 / (9 * df))) / Math.sqrt(2 / (9 * df));
                const pValue = this._approxErfc(z / Math.SQRT2) * 0.5;
                return {
                    counts: posArray,
                    chi2: parseFloat(chi2.toFixed(2)),
                    pValue: parseFloat(Math.max(0, Math.min(1, pValue)).toFixed(3)),
                    isUniform: pValue >= 0.05
                };
            });

            return {
                totalDraws: n,
                sumDistribution: sumFreq,
                meanSum: parseFloat(meanSum.toFixed(2)),
                stdSum: parseFloat(stdSum.toFixed(2)),
                theoreticalMean: 27.0,
                theoreticalStd: 7.035,
                patterns: {
                    distinct: { count: patterns.distinct, pct: parseFloat((patterns.distinct / n * 100).toFixed(1)), theo: 15.12 },
                    onePair: { count: patterns.onePair, pct: parseFloat((patterns.onePair / n * 100).toFixed(1)), theo: 45.36 },
                    twoPairs: { count: patterns.twoPairs, pct: parseFloat((patterns.twoPairs / n * 100).toFixed(1)), theo: 22.68 },
                    threeKind: { count: patterns.threeKind, pct: parseFloat((patterns.threeKind / n * 100).toFixed(1)), theo: 12.60 },
                    fourPlus: { count: patterns.fullHouse + patterns.fourPlus, pct: parseFloat(((patterns.fullHouse + patterns.fourPlus) / n * 100).toFixed(1)), theo: 4.24 }
                },
                consecutiveDuplicates: {
                    count: consecutiveDuplicates,
                    pct: parseFloat((consecutiveDuplicates / n * 100).toFixed(1)),
                    theo: 40.95
                },
                positions: posStats
            };
        },

        /**
         * Searches 1st prize numbers by full or substring match.
         */
        search1stPrize: function (data, query) {
            const q = (query || '').trim();
            if (!q) return [];
            return data.filter(d => d.p1 && d.p1.toString().includes(q));
        },

        /* =========================================================================
         * MONTE CARLO SIMULATOR
         * ========================================================================= */

        /**
         * Runs a Monte Carlo simulation over a given number of draws.
         */
        runMonteCarlo: function (options) {
            const draws = options.draws || 240;
            const ticketCost = options.ticketCost || 80;
            const prizeAmount = options.prizeAmount || 2000;
            const strategy = options.strategy || 'fixed';
            const fixedTarget = (options.targetNum !== undefined) ? options.targetNum.toString().padStart(2, '0') : '79';

            let balance = 0;
            const trajectory = [];
            const expectedValuePerDraw = (prizeAmount * 0.01) - ticketCost;

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
