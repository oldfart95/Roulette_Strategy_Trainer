export function getHelpContent() {
  return `
    <section class="help-section">
      <h2>How To Use The Simulator</h2>
      <div class="help-grid">
        <article>
          <h3>Selecting Chips</h3>
          <p>Choose a chip from the palette to set your default stake. Tap mode places that value with one click on any valid betting region. Drag mode lets you pick up the selected chip and drop it onto highlighted targets.</p>
        </article>
        <article>
          <h3>Dragging Bets</h3>
          <p>In drag mode, hold the chip button and move across the table. Valid regions glow on hover, including splits, corners, streets, six lines, dozens, columns, and even-money bets. Drop to place a chip with that denomination.</p>
        </article>
        <article>
          <h3>Fast Tap Placement</h3>
          <p>Tap mode is tuned for repeated study play. Select a stake, then click numbers, borders, or outside fields to add chips quickly.</p>
        </article>
        <article>
          <h3>Undo, Clear, Repeat</h3>
          <p><strong>Undo</strong> removes the latest chip placement, <strong>Clear</strong> refunds all current bets, <strong>Repeat</strong> duplicates the current layout, and <strong>Rebet</strong> restores the most recently completed layout.</p>
        </article>
        <article>
          <h3>Spin Workflow</h3>
          <p>When you spin, the winning number is sampled immediately using secure browser randomness. Inputs lock during the animation, the ball settles honestly onto the preselected result, payouts resolve, and the stats engine updates.</p>
        </article>
        <article>
          <h3>Stats Views</h3>
          <p>The main stats panel is a quick-glance session dashboard. The advanced tab goes deeper with number frequencies, rolling samples, streak breakdowns, hot/cold descriptive views, and return by bet type.</p>
        </article>
      </div>
    </section>
    <section class="help-section">
      <h2>Roulette Basics</h2>
      <div class="help-grid">
        <article>
          <h3>European Roulette</h3>
          <p>European single-zero roulette is the default. It has 37 possible outcomes: 0 through 36. American double-zero mode is available for comparison and has 38 outcomes: 0, 00, and 1 through 36.</p>
        </article>
        <article>
          <h3>Inside Bets</h3>
          <p>Inside bets cover specific number groupings on the number layout. Straight-up, split, street, corner, and six-line bets all offer higher payouts in exchange for lower hit frequency.</p>
        </article>
        <article>
          <h3>Outside Bets</h3>
          <p>Outside bets cover broader categories such as red or black, odd or even, low or high, dozens, and columns. They hit more often, but their payouts are lower.</p>
        </article>
        <article>
          <h3>Payout Reference</h3>
          <ul class="reference-list">
            <li>Straight up: 35:1</li>
            <li>Split: 17:1</li>
            <li>Street: 11:1</li>
            <li>Corner: 8:1</li>
            <li>Six line: 5:1</li>
            <li>Dozen: 2:1</li>
            <li>Column: 2:1</li>
            <li>Straight 00 in American mode: 35:1</li>
            <li>Red / Black: 1:1</li>
            <li>Odd / Even: 1:1</li>
            <li>Low / High: 1:1</li>
          </ul>
        </article>
      </div>
    </section>
    <section class="help-section">
      <h2>Fair Play And RNG</h2>
      <div class="help-grid">
        <article>
          <h3>Every Spin Is Independent</h3>
          <p>Each result is sampled fresh. Previous spins do not influence the next one, and the simulator does not attempt to manufacture streaks, reversals, or "due" outcomes.</p>
        </article>
        <article>
          <h3>Fixed Probabilities</h3>
          <p>The probabilities are those of the selected fair wheel. A straight-up number has a 1 in 37 chance in European mode and a 1 in 38 chance in American mode; red or black wins 18 pockets on either wheel.</p>
        </article>
        <article>
          <h3>Secure Random Generation</h3>
          <p>The outcome uses <code>window.crypto.getRandomValues</code> with rejection sampling to avoid modulo bias. The winning result is determined before the animation begins, and the wheel simply reveals that honest result.</p>
        </article>
        <article>
          <h3>Simulator Boundaries</h3>
          <p>This is an educational simulator only. It has no real money, no prizes, and no fake near-miss or adaptive outcome behavior.</p>
        </article>
        <article>
          <h3>House Edge</h3>
          <p>The negative expectation comes naturally from the zero pockets. European roulette has a house edge of about 2.70%; American roulette has a house edge of about 5.26%. No weighting, adaptation, hot/cold rigging, or player-specific manipulation is present.</p>
        </article>
      </div>
    </section>
    <section class="help-section">
      <h2>Strategy Guide</h2>
      <div class="strategy-stack">
        <article><h3>Flat Betting On Outside Bets</h3><p><strong>What it is:</strong> Staking the same amount each spin on red/black, odd/even, or low/high.</p><p><strong>When people use it:</strong> Long, lower-volatility sessions with predictable exposure.</p><p><strong>Strengths:</strong> Simple and easy to benchmark.</p><p><strong>Weaknesses:</strong> No protection from long negative drift.</p><p><strong>Risk profile:</strong> Lower variance than inside play, but still negative expectation.</p></article>
        <article><h3>Flat Betting On Dozens Or Columns</h3><p><strong>What it is:</strong> Repeating a constant stake on one or more dozen or column sections.</p><p><strong>When people use it:</strong> Sessions that want more movement than even-money bets without straight-up volatility.</p><p><strong>Strengths:</strong> Flexible 2:1 structure.</p><p><strong>Weaknesses:</strong> Miss runs remain normal and sometimes longer than expected.</p><p><strong>Risk profile:</strong> Moderate variance.</p></article>
        <article><h3>Straight-Up Hunting For Variance Lovers</h3><p><strong>What it is:</strong> Repeated single-number stakes.</p><p><strong>When people use it:</strong> Short high-variance tests and number tracking exercises.</p><p><strong>Strengths:</strong> Maximum standard payout.</p><p><strong>Weaknesses:</strong> Long droughts are common and emotionally demanding.</p><p><strong>Risk profile:</strong> Very high variance.</p></article>
        <article><h3>Martingale</h3><p><strong>What it is:</strong> Doubling after each loss, usually on even-money bets.</p><p><strong>Strengths:</strong> Produces many small recoveries.</p><p><strong>Weaknesses:</strong> Table limits and finite bankrolls break the progression quickly.</p><p><strong>Risk profile:</strong> Heavy tail risk. Example: 1, 2, 4, 8, 16, 32, 64.</p></article>
        <article><h3>Reverse Martingale / Paroli</h3><p><strong>What it is:</strong> Increasing stake after wins instead of losses.</p><p><strong>Strengths:</strong> Limits downside to the base unit if the sequence is managed well.</p><p><strong>Weaknesses:</strong> Most streaks end before the ladder grows much.</p><p><strong>Risk profile:</strong> Moderate, with clustered gains during rare win runs.</p></article>
        <article><h3>D'Alembert</h3><p><strong>What it is:</strong> Add one unit after a loss, subtract one after a win.</p><p><strong>Strengths:</strong> Smoother exposure growth than Martingale.</p><p><strong>Weaknesses:</strong> Recovery is slow and prolonged losses still push stake size higher.</p><p><strong>Risk profile:</strong> Moderate.</p></article>
        <article><h3>Fibonacci</h3><p><strong>What it is:</strong> Following the Fibonacci sequence after losses, stepping back after wins.</p><p><strong>Strengths:</strong> More gradual than doubling systems.</p><p><strong>Weaknesses:</strong> Exposure still becomes substantial during bad stretches.</p><p><strong>Risk profile:</strong> Moderate to high.</p></article>
        <article><h3>Labouchere</h3><p><strong>What it is:</strong> A cancellation system based on a target profit sequence.</p><p><strong>Strengths:</strong> Structured and visually easy to track.</p><p><strong>Weaknesses:</strong> Sequence inflation can become severe during losing periods.</p><p><strong>Risk profile:</strong> High when variance persists.</p></article>
        <article><h3>Oscar's Grind</h3><p><strong>What it is:</strong> Increasing after wins while aiming for one unit per series.</p><p><strong>Strengths:</strong> Gentler than many recovery systems.</p><p><strong>Weaknesses:</strong> Still no edge, and long losses still hurt.</p><p><strong>Risk profile:</strong> Moderate.</p></article>
        <article><h3>Constant Stake Vs Variable Stake</h3><p>Constant stakes make variance easier to study. Variable staking can reshape session path and drawdown timing, but not expected value.</p></article>
        <article><h3>Stop-Loss And Stop-Win Discipline</h3><p>Session limits can help preserve emotional control and analytical discipline. They are management tools, not expectation-changing tools.</p></article>
        <article><h3>Bankroll Segmentation</h3><p>Breaking a bankroll into smaller session units can improve pacing and prevent oversized recovery attempts during normal variance.</p></article>
        <article><h3>Why Streak Chasing Does Not Alter Probabilities</h3><p>Runs happen naturally in random samples. A streak does not change the probability of the next independent spin.</p></article>
        <article><h3>Hot Numbers Are Descriptive, Not Predictive</h3><p>Hot and cold displays describe the observed sample. They do not forecast future fair-wheel outcomes.</p></article>
        <article><h3>Sober Expectation Note</h3><p>No betting progression overcomes the fixed negative expectation of fair European roulette. Systems change variance, not long-run edge.</p></article>
      </div>
    </section>
  `;
}
