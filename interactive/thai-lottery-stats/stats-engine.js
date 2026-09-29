/**
 * stats-engine.js
 * Analytical calculations and statistical testing for Thai 2-digit, 3-digit, 1st prize, and all-tier lottery data
 */

(function (window) {
    'use strict';

    const StatsEngine = {
        /* =========================================================================
         * 2-DIGIT PRIZE ANALYTICS (00 - 99)
         * ========================================================================= */

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

        compute1stPrizeStats: function (data) {
            const valid = data.filter(d => d.p1 && d.p1.toString().length === 6);
            const n = valid.length;
            if (n === 0) return null;

            const sumFreq = new Array(55).fill(0);
            let sumTotal = 0;
            const digitSums = [];

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

        search1stPrize: function (data, query) {
            const q = (query || '').trim();
            if (!q) return [];
            return data.filter(d => d.p1 && d.p1.toString().includes(q));
        },

        /* =========================================================================
         * ALL-PRIZES ARCHITECTURE & 20-YEAR LIFETIME CHECKER
         * ========================================================================= */

        getPrizeArchitecture: function () {
            return {
                tiers: [
                    { name: 'รางวัลที่ 1', count: 1, prize: 6000000, prob: '1/1,000,000 (0.0001%)', totalAmt: 6000000, desc: 'ตรงทั้ง 6 หลัก' },
                    { name: 'ข้างเคียงรางวัลที่ 1', count: 2, prize: 100000, prob: '2/1,000,000 (0.0002%)', totalAmt: 200000, desc: 'มากกว่า/น้อยกว่ารางวัลที่ 1 หนึ่งหลัก' },
                    { name: 'รางวัลที่ 2', count: 5, prize: 200000, prob: '5/1,000,000 (0.0005%)', totalAmt: 1000000, desc: 'ตรงทั้ง 6 หลัก (หมุน 5 ครั้ง)' },
                    { name: 'รางวัลที่ 3', count: 10, prize: 80000, prob: '10/1,000,000 (0.0010%)', totalAmt: 800000, desc: 'ตรงทั้ง 6 หลัก (หมุน 10 ครั้ง)' },
                    { name: 'รางวัลที่ 4', count: 50, prize: 40000, prob: '50/1,000,000 (0.0050%)', totalAmt: 2000000, desc: 'ตรงทั้ง 6 หลัก (หมุน 50 ครั้ง)' },
                    { name: 'รางวัลที่ 5', count: 100, prize: 20000, prob: '100/1,000,000 (0.0100%)', totalAmt: 2000000, desc: 'ตรงทั้ง 6 หลัก (หมุน 100 ครั้ง)' },
                    { name: 'รางวัลเลขหน้า 3 ตัว', count: 2000, prize: 4000, prob: '2/1,000 (0.2000%)', totalAmt: 8000000, desc: 'ตรงกับ 3 ตัวหน้า (หมุน 2 ครั้ง)' },
                    { name: 'รางวัลเลขท้าย 3 ตัว', count: 2000, prize: 4000, prob: '2/1,000 (0.2000%)', totalAmt: 8000000, desc: 'ตรงกับ 3 ตัวท้าย (หมุน 2 ครั้ง)' },
                    { name: 'รางวัลเลขท้าย 2 ตัว', count: 10000, prize: 2000, prob: '1/100 (1.0000%)', totalAmt: 20000000, desc: 'ตรงกับ 2 ตัวท้าย (หมุน 1 ครั้ง)' }
                ],
                totalTickets: 1000000,
                totalWinningTickets: 14168,
                totalPrizePayout: 48000000,
                ticketPriceStatutory: 80,
                payoutRatio: 60.0,
                winAnyProbability: 0.014168,
                loseProbability: 0.985832,
                expectedValue80: -32.0,
                expectedValue100: -52.0
            };
        },

        checkLifetimeTicket: function (ticketStr) {
            const clean = (ticketStr || '').toString().trim();
            if (clean.length !== 6 || !/^\d{6}$/.test(clean)) return null;

            const allData = window.ALL_PRIZES_DATA;
            if (!allData || !allData.draws) return null;

            const draws = allData.draws;
            const hits = allData.hits[clean] || [];

            const tierInfo = {
                1: { name: 'รางวัลที่ 1', prize: 6000000 },
                2: { name: 'รางวัลที่ 2', prize: 200000 },
                3: { name: 'รางวัลที่ 3', prize: 80000 },
                4: { name: 'รางวัลที่ 4', prize: 40000 },
                5: { name: 'รางวัลที่ 5', prize: 20000 },
                6: { name: 'ข้างเคียงรางวัลที่ 1', prize: 100000 }
            };

            const events = [];
            let totalWon = 0;

            hits.forEach(h => {
                const drawId = h[0];
                const tier = h[1];
                const d = draws[drawId];
                const info = tierInfo[tier] || { name: 'รางวัลพิเศษ', prize: 0 };
                totalWon += info.prize;
                events.push({
                    drawDate: d.d + ' ' + d.m + ' ' + d.y,
                    tierName: info.name,
                    prize: info.prize,
                    matchedNumber: clean
                });
            });

            const sub2 = clean.slice(-2);
            const pre3 = clean.slice(0, 3);
            const sub3 = clean.slice(-3);

            draws.forEach(d => {
                if (d.p2 === sub2) {
                    totalWon += 2000;
                    events.push({
                        drawDate: d.d + ' ' + d.m + ' ' + d.y,
                        tierName: 'รางวัลเลขท้าย 2 ตัว',
                        prize: 2000,
                        matchedNumber: sub2
                    });
                }
                if (d.pre3 && d.pre3.includes(pre3)) {
                    totalWon += 4000;
                    events.push({
                        drawDate: d.d + ' ' + d.m + ' ' + d.y,
                        tierName: 'รางวัลเลขหน้า 3 ตัว',
                        prize: 4000,
                        matchedNumber: pre3
                    });
                }
                if (d.sub3 && d.sub3.includes(sub3)) {
                    totalWon += 4000;
                    events.push({
                        drawDate: d.d + ' ' + d.m + ' ' + d.y,
                        tierName: 'รางวัลเลขท้าย 3 ตัว',
                        prize: 4000,
                        matchedNumber: sub3
                    });
                }
            });

            const totalDraws = draws.length;
            const totalSpent80 = totalDraws * 80;
            const netBalance80 = totalWon - totalSpent80;

            return {
                ticket: clean,
                totalDraws: totalDraws,
                totalWon: totalWon,
                totalSpent: totalSpent80,
                netBalance: netBalance80,
                events: events.reverse()
            };
        },

        getTierTopNumbers: function (tierId) {
            const allData = window.ALL_PRIZES_DATA;
            if (!allData || !allData.hits) return [];

            const list = [];
            const tierNum = (tierId === 'all') ? null : parseInt(tierId, 10);

            for (const [num, hits] of Object.entries(allData.hits)) {
                let matchedHits = hits;
                if (tierNum !== null) {
                    matchedHits = hits.filter(h => h[1] === tierNum);
                }
                if (matchedHits.length > 0) {
                    list.push({
                        num: num,
                        count: matchedHits.length,
                        hits: matchedHits
                    });
                }
            }

            list.sort((a, b) => b.count - a.count);
            return list;
        },

        getHotPicks: function () {
            return [
                { num: '146823', category: 'Hall of Fame', desc: 'เคยถูกรางวัลถึง 3 ครั้ง (รางวัลที่ 5 สองครั้ง, รางวัลที่ 2 หนึ่งครั้ง)' },
                { num: '474510', category: 'Hall of Fame', desc: 'เคยถูกรางวัลถึง 3 ครั้ง (รางวัลที่ 2 หนึ่งครั้ง, รางวัลที่ 5 สองครั้ง)' },
                { num: '462934', category: 'Hall of Fame', desc: 'เคยถูกรางวัลถึง 3 ครั้ง (รางวัลที่ 4 สองครั้ง, ข้างเคียงหนึ่งครั้ง)' },
                { num: '943945', category: 'Hall of Fame', desc: 'เคยถูกรางวัลถึง 3 ครั้ง (รางวัลที่ 5 หนึ่งครั้ง, รางวัลที่ 4 สองครั้ง)' },
                { num: '110442', category: 'Hall of Fame', desc: 'เคยถูกรางวัลถึง 3 ครั้ง (รางวัลที่ 5 สองครั้ง, ข้างเคียงหนึ่งครั้ง)' },
                { num: '413163', category: 'Hall of Fame', desc: 'เคยถูกรางวัลที่ 5 ถึง 3 ครั้ง' },
                { num: '475398', category: 'Hall of Fame', desc: 'เคยถูกรางวัลถึง 3 ครั้ง (รางวัลที่ 4 สองครั้ง, รางวัลที่ 5 หนึ่งครั้ง)' },
                { num: '124263', category: 'Hall of Fame', desc: 'เคยถูกรางวัลถึง 3 ครั้ง (รางวัลที่ 5 หนึ่งครั้ง, รางวัลที่ 4 สองครั้ง)' },
                { num: '309592', category: 'Hall of Fame', desc: 'เคยถูกรางวัลที่ 5 ถึง 3 ครั้ง' },
                { num: '856786', category: 'Hall of Fame', desc: 'เคยถูกรางวัลถึง 3 ครั้ง (รางวัลที่ 5 สองครั้ง, รางวัลที่ 4 หนึ่งครั้ง)' },
                { num: '226006', category: 'Positional Top', desc: 'ประกอบจากเลขโดดแชมป์ความถี่สูงสุดในแต่ละหลัก (แสน-หน่วย)' },
                { num: '963875', category: 'Positional Top', desc: 'ประกอบจากเลขโดดอันดับ 2 ของแต่ละหลัก' },
                { num: '100419', category: 'Positional Top', desc: 'ประกอบจากเลขโดดอันดับ 3 ของแต่ละหลัก' },
                { num: '223806', category: 'Positional Top', desc: 'ผสมผสานหลักแสน-หมื่นยอดนิยมเข้ากับหลักหน่วยยอดนิยม' },
                { num: '926415', category: 'Positional Top', desc: 'ผสมผสานเลขโดดความถี่สูงสุด 6 หลัก' },
                { num: '290079', category: 'Prefix/Suffix', desc: 'เลขหน้า 3 ตัวแชมป์ (290) + เลขท้าย 2 ตัวแชมป์ (79)' },
                { num: '742085', category: 'Prefix/Suffix', desc: 'เลขหน้า 3 ตัวแชมป์ (742) + เลขท้าย 2 ตัวแชมป์ (85)' },
                { num: '290092', category: 'Prefix/Suffix', desc: 'เลขหน้า 3 ตัวแชมป์ (290) + เลขท้าย 2 ตัวแชมป์ (92)' },
                { num: '742014', category: 'Prefix/Suffix', desc: 'เลขหน้า 3 ตัวแชมป์ (742) + เลขท้าย 2 ตัวแชมป์ (14)' },
                { num: '060064', category: 'Prefix/Suffix', desc: 'เลขหน้า 3 ตัวแชมป์ (060) + เลขท้าย 2 ตัวแชมป์ (64)' }
            ];
        },

        generateRandom20: function () {
            const list = [];
            for (let i = 0; i < 20; i++) {
                const rand = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
                const stats = this.checkLifetimeTicket(rand);
                list.push({
                    num: rand,
                    stats: stats
                });
            }
            return list;
        },

        runHotPicksBacktest: function () {
            const picks = this.getHotPicks().map(p => p.num);
            const allData = window.ALL_PRIZES_DATA;
            if (!allData || !allData.draws) return null;

            const draws = allData.draws;
            const totalDraws = draws.length;
            const totalTickets = totalDraws * picks.length;
            const totalSpent = totalTickets * 80;
            let totalWon = 0;
            let totalHits = 0;

            const tierPrizes = { 1: 6000000, 2: 200000, 3: 80000, 4: 40000, 5: 20000, 6: 100000 };

            picks.forEach(t => {
                const hits = allData.hits[t] || [];
                hits.forEach(h => {
                    const tier = h[1];
                    totalWon += (tierPrizes[tier] || 0);
                    totalHits++;
                });

                const sub2 = t.slice(-2);
                const pre3 = t.slice(0, 3);
                const sub3 = t.slice(-3);

                draws.forEach(d => {
                    if (d.p2 === sub2) { totalWon += 2000; totalHits++; }
                    if (d.pre3 && d.pre3.includes(pre3)) { totalWon += 4000; totalHits++; }
                    if (d.sub3 && d.sub3.includes(sub3)) { totalWon += 4000; totalHits++; }
                });
            });

            return {
                totalDraws: totalDraws,
                totalTickets: totalTickets,
                totalSpent: totalSpent,
                totalWon: totalWon,
                netBalance: totalWon - totalSpent,
                returnRate: parseFloat(((totalWon - totalSpent) / totalSpent * 100).toFixed(2)),
                totalHits: totalHits
            };
        },

        /* =========================================================================
         * MONTE CARLO SIMULATOR
         * ========================================================================= */

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
