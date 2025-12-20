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
        bg-spirit-primary dark:bg-spirit-accent text-white
        px-6 py-2.5
        border border-spirit-primary dark:border-spirit-accent
        hover:bg-white dark:hover:bg-spirit-bg-dark hover:text-spirit-primary dark:hover:text-spirit-accent
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
        bg-white dark:bg-spirit-bg-secondary-dark text-spirit-primary dark:text-spirit-primary-dark
        px-6 py-2.5
        border border-gray-300 dark:border-spirit-border-dark
        hover:border-spirit-primary dark:hover:border-spirit-accent hover:bg-gray-50 dark:hover:bg-gray-800
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
 * Accent Button - Gold/spiritual theme for premium/special actions
 */
export function AccentButton({ children, onClick, className = '', disabled = false, type = 'button', ...props }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-spirit-accent text-white
        px-6 py-2.5
        border border-spirit-accent
        hover:bg-white dark:hover:bg-spirit-bg-dark hover:text-spirit-accent hover:border-spirit-accent
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
        hover:text-black hover:underline
        disabled:opacity-50 disabled:cursor-not-allowed
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
        hover:bg-gray-100
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
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
