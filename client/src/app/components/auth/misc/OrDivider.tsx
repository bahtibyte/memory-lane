export default function OrDivider() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[#242424]"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-[#1A1A1A] px-2 text-gray-400">or</span>
      </div>
    </div>
  );
}