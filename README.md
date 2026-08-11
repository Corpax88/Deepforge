# Deepforge prototype

Current build: **Deepforge v0.9.0 - Drill-Gated Progression**

A standalone, framework-free HTML5 prototype for the mining loop:

`dig terrain -> open a tunnel -> reveal hidden ore -> collect it -> sell -> upgrade -> dig deeper`

## Controls

- Desktop: `WASD` / arrow keys to move, hold `Space` to mine, `E` to interact.
- Mobile: left joystick to move, hold the `MINE` button to swing.
- Your latest movement direction aims the pickaxe, so push toward a mine wall while holding mine to carve a tunnel.
- Walk near the Assay Cart, Forge, or sealed gate to reveal their action.

## Run locally

From this directory:

```powershell
python -m http.server 4180 --bind 0.0.0.0
```

Open `http://127.0.0.1:4180` on the same computer.

## Prototype scope

- One continuous world with four visually distinct areas.
- Every mine is now four to five times deeper: aim with movement, hold mine to carve persistent tunnels, and let the camera follow the descent.
- Each mine hides exactly one persistent, randomly placed descent. Break into it to unlock a separate Depth 2 with harder dirt, denser veins and its own tunnels.
- Every Depth 2 now has a permanent Exchange and Drill Forge beside its return shaft.
- Depth 2 uses entirely new local resources: Rootiron and Ambercore, Prismite and Lunacore, Magmaite and Furnace Hearts, or Voidglass and Singularity Cores. Mineable dirt yields Deepstone instead of surface Stone.
- A forged Starforge pickaxe can bootstrap Depth 2, then three permanent drill tiers replace it with much faster mining: Burrower Drill, Pulse Drill, and Deepcore Drill.
- The top objective stays locked to the next permanent progression goal, including exact missing drill materials and gold.
- Sell All automatically protects the materials reserved for the active drill upgrade.
- Drills use their own braced, spinning bore animation and matching HUD controls instead of a pickaxe swing.
- Drill progression now routes back through earlier Depth 2 mines: Burrowsteel in Mossvein requires the Burrower Drill, while Phase Crystal in Moonglass and Infernium in Emberdeep require the Pulse Drill for the final Deepcore upgrade.
- Dirt now uses a stronger contrasting color in every mine so open cave floor and mineable terrain are easy to read on mobile.
- Terrain is generated lazily in compact 16 x 16-cell typed-array chunks and only visible cells are drawn, avoiding one heavy object per rock tile on mobile.
- Deterministic connected ore veins run through the deep terrain in clusters of 4-10 nodes instead of isolated random rocks.
- Buried chambers remain visually concealed until the player breaks through their perimeter, then permanently reveal their name and rare find.
- Every buried chamber now contains a persistent reward: a buried cache, crystal cluster, motherlode, or restorative shrine.
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
- Stronger mining feedback with staged terrain cracks, brief impact weight, material-tuned audio, optional haptics, escalating vein feedback, and discovery/jackpot bursts, without full-screen shake or flashes.
- A five-step Mining Focus streak for accurate active play.
- Animated resource selling with a smooth gold count-up.
- Local browser save.
- No framework or external runtime dependency.
