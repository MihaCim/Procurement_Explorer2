import { PropsWithChildren } from 'react';
import { Link, LinkProps } from 'react-router-dom';

const TableLink = ({ children, ...props }: PropsWithChildren<LinkProps>) => {
  return (
    <Link
      {...props}
      style={{
        color: 'var(--color-primary, #014289)',
        fontFamily: 'Poppins',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: 600,
        lineHeight: 'normal',
      }}
    >
      {children}
    </Link>
  );
};

export default TableLink;
