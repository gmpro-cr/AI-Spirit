/**
 * DE-SLOPPED BUTTON SYSTEM
 * Spiritual Minimalism Theme
 *
 * No rounded-full, no hover:scale effects
 * Clean color inversions, minimal interactions
 */

/**
 * Primary Button - Main actions
 */
export function PrimaryButton({ children, onClick, className = '', disabled = false, type = 'button', ...props }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-spirit-primary text-white
        px-6 py-2.5
        border border-spirit-primary
        hover:bg-white hover:text-spirit-primary
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-spirit-primary disabled:hover:text-white
        transition-colors duration-200
        font-medium text-sm
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

/**
 * Secondary Button - Less emphasis
 */
export function SecondaryButton({ children, onClick, className = '', disabled = false, type = 'button', ...props }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        glass-matte !rounded-none text-spirit-primary
        px-6 py-2.5
        hover:bg-white/85
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        font-medium text-sm
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

/**
 * Accent Button - inverted-monochrome emphasis for premium/special actions
 * (kept within the black/white palette — no separate accent hue)
 */
export function AccentButton({ children, onClick, className = '', disabled = false, type = 'button', ...props }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-spirit-primary text-white
        px-6 py-2.5
        shadow-glass-dark
        hover:bg-white hover:text-spirit-primary hover:shadow-none hover:border hover:border-spirit-primary
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        font-medium text-sm
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

/**
 * Ghost Button - Minimal, text-focused
 */
export function GhostButton({ children, onClick, className = '', disabled = false, type = 'button', ...props }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-transparent text-gray-700
        px-4 py-2
        hover:text-black hover:bg-white/50 hover:backdrop-blur-md
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        font-medium text-sm
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

/**
 * Icon Button - For actions with icons only
 */
export function IconButton({ children, onClick, className = '', disabled = false, label, type = 'button', ...props }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        p-2
        text-gray-600 hover:text-black
        hover:bg-white/60 hover:backdrop-blur-md
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        ${className}
      `}
      aria-label={label}
      {...props}
    >
      {children}
    </button>
  )
}

/**
 * Link Button - Looks like button but acts as link
 */
export function LinkButton({ children, href, className = '', ...props }) {
  return (
    <a
      href={href}
      className={`
        inline-block
        bg-spirit-primary text-white
        px-6 py-2.5
        border border-spirit-primary
        hover:bg-white hover:text-spirit-primary
        transition-colors duration-200
        font-medium text-sm
        text-center
        ${className}
      `}
      {...props}
    >
      {children}
    </a>
  )
}
