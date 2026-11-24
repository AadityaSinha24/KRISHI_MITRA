// // Shared frame for the login and register pages.
// export default function AuthLayout({ title, subtitle, children }) {
//   return (
//     <main className="mx-auto w-full max-w-md px-4 py-8">
//       <header className="mb-6 text-center">
//         <p className="text-4xl" aria-hidden="true">
//           🌾
//         </p>
//         <h1 className="mt-1 text-3xl font-bold text-leaf-800">किसान मित्र</h1>
//         <p className="text-base text-leaf-700">आपका डिजिटल कृषि सहायक</p>
//       </header>

//       <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-leaf-100">
//         <h2 className="text-xl font-semibold text-leaf-900">{title}</h2>
//         {subtitle ? <p className="mt-1 text-base text-soil/70">{subtitle}</p> : null}
//         <div className="mt-4">{children}</div>
//       </section>
//     </main>
//   )
// }
import Logo from './Logo'

// Shared frame for the login and register pages (the footer comes from App.jsx).
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <>
      <header className="app-header">
        <Logo />
      </header>

      <section className="auth-card">
        <h2 className="auth-title">{title}</h2>
        {subtitle ? <p className="auth-subtitle">{subtitle}</p> : null}
        {children}
      </section>
    </>
  )
}
