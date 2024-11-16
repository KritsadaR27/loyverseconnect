import { useState } from "react";
import Link from "next/link";

// Import Heroicons
import {
  CubeIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  ChatBubbleBottomCenterIcon,
  TruckIcon,
  TagIcon,
  BanknotesIcon,
  DocumentChartBarIcon,
  LifebuoyIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ExclamationCircleIcon, // Fallback Icon
} from "@heroicons/react/24/outline";

// Theme options
const themes = [
  { name: "Blue", color: "bg-blue-600", hover: "hover:bg-blue-800" },
  { name: "Green", color: "bg-green-200", hover: "hover:bg-green-600" },
  { name: "Purple", color: "bg-purple-800", hover: "hover:bg-purple-600" },
  { name: "Gray", color: "bg-gray-600", hover: "hover:bg-gray-800" },
];

// Menus
const menus = [
    {
      title: "สต็อกสินค้า",
      icon: CubeIcon, // Component Reference
      submenu: [
        { name: "ติดตามสินค้า", link: "/inventory-tracking" },
        { name: "จุดสั่งซื้อซ้ำ", link: "/reorder-points" },
        { name: "การหมุนเวียนสต็อก", link: "/stock-rotation" },
      ],
    },
    {
      title: "จัดซื้อ",
      icon: ShoppingCartIcon,
      submenu: [
        { name: "ใบสั่งซื้อ", link: "/purchase-orders" },
        { name: "การเชื่อมต่อซัพพลายเออร์", link: "/supplier-integration" },
      ],
    },
    {
      title: "การขาย",
      icon: ChartBarIcon,
      submenu: [
        { name: "การประมวลผลคำสั่งซื้อ", link: "/order-processing" },
        { name: "การเชื่อมต่อช่องทางการขาย", link: "/sales-channels" },
      ],
    },
    {
      title: "แชท",
      icon: ChatBubbleBottomCenterIcon,
      submenu: [
        { name: "การจัดการแชทบอท", link: "/chatbot-management" },
        { name: "การสร้างคำสั่งซื้อ", link: "/order-creation" },
        { name: "การเลือกวิธีการจัดส่ง", link: "/delivery-selection" },
      ],
    },
    {
      title: "จัดส่ง",
      icon: TruckIcon,
      submenu: [
        { name: "การเชื่อมต่อผู้ให้บริการขนส่ง", link: "/shipping-integration" },
        { name: "ติดตามสถานะเรียลไทม์", link: "/real-time-tracking" },
      ],
    },
    {
      title: "การตลาดและโปรโมชั่น",
      icon: TagIcon,
      submenu: [
        { name: "การจัดการโปรโมชั่น", link: "/promotion-management" },
        { name: "ระบบสะสมแต้ม", link: "/loyalty-program" },
      ],
    },
    {
      title: "การเงิน",
      icon: BanknotesIcon,
      submenu: [
        { name: "การติดตามต้นทุนสินค้า", link: "/cogs-tracking" },
        { name: "การจัดการรายรับ", link: "/revenue-management" },
        { name: "การติดตามการชำระเงิน", link: "/payment-tracking" },
      ],
    },
    {
      title: "รายงานและการวิเคราะห์",
      icon: DocumentChartBarIcon,
      submenu: [
        { name: "รายงานการขาย", link: "/sales-reports" },
        { name: "การวิเคราะห์สินค้าคงคลัง", link: "/inventory-analysis" },
        { name: "การวิเคราะห์พฤติกรรมลูกค้า", link: "/customer-behavior-analysis" },
      ],
    },
    {
      title: "บริการลูกค้า",
      icon: LifebuoyIcon,
      submenu: [
        { name: "การจัดการปัญหาลูกค้า", link: "/support-ticketing" },
        { name: "การเก็บความคิดเห็นลูกค้า", link: "/feedback-collection" },
      ],
    },
  ];

// Utility menus
const utilityMenus = [
  {
    title: "โปรไฟล์",
    icon: UserCircleIcon,
    link: "/profile",
  },
  {
    title: "ตั้งค่า",
    icon: Cog6ToothIcon,
    link: "/settings",
  },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState(themes[0]); // Default theme
  const [activeItem, setActiveItem] = useState(""); // Track active menu

  return (
    <div
      className={`flex flex-col h-screen ${
        isCollapsed ? "w-16" : "w-64"
      } ${theme.color} transition-all`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`p-3 focus:outline-none ${theme.hover}`}
      >
        {isCollapsed ? (
          <ChevronDoubleRightIcon className="w-6 h-6 text-white" />
        ) : (
          <ChevronDoubleLeftIcon className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Sidebar Menu */}
      <nav className="flex flex-col mt-4 space-y-2">
        {menus.map((menu, index) => (
          <div key={index} className="relative group">
            {/* Menu Item */}
            <Link href="#">
              <div
                className={`flex items-center p-3 space-x-2 cursor-pointer ${
                  isCollapsed ? "justify-center" : ""
                } ${theme.hover}`}
                onClick={() => setActiveItem(menu.title)}
              >
                {menu.icon ? (
                  <menu.icon className="w-6 h-6 text-white" />
                ) : (
                  <ExclamationCircleIcon className="w-6 h-6 text-red-500" />
                )}
                {!isCollapsed && (
                  <span className="text-white">{menu.title}</span>
                )}
              </div>
            </Link>

            {/* Submenu */}
            {menu.submenu && (
              <>
                {/* Hover Box when Collapsed */}
                {isCollapsed && (
                  <div className="absolute top-0 left-16 hidden group-hover:block">
                    <div className="bg-white text-black text-bold rounded shadow-lg p-3 w-56">
                      {menu.submenu.map((item, subIndex) => (
                        <Link href={item.link} key={subIndex}>
                          <div
                            className={`flex items-center px-4 py-2  border-l-2 ${
                              activeItem === item.name
                                ? "text-black font-semibold"
                                : "text-gray-800"
                            } hover:bg-gray-100 hover:border-black`}
                            onClick={() => setActiveItem(item.name)}
                          >
                            <span
                              className={`w-1 h-4 rounded-full mr-3 ${
                                activeItem === item.name
                                  ? "bg-black border-black"
                                  : "bg-transparent"
                              }`}
                            ></span>
                            {item.name}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inline Submenu when Expanded */}
                {!isCollapsed && (
                  <div className="ml-4 mt-1 space-y-1">
                    {menu.submenu.map((item, subIndex) => (
                      <Link href={item.link} key={subIndex}>
                        <div
                          className={`px-5 py-2 text-sm  border-l  border-white-100 ${
                            activeItem === item.name
                              ? "text-black font-semibold ${theme.color} border-white hover:border-white"
                              : "text-white"
                          } ${theme.hover}`}
                          onClick={() => setActiveItem(item.name)}
                        >
                          {item.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>

      {/* Utility Menus */}
      <div className="mt-auto border-t border-gray-200">
        <nav className="flex flex-col mt-2 space-y-2">
          {utilityMenus.map((menu, index) => (
            <Link href={menu.link} key={index}>
              <div
                className={`flex items-center p-3 space-x-2 cursor-pointer hover:bg-gray-800 ${
                  activeItem === menu.title
                    ? "text-black font-semibold"
                    : "text-white"
                }`}
                onClick={() => setActiveItem(menu.title)}
              >
                <menu.icon className="w-6 h-6" />
                {!isCollapsed && <span>{menu.title}</span>}
              </div>
            </Link>
          ))}
        </nav>
      </div>

      {/* Theme Selector */}
      <div className="p-3 border-t border-gray-200">
        {!isCollapsed && <h3 className="text-sm font-semibold mb-2">เปลี่ยนธีมสี</h3>}
        <div className="flex space-x-2">
          {themes.map((t) => (
            <button
              key={t.name}
              onClick={() => setTheme(t)}
              className={`w-6 h-6 rounded-full border-2 ${
                theme.name === t.name ? "border-black" : "border-gray-300"
              } ${t.color}`}
            />
          ))}
        </div>
      </div>
    </div>
  );

}
