import { FixtureEventDetail, FixtureMatch, FixtureTeam, MATCH_STAGE_LABEL } from '@/lib/api/adminCmTrophyFixturesApi';

const ROW = 44; // vertical space per entrant line
const COL = 280; // width of one round column
const LINE = 250; // length of an input line inside a column
const HEAD = 34; // header height

interface Slot {
  team: FixtureTeam | null; // entrant seated here, or the feeder's winner
  seated: boolean; // true = seated at draw time (not fed by a match)
  y: number;
  feeder: FixtureMatch | null;
}
interface Node {
  match: FixtureMatch;
  col: number;
  a: Slot;
  b: Slot;
  y: number; // output (join) y
}

// Knockout tree drawn like a printed draw sheet: Round I..N columns, seated entrants that
// skip Round I are drawn there as "Bye" lines, the Final's winner is the champion.
export default function BracketView({ event, onSelectMatch }: { event: FixtureEventDetail; onSelectMatch?: (id: string) => void }) {
  const ms = event.matches.filter((m) => m.stage !== 'THIRD_PLACE');
  const final = ms.find((m) => m.stage === 'FINAL');
  if (!final) return null;
  const third = event.matches.find((m) => m.stage === 'THIRD_PLACE');
  const minRound = Math.min(...ms.map((m) => m.round));

  const nodes: Node[] = [];
  const byes: { team: FixtureTeam; y: number; toCol: number }[] = [];
  let leaf = 0;

  const slotOf = (m: FixtureMatch, which: 'A' | 'B', col: number): Slot => {
    const feeder = ms.find((x) => x.nextMatchId === m.id && x.nextMatchSlot === which) ?? null;
    if (feeder) {
      const n = build(feeder);
      return { team: feeder.winner, seated: false, y: n.y, feeder };
    }
    const team = which === 'A' ? m.teamA : m.teamB;
    const y = leaf++ * ROW + ROW / 2;
    if (team && col > 0) byes.push({ team, y, toCol: col });
    return { team, seated: true, y, feeder: null };
  };

  function build(m: FixtureMatch): Node {
    const col = m.round - minRound;
    const a = slotOf(m, 'A', col);
    const b = slotOf(m, 'B', col);
    const node = { match: m, col, a, b, y: (a.y + b.y) / 2 };
    nodes.push(node);
    return node;
  }

  const root = build(final);
  const cols = root.col + 1; // + one more column for the champion line
  const width = (cols + 1) * COL;
  const height = leaf * ROW;
  const colLabel = (c: number) => ms.find((m) => m.round - minRound === c);

  const label = (team: FixtureTeam | null, bold: boolean) =>
    team ? <span className={bold ? 'font-bold text-[#1e3a8a]' : 'text-gray-800'}>{team.displayName}</span> : <span className="text-gray-300">TBD</span>;

  return (
    <div className="overflow-x-auto print:overflow-visible">
      <div className="relative text-xs" style={{ width, height: height + HEAD }}>
        {Array.from({ length: cols + 1 }, (_, c) => (
          <div key={c} className="absolute font-semibold text-gray-700" style={{ left: c * COL, top: 0, width: LINE }}>
            {c === cols ? 'Champion' : `Round ${c + 1}`}
            {c < cols && colLabel(c) && <span className="ml-1 text-[10px] font-normal text-gray-400">{MATCH_STAGE_LABEL[colLabel(c)!.stage]}</span>}
          </div>
        ))}

        <div className="absolute" style={{ top: HEAD, left: 0 }}>
          {/* bye lines: entrant skips Round I, line runs from column 0 to its first match */}
          {byes.map((b) => (
            <div key={b.team.id} className="absolute flex items-end gap-1 border-b border-gray-500" style={{ left: 0, top: b.y - 18, width: b.toCol * COL + LINE, height: 18 }}>
              <span className="truncate" style={{ maxWidth: LINE - 40 }}>{label(b.team, false)}</span>
              <span className="shrink-0 rounded bg-gray-100 px-1 text-[10px] text-gray-500 print:border print:border-gray-400">Bye</span>
            </div>
          ))}

          {nodes.map(({ match: m, col, a, b, y }) => {
            const x = col * COL;
            return (
              <div key={m.id}>
                {[a, b].filter((s) => !(s.seated && col > 0)).map((s, i) => (
                  <div
                    key={i}
                    className="absolute border-b border-gray-500 truncate"
                    style={{ left: x, top: s.y - 18, width: LINE, height: 18 }}
                  >
                    {label(s.team, !!s.team && s.team.id === m.winnerId)}
                  </div>
                ))}
                {/* elbow: vertical join between the two inputs, then the output line into the next column */}
                <div className="absolute border-r border-gray-500" style={{ left: x + LINE, top: a.y, width: 0, height: b.y - a.y }} />
                <div className="absolute border-b border-gray-500" style={{ left: x + LINE, top: y - 1, width: COL - LINE, height: 1 }} />
                <button
                  type="button"
                  onClick={() => onSelectMatch?.(m.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-gray-300 bg-white px-1.5 py-0.5 font-mono text-[10px] text-gray-500 hover:border-[#1e3a8a] hover:text-[#1e3a8a] print:border-gray-400"
                  style={{ left: x + LINE, top: y }}
                  title={`Match ${m.seq}`}
                >
                  {m.status === 'FINAL' ? `${m.scoreA}–${m.scoreB}` : 'vs'}
                </button>
              </div>
            );
          })}

          {/* champion line after the final */}
          <div className="absolute border-b border-gray-500 truncate" style={{ left: cols * COL, top: root.y - 18, width: LINE, height: 18 }}>
            {label(final.winner, true)}
            {final.winner && <span className="ml-1 text-[10px] text-gray-400">(RW)</span>}
          </div>
        </div>
      </div>

      {third && (
        <div className="mt-3 inline-block rounded border border-gray-300 px-3 py-2 text-xs">
          <span className="mr-2 text-[10px] uppercase tracking-wide text-gray-400">{MATCH_STAGE_LABEL.THIRD_PLACE}</span>
          {label(third.teamA, third.winnerId === third.teamAId)} <span className="mx-1 font-mono text-gray-400">{third.status === 'FINAL' ? `${third.scoreA}–${third.scoreB}` : 'vs'}</span> {label(third.teamB, third.winnerId === third.teamBId)}
        </div>
      )}
    </div>
  );
}
