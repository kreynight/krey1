import Link from 'next/link'

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams

  return (
    <div className="max-w-sm mx-auto mt-20 text-center">
      <div className="text-4xl mb-4">✉️</div>
      <h1 className="text-2xl font-semibold mb-3">Check your email</h1>
      <p className="text-stone-500 text-sm leading-relaxed">
        We sent a confirmation link to{' '}
        {email ? <strong className="text-stone-800">{email}</strong> : 'your email'}.
        <br />
        Click it to activate your account, then sign in.
      </p>
      <Link
        href="/auth/signin"
        className="mt-8 inline-block bg-stone-900 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-stone-700 transition-colors"
      >
        Go to sign in
      </Link>
    </div>
  )
}
