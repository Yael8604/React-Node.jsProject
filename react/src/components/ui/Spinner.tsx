export const Spinner = ({ message = "טוען..." }: { message?: string }) => (
  <div className="text-center text-indigo-600 mt-10 animate-pulse text-lg">{message}</div>
);
