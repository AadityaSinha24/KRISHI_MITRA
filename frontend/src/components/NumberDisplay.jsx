// // The number the person has pressed so far.
// export default function NumberDisplay({ digits, error }) {
//   return (
//     <section className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-leaf-100">
//       <p className="text-base font-medium text-leaf-700">नंबर दर्ज करें</p>

//       <p
//         className="mt-1 flex h-16 items-center justify-center text-5xl font-bold tracking-[0.2em] text-leaf-800"
//         aria-live="polite"
//         aria-label={digits ? `चुना गया नंबर ${digits}` : 'अभी कोई नंबर नहीं चुना'}
//       >
//         {digits || (
//           <span className="animate-pulse text-leaf-300" aria-hidden="true">
//             _
//           </span>
//         )}
//       </p>

//       {error ? (
//         <p role="alert" className="mt-1 text-base font-medium text-red-700">
//           {error}
//         </p>
//       ) : !digits ? (
//         <p className="mt-1 text-base text-soil/70">शुरू करने के लिए नंबर दबाएं</p>
//       ) : null}
//     </section>
//   )
// }
// The dark card showing the number pressed so far.
export default function NumberDisplay({ digits, shaking }) {
  return (
    <section className={`display-area${shaking ? ' shake' : ''}`} id="display-area">
      <div className="display-label">नंबर दर्ज करें</div>
      {/* key={digits} restarts the pop animation on every key press */}
      <div
        key={digits}
        className="display-value pop"
        id="display-value"
        aria-live="polite"
        aria-label={digits ? `चुना गया नंबर ${digits}` : 'अभी कोई नंबर नहीं चुना'}
      >
        {digits || '_'}
      </div>
      <div className={`display-status${digits ? ' active' : ''}`} id="display-status">
        {digits
          ? '✓ दबाएं पुष्टि के लिए या C दबाएं मिटाने के लिए'
          : 'शुरू करने के लिए नंबर दबाएं'}
      </div>
    </section>
  )
}
