export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-12 border border-outline/30 bg-surface-container-low" />
      <div className="h-20 border border-outline/30 bg-surface-container-low" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-80 border border-outline/30 bg-surface-container-low" />
        ))}
      </div>
    </div>
  );
}
