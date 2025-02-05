import Link from "next/link";
import "./HomeLink.css";

export default function HomeLink() {
  return (
    <div className="absolute top-4 right-4 flex gap-4">
      <Link
        href="/"
        className="nav-button px-4 py-2 text-sm text-white flex items-center gap-2"
      >
        HOME
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5.69L17 10.19V18H15V12H9V18H7V10.19L12 5.69ZM12 3L2 12H5V20H11V14H13V20H19V12H22L12 3Z" fill="currentColor" />
        </svg>
      </Link>
    </div>
  );
}