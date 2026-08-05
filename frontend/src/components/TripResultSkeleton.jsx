export default function TripResultSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14 animate-pulse">
      {/* Başlık iskeleti */}
      <div className="mb-8">
        <div className="h-9 w-1/2 rounded-btn bg-ink-200" />
        <div className="mt-3 flex gap-2">
          <div className="h-6 w-16 rounded-full bg-ink-100" />
          <div className="h-6 w-16 rounded-full bg-ink-100" />
          <div className="h-6 w-24 rounded-full bg-ink-100" />
        </div>
      </div>

      {/* Gün kartı iskeletleri */}
      {[1, 2].map((day) => (
        <div key={day} className="mb-6 rounded-card border border-ink-200 bg-white p-4">
          <div className="h-6 w-32 rounded-btn bg-ink-200" />
          <div className="mt-2 h-4 w-3/4 rounded-btn bg-ink-100" />

          {/* Harita iskeleti */}
          <div className="mt-4 h-40 w-full rounded-card bg-ink-100" />

          {/* Aktivite kartı iskeletleri */}
          <div className="mt-4 flex flex-col gap-3">
            {[1, 2, 3].map((act) => (
              <div key={act} className="rounded-card bg-ink-50 p-3">
                <div className="h-4 w-2/3 rounded-btn bg-ink-200" />
                <div className="mt-2 h-3 w-full rounded-btn bg-ink-100" />
                <div className="mt-1.5 h-3 w-1/3 rounded-btn bg-ink-100" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}