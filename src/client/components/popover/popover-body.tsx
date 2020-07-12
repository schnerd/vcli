import React from 'react';

interface PopoverBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  stylesJsx: any;
}

export const PopoverBody = React.forwardRef(function PopoverBody(
  props: PopoverBodyProps,
  ref: React.Ref<HTMLDivElement>,
) {
  const {children, stylesJsx, ...rest} = props;
  return (
    <div className="root" ref={ref} {...rest}>
      {children}
      <style jsx>{stylesJsx}</style>
      <style jsx>
        {`
          .root {
            box-shadow: 0 0 1px rgba(67, 90, 111, 0.3), 0 8px 10px -4px rgba(67, 90, 111, 0.47);
            border-radius: 3px;
            background-color: #fff;
          }
        `}
      </style>
    </div>
  );
});
