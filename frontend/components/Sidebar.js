"use client";
import React, { useState } from "react";
import Link from "next/link";
import logo from "../app/assets/logo192.png"; // Import the logo
import Image from "next/image"; // Import Image component from Next.js
import useSidebarStore from "./sidebarStore"; // Adjust the path as needed


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
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

const themes = [
  { name: "Blue", color: "bg-blue-600", hover: "hover:bg-blue-800" },
  { name: "Green", color: "bg-green-200", hover: "hover:bg-green-600" },
  { name: "Purple", color: "bg-purple-800", hover: "hover:bg-purple-600" },
  { name: "Gray", color: "bg-gray-600", hover: "hover:bg-gray-800" },
];

const menus = [
  {
    title: "สต็อกสินค้า",
    icon: CubeIcon,
    submenu: [
      { name: "สต็อกสินค้า *", link: "/inventory" },
      { name: "จุดสั่งซื้อซ้ำ", link: "/reorder-points" },
      { name: "การหมุนเวียนสต็อก", link: "/stock-rotation" },
    ],
  },
  {
    title: "จัดซื้อ",
    icon: ShoppingCartIcon,
    submenu: [
      { name: "ใบสั่งซื้อ", link: "/po" },
      { name: "สร้างใบสั่งซื้อ", link: "/po/edit" },
      { name: "ตั้งค่าซัพพลายเออร์ *", link: "/settings/supplier" },
    ],
  }, {
    title: "การขาย  (1)",
    icon: ChartBarIcon,
    submenu: [
      { name: "การประมวลผลคำสั่งซื้อ", link: "/order-processing" },
      { name: "การเชื่อมต่อช่องทางการขาย", link: "/sales-channels" },
      { name: "ใบเสร็จ *", link: "/sales/receipts" },
      { name: "รายการขายตามสินค้า *", link: "/sales/salesbyitems" },
      { name: "ขายตามสินค้าตามวัน *", link: "/sales/salesbyday" },
      { name: "ขายตามหมวดหมู่ *", link: "/sales/salebycategory" },


    ],
  },
  {
    title: "แชท (2)",
    icon: ChatBubbleBottomCenterIcon,
    submenu: [
      { name: "การจัดการแชทบอท", link: "/chatbot-management" },
      { name: "การสร้างคำสั่งซื้อ", link: "/order-creation" },
      { name: "การเลือกวิธีการจัดส่ง", link: "/delivery-selection" },
    ],
  },
  {
    title: "จัดส่ง (2)",
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

const utilityMenus = [
  { title: "โปรไฟล์", icon: UserCircleIcon, link: "/profile" },
  { title: "ตั้งค่า", icon: Cog6ToothIcon, link: "/settings/syncdata" },
];

const Sidebar = () => {

  const { isCollapsed, toggleSidebar, theme, setTheme } = useSidebarStore();
  const [activeItem, setActiveItem] = useState("");

  return (
    <div
      className={`flex flex-col h-screen z-50 ${isCollapsed ? "w-16" : "w-72"
        } ${theme.color} transition-all`}
      style={{ overflowY: isCollapsed ? "visible" : "auto" }}
    >
      {/* Logo Section */}
      <div className={`flex items-center justify-center py-4 z-50 ${theme.hover}`}>
        <Image
          src={logo}
          alt="Logo"
          width={40}
          height={40}
          className={`rounded-full bg-white p-2 transition-transform ${isCollapsed ? "scale-75" : "scale-100"
            }`}
        />
        {!isCollapsed && (
          <span className="ml-3 text-white font-semibold text-xl">ร้านลุงรวย</span>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`p-3 focus:outline-none ${theme.hover}`}
      >
        {isCollapsed ? (
          <ChevronDoubleRightIcon className="w-6 h-6 text-white" />
        ) : (
          <ChevronDoubleLeftIcon className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Menu Section */}
      <nav className="flex flex-col mt-4 space-y-2 z-50">
        {menus.map((menu, index) => (
          <div key={index} className="relative group">
            <Link href="#">
              <div
                className={`flex items-center p-3 ${isCollapsed ? "justify-center" : "space-x-2"
                  } cursor-pointer ${theme.hover}`}
                onClick={() => setActiveItem(menu.title)}
              >
                <menu.icon className="w-6 h-6 text-white" />
                {!isCollapsed && <span className="text-white">{menu.title}</span>}
              </div>
            </Link>

            {/* Submenu */}
            {menu.submenu && (
              <div
                className={`${isCollapsed
                  ? "absolute left-16 top-0 hidden group-hover:block bg-white rounded shadow-lg p-3 w-56"
                  : "ml-4 mt-2 ${theme.hover}"
                  }`}
              >
                <div
                  className={`  ${isCollapsed
                    ? "text-black"
                    : "text-white"
                    }`}
                >
                  {menu.submenu.map((item, subIndex) => (
                    <Link href={item.link} key={subIndex}>
                      <div
                        className={`px-4 py-2 border-l ${isCollapsed ? "hover:border-black hover:bg-gray-200" : theme.hover
                          }`}
                      >
                        {item.name}
                      </div>
                    </Link>

                  ))}

                </div>
              </div>
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
                className={`flex items-center p-3 ${activeItem === menu.title
                  ? "text-black font-semibold"
                  : "text-white"
                  } hover:bg-gray-800`}
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
              className={`w-6 h-6 rounded-full border-2 ${theme.name === t.name ? "border-black" : "border-gray-300"
                } ${t.color}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
