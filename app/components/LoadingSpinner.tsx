export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gold/20 rounded-full" />
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gold rounded-full animate-spin border-t-transparent" />
      </div>
    </div>
  )
} 