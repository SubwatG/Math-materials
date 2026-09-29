# 05: Monte Carlo Simulator & Educational Fallacy Debunker

**What to build:** An interactive Monte Carlo simulation engine that models purchasing Thai lottery tickets over time, graphing cumulative P&L against the theoretical expected value line ($E[X] = -75\%$), alongside an educational note that debunks the Gambler's Fallacy with mathematical rigor.

**Blocked by:** 04: Data Filtering, Sorting Table & CSV Export

**Status:** ready-for-agent

- [ ] Simulation input controls: Ticket cost (80 or 100 THB), strategy (Fixed single number vs Random number each draw), simulation duration (1 to 25 years)
- [ ] Canvas-based responsive interactive chart rendering cumulative profit/loss trajectory over draws
- [ ] Overlay theoretical expected value line ($E[X] = \text{draws} \times (\text{prize} \times 0.01 - \text{cost})$)
- [ ] Academic Callout section explaining the Gambler's Fallacy and why $P(A_t | A_{t-1}, \dots) = P(A_t) = 0.01$
