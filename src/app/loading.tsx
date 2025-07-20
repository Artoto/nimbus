export default function Loading() {
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[90] block">
        <div className="flex items-center justify-center h-full">
          <div className="w-12 h-12 border-4 border-black border-t-white rounded-full animate-spin p-1">
            <div className="bg-white w-full h-full rounded-full animation-ping p-1 "></div>
          </div>
        </div>
      </div>
    </>
  );
}
