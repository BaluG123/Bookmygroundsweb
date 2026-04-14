export default function Toast({ message, isError }) {
  return (
    <div className={`toast ${isError ? 'error' : 'success'}`}>
      <span>{isError ? '⚠️' : '✓'}</span>
      <span>{message}</span>
    </div>
  );
}
