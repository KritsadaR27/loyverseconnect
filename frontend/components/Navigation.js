import Link from 'next/link';
import { useState } from 'react';

const Navigation = () => {
  const [dropdowns, setDropdowns] = useState({});

  const toggleDropdown = (menuName) => {
    setDropdowns((prevState) => ({
      ...prevState,
      [menuName]: !prevState[menuName],
    }));
  };

  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex space-x-4">
        <li>
          <Link href="/">
            <span className="text-white hover:bg-gray-700 px-3 py-2 rounded">Home</span>
          </Link>
        </li>

        {/* Dropdown Menu for PO */}
        <li className="relative">
          <button
            onClick={() => toggleDropdown('po')}
            className="text-white hover:bg-gray-700 px-3 py-2 rounded focus:outline-none"
          >
            PO
          </button>
          {dropdowns['po'] && (
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
          <Link href="/receipts">
            <span className="text-white hover:bg-gray-700 px-3 py-2 rounded">ใบเสร็จ</span>
          </Link>
        </li>

        <li className="relative">
          <Link href="/inventory">
            <span className="text-white hover:bg-gray-700 px-3 py-2 rounded">สต๊อก</span>
          </Link>
        </li>

        {/* Dropdown Menu for Settings */}
        <li className="relative">
          <button
            onClick={() => toggleDropdown('settings')}
            className="text-white hover:bg-gray-700 px-3 py-2 rounded focus:outline-none"
          >
            Settings
          </button>
          {dropdowns['settings'] && (
            <ul className="absolute left-0 mt-2 w-32 bg-gray-800 rounded shadow-lg">
              <li>
                <Link href="/settings/syncdata">
                  <span className="text-white hover:bg-gray-700 px-3 py-2 rounded">Syncdata</span>
                </Link>
              </li>
              <li>
                <Link href="/settings/supplier">
                  <span className="text-white hover:bg-gray-700 px-3 py-2 rounded">Supplier Setting</span>
                </Link>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
