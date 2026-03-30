# Findings & Decisions

## Requirements
<!-- Captured from user request -->
- Create a one-page HTML + JavaScript implementation
- Follow the exact game rules from guide.md
- Game is Dungeon Solitaire: Tomb of Four Kings (a single-player fantasy card game, not traditional poker)
- Use a standard 52-card deck plus one joker

## Game Rules Summary from guide.md
- **Deck composition:** 52 cards + 1 joker
  - 2-10♠ = Monsters
  - 2-10♦ = Traps / Treasure
  - 2-10♣ = Sealed Doors
  - J♠ = Go Berserk (defeats any monster)
  - J♦ = Disarm Mechanism (disables any trap)
  - J♣ = Pick Lock (opens any door)
  - J♥ = Dodge Blow (avoids one damage instance)
  - Q = Divine Favors (automatically wins any encounter)
  - K = Tomb Hoards (treasure worth 10 points each)
  - A = Torches (4th ace = game loss)
  - Joker = Scroll of Light (can negate one 4th torch)
  - 2-10♥ = Hit Points (stacked with 10 on top)

- **Board Layout:**
  - Top: Torch area
  - Middle: Dungeon area with Delve (left-to-right) and Retreat (right-to-left) rows
  - Bottom: Discard area, Hit Point counter, Player hand

- **Core Mechanics:**
  - Each turn: draw until encounter card appears (first encounter of turn)
  - Resolve encounter by playing cards from deck or hand
  - Must defeat encounter to collect treasure
  - Hit points: flip cards when damaged; 2♥ flipped = death
  - 4 torches played = game loss (unless Scroll of Light used)
  - Delve: left-to-right going deeper
  - Retreat: right-to-left under delve turns
  - Win by reaching exit alive with all 4 kings (or just survive for score)

- **Scoring:**
  - Each king = 10 points
  - 2-10♦ = face value
  - Scroll of Light = 6 points (if unused)
  - Win if you collect all 4 kings and escape

## Research Findings
<!-- Key discoveries during exploration -->
- This is not actually poker - it's a unique solitaire game with fantasy theme
- All rules are well-documented in guide.md including a complete walkthrough
- Requires careful implementation of different encounter resolutions:
  - Monsters: can keep playing until success or escape via treasure drop
  - Traps: only one chance to disarm
  - Doors: only one chance with action card, then Pick Lock can be used

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Single HTML file with embedded CSS and JS | User requested "one page", easier to distribute and play |
| CSS-rendered cards | No external image dependencies, works offline |
| Responsive design | Should work on desktop and mobile |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
|       |            |

## Resources
<!-- URLs, file paths, API references -->
- guide.md: /home/halida/data/temp/DUNGEON SOLITAIRE/guide.md - complete rules with walkthrough

## Visual/Browser Findings
<!-- CRITICAL: Update after every 2 view/browser operations -->
-

---
*Update this file after every 2 view/browser/search operations*
*This prevents visual information from being lost*
