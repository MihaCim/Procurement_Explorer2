import { useRouteError } from "react-router-dom";

function DetailsBoundary() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error = useRouteError() as any;
  if ("status" in error) {
    if (error.status === 404) {
      return (
        <div className="mt-12 flex w-full justify-center">
          <div>This form doesn't exist!</div>
        </div>
      );
    }

    if (error.status === 401) {
      return (
        <div className="mt-12 flex w-full justify-center">
          <div>You aren't authorized to see this form</div>
        </div>
      );
    }

    if (error.status === 503) {
      return (
        <div className="mt-12 flex w-full justify-center">
          <div>Looks like our API is down</div>
        </div>
      );
    }
  }

  return (
    <div className="mt-12 flex w-full justify-center">
      <div>Something went wrong</div>
    </div>
  );
}

export default DetailsBoundary;
