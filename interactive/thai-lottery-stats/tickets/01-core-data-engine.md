# 01: Core Data Module & Analytical Engine

**What to build:** An embedded, zero-dependency data module containing all 565 historical draws (B.E. 2543-2567) of Thai 2-digit lottery results, accompanied by a pure mathematical analytics engine that computes frequencies, intervals, Chi-square goodness-of-fit test statistic, and exact p-value.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Embed 565 historical draws with schema `{ date: number, month: string, year: number, num: string }` into `lottery-data.js`
- [ ] Implement `StatsEngine.computeChiSquare(data)` returning test statistic, df=99, p-value, and conclusion
- [ ] Implement `StatsEngine.computeFrequencies(data)` for 00-99 and marginal digits (tens and units)
- [ ] Implement `StatsEngine.computeGaps(data, num)` returning occurrence dates and draw intervals
- [ ] Automated verification script confirming numeric parity with Python's scipy.stats
