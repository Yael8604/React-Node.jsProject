import React from "react";
import classNames from "classnames";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div
    className={classNames(
      "bg-white rounded-2xl shadow-md p-4 border border-gray-200",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={classNames("mt-2", className)} {...props}>
    {children}
  </div>
);
