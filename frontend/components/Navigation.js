import Link from 'next/link';
import { useState } from 'react';

const Navigation = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex space-x-4">
        <li>
          <Link href="/settings/supplier">
            <span className="text-white hover:bg-gray-700 px-3 py-2 rounded">Supplier Setting</span>
          </Link>
        </li>

        {/* Dropdown Menu */}
        <li className="relative">
          <button
            onClick={toggleDropdown}
            className="text-white hover:bg-gray-700 px-3 py-2 rounded focus:outline-none"
          >
            PO
          </button>
          {isDropdownOpen && (
            <ul className="absolute left-0 mt-2 w-32 bg-gray-800 rounded shadow-lg">
              <li>
                <Link href="/po/">
                  <span className="block px-4 py-2 text-white hover:bg-gray-700 rounded">List</span>
                </Link>
              </li>
              <li>
                <Link href="/po/edit">
                  <span className="block px-4 py-2 text-white hover:bg-gray-700 rounded">Create</span>
                </Link>
              </li>
            </ul>
          )}
        </li>

        <li>
          <Link href="/settings/syncdata">
            <span className="text-white hover:bg-gray-700 px-3 py-2 rounded">Syncdata</span>
          </Link>
        </li>
        <li>
          <Link href="/inventory-report">
            <span className="text-white hover:bg-gray-700 px-3 py-2 rounded">รายงานสต๊อก</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
