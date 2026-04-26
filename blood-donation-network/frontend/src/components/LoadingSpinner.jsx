// ============================================================
// LoadingSpinner Component — Apple Design
// ============================================================

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div
        className={`${sizeClasses[size]} border-[2.5px] border-gray-200 dark:border-gray-700 border-t-rose-500 rounded-full animate-spin`}
      />
      {text && <p className="text-gray-400 text-sm font-medium">{text}</p>}
    </div>
  )
}
