# 13: All-Prizes Engine & Probability Architecture

**What to build:** An analytical engine within `stats-engine.js` implementing the 9-tier prize architecture (counts, prizes, probabilities, statutory 60% payout ratio, expected value $E[X] = -32$ THB) and a 6-digit historical checker scanning 20 years of draws.

**Blocked by:** 12: All-Prizes Inverted Index Data Module

**Status:** ready-for-agent

- [ ] Implement `StatsEngine.getPrizeArchitecture()` returning the mathematical 9-tier table
- [ ] Implement `StatsEngine.checkLifetimeTicket(ticketStr)` evaluating 6-digit exact matches (1st-5th, nearby) and 2D/3D substring matches across the master draw history
- [ ] Return total monetary winnings, number of times won per tier, and detailed occurrence list
