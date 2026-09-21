export default function ModelBar({
  providers,
  provider,
  model,
  onProvider,
  onModel,
}) {
  const active = providers.find((item) => item.id === provider);

  return (
    <div className="modelbar">
      <label>
        <span>Provider</span>
        <select
          value={provider ?? ""}
          onChange={(event) => onProvider(event.target.value)}
        >
          {providers.map((item) => (
            <option key={item.id} value={item.id} disabled={!item.configured}>
              {item.label}
              {item.configured ? "" : " — key missing"}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Model</span>
        <select
          value={model ?? ""}
          onChange={(event) => onModel(event.target.value)}
          disabled={!active}
        >
          {(active?.models ?? []).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
