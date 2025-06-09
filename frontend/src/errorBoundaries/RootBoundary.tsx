import { useRouteError } from "react-router-dom";

function RootBoundary() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error = useRouteError() as any;
  if ("status" in error) {
    if (error.status === 404) {
      return <div>This page doesn't exist!</div>;
    }

    if (error.status === 401) {
      return <div>You aren't authorized to see this</div>;
    }

    if (error.status === 503) {
      return <div>Looks like our API is down</div>;
    }
  }

  return <div>Something went wrong</div>;
}

export default RootBoundary;
