interface ErrorCardProps {
  error: any;
  onRetry?: () => void;
}

export const ErrorCard = ({ error, onRetry }: ErrorCardProps) => (
  <div className="bg-red-100 text-red-700 p-4 rounded-xl text-center mt-10 shadow">
    <p className="font-semibold">שגיאה: {error?.message || "שגיאה לא ידועה"}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        נסה שוב
      </button>
    )}
  </div>
);
