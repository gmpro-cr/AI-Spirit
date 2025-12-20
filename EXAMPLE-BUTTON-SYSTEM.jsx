/**
 * DE-SLOPPED BUTTON SYSTEM
 *
 * Replaces the generic rounded-full, scale-on-hover buttons
 * with clean, intentional designs that fit the spiritual theme
 */

// ====================================
// BEFORE (AI Slop)
// ====================================

function OldButton() {
  return (
    <button className="bg-black text-white font-medium px-8 py-3.5 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg">
      Contact Us
    </button>
  )
}

// Problems:
// ❌ rounded-full everywhere
// ❌ hover:scale (screams AI-generated)
// ❌ shadow-lg (too much)
// ❌ Generic, forgettable


// ====================================
// AFTER (Spiritual Minimalism)
// ====================================

/**
 * Primary Button - Main actions
 * Clean inversion on hover, no scaling
 */
export function PrimaryButton({ children, onClick, className = '', ...props }) {
  return (
    <button
      onClick={onClick}
      className={`
        bg-black text-white
        px-6 py-2.5
        border border-black
        hover:bg-white hover:text-black
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
export function SecondaryButton({ children, onClick, className = '', ...props }) {
  return (
    <button
      onClick={onClick}
      className={`
        bg-white text-black
        px-6 py-2.5
        border border-gray-300
        hover:border-black hover:bg-gray-50
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
 * Accent Button - Gold/spiritual theme
 */
export function AccentButton({ children, onClick, className = '', ...props }) {
  return (
    <button
      onClick={onClick}
      className={`
        bg-amber-500 text-white
        px-6 py-2.5
        border border-amber-500
        hover:bg-white hover:text-amber-600 hover:border-amber-600
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
export function GhostButton({ children, onClick, className = '', ...props }) {
  return (
    <button
      onClick={onClick}
      className={`
        bg-transparent text-gray-700
        px-4 py-2
        hover:text-black hover:underline
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
export function IconButton({ children, onClick, className = '', label, ...props }) {
  return (
    <button
      onClick={onClick}
      className={`
        p-2
        text-gray-600 hover:text-black
        hover:bg-gray-100
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


// ====================================
// USAGE EXAMPLES
// ====================================

function ExampleUsage() {
  return (
    <div className="space-y-4 p-8">
      {/* Primary action */}
      <PrimaryButton>Start Chatting</PrimaryButton>

      {/* Secondary action */}
      <SecondaryButton>Learn More</SecondaryButton>

      {/* Accent for premium/special actions */}
      <AccentButton>Upgrade to Premium</AccentButton>

      {/* Ghost for tertiary actions */}
      <GhostButton>Cancel</GhostButton>

      {/* Icon-only */}
      <IconButton label="Close">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </IconButton>

      {/* Button with icon */}
      <PrimaryButton className="flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Confirm
      </PrimaryButton>
    </div>
  )
}


// ====================================
// OPTIONAL: Rounded Minimal Version
// ====================================
// If you want SOME rounding (but not full pills):

export function PrimaryButtonRounded({ children, onClick, className = '', ...props }) {
  return (
    <button
      onClick={onClick}
      className={`
        bg-black text-white
        px-6 py-2.5
        rounded-md
        border border-black
        hover:bg-white hover:text-black
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

// Note: rounded-md is acceptable, rounded-full is AI slop


// ====================================
// COMPARISON
// ====================================

/*
AI SLOP BUTTON:
┌─────────────────────┐
│ ( Contact Us )      │ ← Pill shape
│  *wobbles on hover* │ ← Scale effect
└─────────────────────┘

SPIRITUAL MINIMAL BUTTON:
┌────────────────┐
│ Contact Us     │ ← Clean edge
│ [inverts color]│ ← Meaningful interaction
└────────────────┘

WHICH FEELS MORE INTENTIONAL?
*/


// ====================================
// IMPLEMENTATION GUIDE
// ====================================

/*
1. Create this file: components/ui/Button.jsx
2. Export these components
3. Find all old buttons in your app
4. Replace them:

   OLD:
   <button className="bg-black text-white rounded-full px-8 py-3.5 hover:scale-[1.02]">

   NEW:
   <PrimaryButton>Contact Us</PrimaryButton>

5. Consistency = professional look
*/
