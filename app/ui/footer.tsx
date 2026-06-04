'use client';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto">
      <div className="bg-[#ddbbed] px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">

        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-3">
            <svg
              viewBox="0 0 100 100"
              className="w-6 h-6 fill-black"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon points="50,15 15,85 85,85" />
            </svg>
            <span className="text-lg font-bold text-black tracking-tight">Swag Store</span>
          </div>
          <p className="text-sm text-gray-800">
            Premium essentials for your lifestyle.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-3">
          <div className="text-sm text-gray-700 font-medium">
            © {year} Swag Store. All rights reserved.
          </div>
        </div>

      </div>
    </footer>
  );
}
