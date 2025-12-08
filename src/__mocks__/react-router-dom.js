// Manual mock for react-router-dom
// This file is automatically used by Jest when it encounters react-router-dom imports

import React from 'react';

export const BrowserRouter = ({ children }) => <div>{children}</div>;

export const Link = ({ to, children, ...props }) => (
  <a href={to} {...props}>{children}</a>
);

export const useNavigate = () => () => {};
export const useLocation = () => ({ pathname: '/', state: null });
export const useParams = () => ({});
export const useSearchParams = () => [{ get: () => null }];
export const Routes = ({ children }) => <div>{children}</div>;
export const Route = ({ element }) => element;

