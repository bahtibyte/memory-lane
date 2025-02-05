import Link from "next/link";


export default function ExternalNavigation() {
  return (
    <div>
      <div className="absolute top-4 right-4 flex gap-4">
        <Link
          href="/contributors"
          className="nav-button px-4 py-2 text-sm text-white flex items-center gap-2"
        >
          OUR CONTRIBUTORS
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor" />
          </svg>
        </Link>
        <Link
          href="https://github.com/bahtibyte/memory-lane"
          target="_blank"
          className="nav-button px-4 py-2 text-sm text-white flex items-center gap-2"
        >
          GITHUB REPO
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.477 2 2 6.477 2 12C2 16.991 5.571 21.128 10.285 22V18.857C9.705 19.002 9.195 19.002 8.657 18.76C7.915 18.42 7.326 17.577 6.93 16.851C6.715 16.488 6.198 16.086 5.786 16.116L5.734 15.17C6.731 15.083 7.565 15.722 8.058 16.541C8.276 16.907 8.524 17.164 8.858 17.298C9.181 17.427 9.519 17.387 9.934 17.265C9.996 16.623 10.267 16.223 10.497 15.9V15.9C7.726 15.437 6.739 13.847 6.366 12.647C5.89 11.045 6.31 9.036 7.354 7.947C7.378 7.922 7.396 7.891 7.401 7.857C7.406 7.823 7.398 7.789 7.379 7.76C6.947 6.637 7.06 5.17 7.355 4.527C8.193 4.648 9.218 5.183 10.061 5.811C10.135 5.868 10.23 5.885 10.319 5.857C11.413 5.544 12.552 5.392 13.649 5.392C14.749 5.392 15.892 5.544 16.988 5.858C17.077 5.886 17.172 5.869 17.246 5.812C18.088 5.184 19.111 4.649 19.951 4.528C20.246 5.171 20.359 6.636 19.929 7.759C19.91 7.788 19.902 7.822 19.907 7.856C19.912 7.89 19.929 7.921 19.954 7.946C21.012 9.049 21.419 11.078 20.941 12.676C20.566 13.862 19.574 15.441 16.815 15.899V15.899C17.141 16.349 17.5 17.099 17.5 18.099V22C22.215 21.129 25.786 16.992 25.786 12C25.786 6.477 21.309 2 15.786 2H12Z" fill="currentColor" />
          </svg>
        </Link>
      </div>
    </div>
  );
}