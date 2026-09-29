# 12: All-Prizes Inverted Index Data Module

**What to build:** A compact client-side data module `all-prizes-data.js` containing an inverted index of all 6-digit winning numbers (1st, Nearby, 2nd, 3rd, 4th, 5th) across 428 historical draws (over 50,000 unique winning numbers), enabling $O(1)$ client-side lifetime ticket verification.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Extract and normalize all winning tiers from historical archive
- [ ] Build compact inverted index `{ draws: [...], hits: { "077335": [[drawId, tierId], ...] } }`
- [ ] Save to `all-prizes-data.js` exposed as `window.ALL_PRIZES_DATA`
- [ ] Verify data integrity and instant lookup speed
