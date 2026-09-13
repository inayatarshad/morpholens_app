export function FeatureTable({ features, unimorph }: { features: Record<string, string>; unimorph?: string }) {
  return (
    <div>
      <table className="w-full text-sm">
        <tbody>
          {Object.entries(features).map(([k, v]) => (
            <tr key={k} className="border-b border-line last:border-0">
              <th scope="row" className="w-2/5 py-2.5 pr-4 text-left font-normal text-muted">{k}</th>
              <td className="py-2.5">
                <span className="rounded-full border border-sienna/30 bg-sienna/10 px-2.5 py-0.5 text-[0.8rem] font-medium text-sienna">{v}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {unimorph && (
        <p className="mt-4 text-xs text-muted">
          UniMorph-style bundle <code className="ml-1 rounded bg-cashmere px-1.5 py-0.5 font-mono text-[0.72rem] text-bush">{unimorph}</code>
        </p>
      )}
    </div>
  );
}
