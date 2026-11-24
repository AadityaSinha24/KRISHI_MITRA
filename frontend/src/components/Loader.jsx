// // Small spinner. Use fullScreen for the first-load check.
// export default function Loader({ fullScreen = false, label = 'लोड हो रहा है…' }) {
//   const spinner = (
//     <span
//       className="inline-block size-6 animate-spin rounded-full border-[3px] border-leaf-300 border-t-leaf-800"
//       aria-hidden="true"
//     />
//   )

//   if (fullScreen) {
//     return (
//       <div
//         role="status"
//         className="flex min-h-dvh flex-col items-center justify-center gap-3 text-leaf-800"
//       >
//         {spinner}
//         <span className="text-base">{label}</span>
//       </div>
//     )
//   }

//   return (
//     <span role="status" className="inline-flex items-center gap-2">
//       {spinner}
//       <span>{label}</span>
//     </span>
//   )
// }
// Small spinner. Use fullScreen for the first-load session check.
export default function Loader({ fullScreen = false, label = 'लोड हो रहा है…' }) {
  if (fullScreen) {
    return (
      <div role="status" className="loader-screen">
        <span className="spinner" aria-hidden="true" />
        <span>{label}</span>
      </div>
    )
  }

  return (
    <span role="status" className="loader">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}
