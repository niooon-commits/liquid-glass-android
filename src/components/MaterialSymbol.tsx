import React from 'react';

export interface MaterialSymbolProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: number | string;
  fill?: boolean;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  grade?: -25 | 0 | 200;
  opticalSize?: 20 | 24 | 40 | 48;
  className?: string;
}

export const MaterialSymbol: React.FC<MaterialSymbolProps> = ({
  name,
  size = 24,
  fill = false,
  weight = 400,
  grade = 0,
  opticalSize = 24,
  className = '',
  style,
  ...props
}) => {
  const fontVariationSettings = `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`;
  const computedSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <span
      className={`material-symbols-outlined select-none inline-flex items-center justify-center leading-none ${className}`}
      style={{
        fontSize: computedSize,
        width: computedSize,
        height: computedSize,
        fontVariationSettings,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    >
      {name}
    </span>
  );
};
