# Deepforge prototype

A standalone, framework-free HTML5 prototype for the mining loop:

`mine -> pick up ore -> clear bonus veins -> sell -> upgrade -> unlock new areas -> master the Ember Pickaxe -> open Starfall Depths -> choose a Starforge specialization`

## Controls

- Desktop: `WASD` / arrow keys to move, hold `Space` to mine, `E` to interact.
- Mobile: left joystick to move, hold the `MINE` button to swing.
- Walk near the Assay Cart, Forge, or sealed gate to reveal their action.

## Run locally

From this directory:

```powershell
python -m http.server 4180 --bind 0.0.0.0
```

Open `http://127.0.0.1:4180` on the same computer.

## Prototype scope

- One continuous world with four visually distinct areas.
- Stone, copper, Moonglass, armored Emberstone, Astralite, and four valuable rare veins.
- Five pickaxe tiers with stronger damage and faster swings.
- Emberstone shells that can be ground down normally or cracked quickly with precision strikes.
- Four timed bonus veins that reward clearing a full connected cluster quickly.
- Broken ore now bursts onto the ground, settles physically, and must be collected by walking over it. Uncollected ore fades after five minutes.
- Ember Pickaxe requires 12 lifetime Emberstone mined plus 650 gold.
- Five Ember Mastery ranks extend progression after the final pickaxe. Each rank needs gold plus a lifetime Sunslag milestone, then grants higher power, swing speed, shell penetration, precision frequency, and bonus yield.
- Damage left over after breaking an armored shell now carries into the ore core, so stronger pickaxes never waste their extra power at the shell boundary.
- Ember Mastery 5 opens the Starfall Master Seal and reveals Starfall Depths, armored Astralite, rare Crownstone, and the Starfall Lattice.
- The Starforge consumes Astralite and Crownstone to unlock three swappable endgame styles: the heavy Astral Crusher, rapid Comet Edge, and high-yield Crownseeker.
- Three visible rock-damage stages and optional timing-based precision strikes.
- A five-step Mining Focus streak for accurate active play.
- Animated resource selling with a smooth gold count-up.
- Local browser save.
- No framework or external runtime dependency.
