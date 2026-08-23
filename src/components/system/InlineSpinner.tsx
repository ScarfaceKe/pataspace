'use client';

/**
 * InlineSpinner — Small animated spinner for buttons, links, and inline loading states.
 *
 * Usage:
 *   <InlineSpinner />                    // default teal
 *   <InlineSpinner size={16} />          // smaller
 *   <InlineSpinner color="#fff" />       // white for dark backgrounds
 *   <InlineSpinner className="my-class" />
 */

interface InlineSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
  label?: string;
}

export function InlineSpinner({
  size = 20,
  color = 'currentColor',
  className = '',
  label = 'Loading...',
}: InlineSpinnerProps) {
  return (
    <svg
      className={`inline-spinner ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-label={label}
      style={{ flexShrink: 0 }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeOpacity={0.2}
        strokeWidth="3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        className="inline-spinner-arc"
      />
    </svg>
  );
}

/**
 * LoadingButton — A button that shows a spinner while loading.
 *
 * Usage:
 *   <LoadingButton loading={isSubmitting} onClick={handleSubmit}>
 *     Submit Registration
 *   </LoadingButton>
 */

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  className = '',
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`loading-button ${loading ? 'loading-button--loading' : ''} ${className}`}
    >
      {loading ? (
        <>
          <InlineSpinner size={16} color="currentColor" />
          {loadingText ? <span>{loadingText}</span> : null}
        </>
      ) : (
        children
      )}
    </button>
  );
}
