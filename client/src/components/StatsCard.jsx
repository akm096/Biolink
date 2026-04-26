export default function StatsCard({ icon, label, value, color }) {
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: `${color || '#a855f7'}18`, border: `1px solid ${color || '#a855f7'}25` }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </div>
  );
}
