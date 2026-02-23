import { useMemo, useState } from 'react';
import {
  computeBakeWindow,
  computeStarterBuild,
  computeStarterReady,
  type ProofOption
} from './lib/calculations';
import { dateToTodayMinutes, formatMinutesAsTime, formatTimeWithDay, minutesToDateToday } from './lib/time';

type PlannerTab = 'timeline' | 'amount';
type KittyIllustrationVariant = 'loaf' | 'baguette';

function roundToQuarterHour(date: Date): number {
  const minutes = dateToTodayMinutes(date);
  const rounded = Math.round(minutes / 15) * 15;
  return Math.max(0, Math.min(1425, rounded));
}

function formatGrams(value: number): string {
  return `${value.toFixed(1)}g`;
}

function KittyBreadIllustration({ variant }: { variant: KittyIllustrationVariant }) {
  const loafColor = variant === 'loaf' ? '#f6c287' : '#ebaf67';
  const breadShape = variant === 'loaf' ? 'M30 128 C45 110, 95 108, 114 128 L114 146 L30 146 Z' : 'M22 138 C38 116, 104 116, 122 138 C103 148, 42 149, 22 138 Z';

  return (
    <svg viewBox="0 0 150 170" aria-hidden="true" className="kitty-svg">
      <ellipse cx="75" cy="76" rx="45" ry="39" fill="#fff" stroke="#2f1c2a" strokeWidth="2.5" />
      <circle cx="60" cy="74" r="4.2" fill="#2f1c2a" />
      <circle cx="90" cy="74" r="4.2" fill="#2f1c2a" />
      <ellipse cx="75" cy="84" rx="4.8" ry="3.3" fill="#f7c79c" />
      <line x1="48" y1="80" x2="31" y2="77" stroke="#2f1c2a" strokeWidth="2" />
      <line x1="49" y1="86" x2="30" y2="88" stroke="#2f1c2a" strokeWidth="2" />
      <line x1="101" y1="80" x2="118" y2="77" stroke="#2f1c2a" strokeWidth="2" />
      <line x1="101" y1="86" x2="120" y2="88" stroke="#2f1c2a" strokeWidth="2" />
      <path d="M30 52 L44 38 L47 59 Z" fill="#fff" stroke="#2f1c2a" strokeWidth="2.5" />
      <path d="M102 59 L106 38 L120 52 Z" fill="#fff" stroke="#2f1c2a" strokeWidth="2.5" />

      <circle cx="102" cy="47" r="11" fill="#ff6fa7" />
      <circle cx="118" cy="48" r="11" fill="#ff6fa7" />
      <circle cx="110" cy="52" r="6" fill="#ffd2e6" />

      <path d={breadShape} fill={loafColor} stroke="#8b4d2c" strokeWidth="2.3" />
      <line x1="52" y1="127" x2="59" y2="136" stroke="#8b4d2c" strokeWidth="2.3" />
      <line x1="70" y1="124" x2="77" y2="135" stroke="#8b4d2c" strokeWidth="2.3" />
      <line x1="88" y1="124" x2="95" y2="135" stroke="#8b4d2c" strokeWidth="2.3" />
    </svg>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<PlannerTab>('timeline');
  const [feedMinutesToday, setFeedMinutesToday] = useState<number>(() => roundToQuarterHour(new Date()));
  const [temperatureC, setTemperatureC] = useState<number>(21);
  const [manualReadyAt, setManualReadyAt] = useState<Date | null>(null);
  const [showBakeSection, setShowBakeSection] = useState<boolean>(false);
  const [proofOption, setProofOption] = useState<ProofOption>('none');
  const [desiredStarterG, setDesiredStarterG] = useState<number>(8);

  const feedTime = useMemo(() => minutesToDateToday(feedMinutesToday), [feedMinutesToday]);
  const calculatedStarterReady = useMemo(
    () => computeStarterReady(feedTime, temperatureC),
    [feedTime, temperatureC]
  );

  const starterReadyAt = manualReadyAt ?? calculatedStarterReady;
  const bakeWindow = useMemo(() => computeBakeWindow(starterReadyAt, proofOption), [proofOption, starterReadyAt]);
  const buildBreakdown = useMemo(() => computeStarterBuild(desiredStarterG), [desiredStarterG]);

  const isUsingNow = manualReadyAt !== null;

  return (
    <main className="page-shell">
      <section className="planner-card" aria-label="Sourdough planning tools">
        <header className="card-header">
          <p className="eyebrow">Sourdough Planner</p>
          <h1>Starter + Bake Calculator</h1>
          <p className="lede">Plan starter timing or calculate a feeding build amount from one clean workspace.</p>
        </header>

        <section className="kitty-illustration-row" aria-label="Hello Kitty themed bread illustrations">
          <figure className="kitty-card">
            <KittyBreadIllustration variant="loaf" />
            <figcaption>Kitty loaf prep</figcaption>
          </figure>
          <figure className="kitty-card">
            <KittyBreadIllustration variant="baguette" />
            <figcaption>Kitty bakery mood</figcaption>
          </figure>
        </section>

        <div className="tab-switch" role="tablist" aria-label="Calculator mode">
          <span
            className={activeTab === 'timeline' ? 'tab-glider tab-glider-left' : 'tab-glider tab-glider-right'}
            aria-hidden="true"
          />
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'timeline'}
            className={activeTab === 'timeline' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('timeline')}
          >
            Timeline Calculator
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'amount'}
            className={activeTab === 'amount' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('amount')}
          >
            Sourdough Amount Calculator
          </button>
        </div>

        {activeTab === 'timeline' ? (
          <>
            <div className="controls-grid">
              <div className="control-group">
                <label htmlFor="feed-time">When will you feed your starter today?</label>
                <input
                  id="feed-time"
                  type="range"
                  min={0}
                  max={1425}
                  step={15}
                  value={feedMinutesToday}
                  onChange={(event) => {
                    setFeedMinutesToday(Number(event.target.value));
                    setManualReadyAt(null);
                    setShowBakeSection(true);
                  }}
                  aria-describedby="feed-time-value"
                />
                <p id="feed-time-value" className="value-readout">{formatMinutesAsTime(feedMinutesToday)}</p>
              </div>

              <div className="control-group">
                <label htmlFor="temperature">Kitchen temperature</label>
                <input
                  id="temperature"
                  type="range"
                  min={10}
                  max={30}
                  step={1}
                  value={temperatureC}
                  onChange={(event) => {
                    setTemperatureC(Number(event.target.value));
                    setManualReadyAt(null);
                  }}
                  aria-describedby="temperature-value"
                />
                <p id="temperature-value" className="value-readout">{temperatureC}C</p>
              </div>
            </div>

            <div className="result-block" role="status" aria-live="polite">
              <p className="result-label">Starter ripe at</p>
              <p className="result-time">{formatTimeWithDay(starterReadyAt)}</p>
              {isUsingNow ? <p className="result-note">Using current time as the starter-ready start point.</p> : null}
            </div>

            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                setManualReadyAt(new Date());
                setShowBakeSection(true);
              }}
            >
              My starter is ready now
            </button>

            {showBakeSection ? (
              <section className="proof-section" aria-label="Proof options">
                <div className="proof-options" role="radiogroup" aria-label="Select proof option">
                  <button
                    type="button"
                    className={proofOption === 'none' ? 'choice-button active' : 'choice-button'}
                    onClick={() => setProofOption('none')}
                  >
                    Bake without cold proof
                  </button>
                  <button
                    type="button"
                    className={proofOption === 'cold' ? 'choice-button active' : 'choice-button'}
                    onClick={() => setProofOption('cold')}
                  >
                    Bake with cold proof
                  </button>
                </div>

                <div className="timeline-grid" role="status" aria-live="polite">
                  <div className="timeline-box">
                    <p className="timeline-label">Start</p>
                    <p className="timeline-time">{formatTimeWithDay(bakeWindow.start)}</p>
                  </div>
                  <div className="timeline-box">
                    <p className="timeline-label">Ready to bake</p>
                    <p className="timeline-time">
                      {bakeWindow.readyEnd
                        ? `${formatTimeWithDay(bakeWindow.readyStart)} to ${formatTimeWithDay(bakeWindow.readyEnd)}`
                        : formatTimeWithDay(bakeWindow.readyStart)}
                    </p>
                  </div>
                </div>
              </section>
            ) : null}
          </>
        ) : null}

        {activeTab === 'amount' ? (
          <section className="amount-panel" aria-label="Sourdough amount calculator">
            <div className="control-group">
              <label htmlFor="desired-starter">How much starter do you need for bread? (g)</label>
              <input
                id="desired-starter"
                type="number"
                min={0}
                step={1}
                value={desiredStarterG}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setDesiredStarterG(Number.isFinite(value) ? value : 0);
                }}
              />
              <p className="result-note">Default is 8g. Calculator adds 50g so you keep starter left over.</p>
            </div>

            <div className="result-block" role="status" aria-live="polite">
              <p className="result-label">Target total starter</p>
              <p className="result-time">{formatGrams(buildBreakdown.totalTargetG)}</p>
              <p className="result-note">
                Bread needs {formatGrams(buildBreakdown.desiredStarterG)} + 50.0g reserve.
              </p>
            </div>

            <div className="timeline-grid ingredient-grid">
              <div className="timeline-box">
                <p className="timeline-label">Inactive starter (1 part)</p>
                <p className="timeline-time">{formatGrams(buildBreakdown.inactiveStarterG)}</p>
              </div>
              <div className="timeline-box">
                <p className="timeline-label">Flour (2 parts)</p>
                <p className="timeline-time">{formatGrams(buildBreakdown.flourG)}</p>
              </div>
              <div className="timeline-box">
                <p className="timeline-label">Water (2 parts)</p>
                <p className="timeline-time">{formatGrams(buildBreakdown.waterG)}</p>
              </div>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}

export default App;
