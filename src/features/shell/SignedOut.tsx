import { useEffect, useRef } from 'react'
import { Logo } from '../../components/icons'

/** Mock signed-out screen (there's no real auth yet). Covers the app until "Sign in again". */
export default function SignedOut({ onSignIn }: { onSignIn: () => void }) {
  const button = useRef<HTMLButtonElement>(null)
  useEffect(() => button.current?.focus(), [])
  return (
    <div className="signed-out" role="dialog" aria-modal="true" aria-labelledby="signed-out-title">
      <div className="signed-out__card card">
        <Logo className="signed-out__logo" />
        <h2 id="signed-out-title" className="pixel-num signed-out__title">
          Signed out
        </h2>
        <p className="coming-soon__text">You’ve logged out of Overseer.</p>
        <button ref={button} className="btn signed-out__button" onClick={onSignIn}>
          Sign in again
        </button>
      </div>
    </div>
  )
}
