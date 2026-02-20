export default function AboutPage() {
  return (
    <div className="max-w-lg">
      <p className="text-xs uppercase tracking-wider text-stone-400 mb-10 font-medium">About</p>

      <div className="space-y-5 text-stone-700 leading-relaxed">
        <p>
          based in south fl.
        </p>
        <p>
          i&apos;ve always wanted a space where people can share how they truly see the world.
          Philosophy Of is that space. a forum to communicate perspective openly, challenge
          ideas respectfully, and debate in a healthy way.
        </p>
        <p>
          this is a long-term experiment in thoughtful conversation.
          if it resonates with you, contribute.
        </p>
        <p className="text-stone-400 text-sm">
          perspective is personal. disagreement is welcome.
        </p>
      </div>

      <div className="mt-12 pt-6 border-t border-stone-200 space-y-1.5">
        <p className="text-sm text-stone-400">
          For business inquiries:{' '}
          <a
            href="mailto:jeensmails@gmail.com"
            className="text-stone-600 hover:text-stone-900 transition-colors"
          >
            jeensmails@gmail.com
          </a>
        </p>
        <p className="text-sm text-stone-500">~ krey</p>
      </div>
    </div>
  )
}
