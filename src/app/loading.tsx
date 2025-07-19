export default function Loading() {
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[90] block">
        <div className="flex items-center justify-center h-full">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    </>
  );
}
