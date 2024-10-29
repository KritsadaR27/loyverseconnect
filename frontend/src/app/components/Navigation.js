import Link from 'next/link';

const Navigation = () => (
  <nav className="bg-gray-800 p-4">
    <ul className="flex space-x-4">
      <li>
        <Link href="/feature/Reports/SalesReport">
          <span className="text-white hover:bg-gray-700 px-3 py-2 rounded">รายงานยอดขายรวม</span>
        </Link>
      </li>
      <li>
        <Link href="/product-report">
          <span className="text-white hover:bg-gray-700 px-3 py-2 rounded">รายงานยอดขายตามสินค้า</span>
        </Link>
      </li>
      <li>
        <Link href="/category-report">
          <span className="text-white hover:bg-gray-700 px-3 py-2 rounded">รายงานยอดขายตามหมวดหมู่</span>
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

export default Navigation;
