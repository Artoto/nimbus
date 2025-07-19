interface toastProps {
  message: string;
  isError: boolean;
}

export default function Toast({ message, isError }: toastProps) {
  return (
    <>
      <div
        className={`flex justify-center items-center text-xl font-semibold backdrop-saturate-100 backdrop-blur-lg border border-solid ${
          isError
            ? `bg-red-300/60 border-red-400`
            : `bg-green-300/60 border-green-400`
        }  text-white py-4 px-5 fixed bottom-0 right-4 rounded-xl w-96 h-[100px] z-20 transition`}
      >
        {message}
      </div>
    </>
  );
}
