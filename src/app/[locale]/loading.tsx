export default function Loading() {
  return (
    <div
      className="container mx-auto flex min-h-[50vh] items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
