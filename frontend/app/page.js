"use client";

import React from "react";
import SidebarLayout from "../components/layouts/SidebarLayout";
import { ChatBubbleOvalLeftIcon, DocumentIcon, ShoppingBagIcon, TruckIcon, MapPinIcon } from "@heroicons/react/24/outline";

const HomePage = () => {
  const totalPoints = 128;
  const completedPoints = 53;
  const failedPoints = 2;
  const remainingPoints = totalPoints - completedPoints - failedPoints;

  const completedPercentage = (completedPoints / totalPoints) * 100;
  const failedPercentage = (failedPoints / totalPoints) * 100;
  const remainingPercentage = (remainingPoints / totalPoints) * 100;

  return (
    <SidebarLayout headerTitle="ภาพรวม">
      <div className="flex justify-center bg-gray-50 min-h-screen overflow-auto">
        <div className="w-full  p-4">


          {/* Main Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card: ยอดขายหน้าร้านวันนี้ */}
            <div className="bg-white p-6 rounded-lg shadow-lg row-span-2">
              <h2 className="text-sm font-medium text-gray-600 mb-2">
                ยอดขายหน้าร้านวันนี้
              </h2>
              <p className="text-3xl font-bold text-orange-600">฿120,000</p>
              <ul className="mt-4 space-y-2">
                <li className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="w-4 h-4 rounded-full bg-blue-500 mr-2"></span>
                    <span className="text-gray-600">ปทุม</span>
                  </div>
                  <span className="text-gray-700 font-medium">฿80,000</span>
                </li>
                <li className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="w-4 h-4 rounded-full bg-green-500 mr-2"></span>
                    <span className="text-gray-600">นนทบุรี</span>
                  </div>
                  <span className="text-gray-700 font-medium">฿25,000</span>
                </li>
                <li className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="w-4 h-4 rounded-full bg-pink-500 mr-2"></span>
                    <span className="text-gray-600">หนองจอก</span>
                  </div>
                  <span className="text-gray-700 font-medium">฿15,000</span>
                </li>
                <li className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="w-4 h-4 rounded-full bg-purple-500 mr-2"></span>
                    <span className="text-gray-600">ชลบุรี</span>
                  </div>
                  <span className="text-gray-700 font-medium">฿25,000</span>
                </li>
                <li className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="w-4 h-4 rounded-full bg-green-500 mr-2"></span>
                    <span className="text-gray-600">บางปู</span>
                  </div>
                  <span className="text-gray-700 font-medium">฿15,000</span>
                </li>
              </ul>
            </div>

            {/* Card: ยอดส่งวันนี้ */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-sm font-medium text-gray-600 mb-2">
                ยอดส่งวันนี้
              </h2>
              <p className="text-3xl font-bold text-blue-600">฿150,000</p>
              <p className="text-sm text-gray-600 mt-2 font-bold">
                ส่งแล้ว: 53 จุดจาก 128 จุด (฿70,000)
              </p>
              <p className="text-sm text-red-500 mt-2">
                ส่งไม่สำเร็จ: 2 จุด (฿5,000)
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4 relative">
                <div
                  className="bg-green-400 h-2 rounded-l-full absolute"
                  style={{ width: `${completedPercentage}%` }}
                ></div>
                <div
                  className="bg-red-400 h-2 absolute"
                  style={{ width: `${failedPercentage}%`, left: `${completedPercentage}%` }}
                ></div>
                <div
                  className="bg-gray-300 h-2 rounded-r-full absolute"
                  style={{ width: `${remainingPercentage}%`, left: `${completedPercentage + failedPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Card: ยอดส่งพรุ่งนี้ */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-sm font-medium text-gray-600 mb-2">
                ยอดส่งพรุ่งนี้ (12/1/2024)
              </h2>
              <p className="text-3xl font-bold text-blue-600">฿120,400</p>
              <div className="flex items-center mt-2 text-blue-500">
                <MapPinIcon className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">102 จุด</span>
              </div>
            </div>

            {/* Card: รายละเอียดการจัดส่ง */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-sm font-medium text-gray-600 mb-2">
                ติดตามการจัดส่งวันนี้
              </h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>เบอร์ 1: 3/15 จุด (฿6,500/฿30,000) มีนบุรี</li>
                <li>เบอร์ 2: 4/20 จุด (฿3,000/฿50,000) คลอง 8 ล่าง</li>
                <li>เบอร์ 3: 5/22 จุด (฿8,000/฿45,000) สายไหม</li>
                <li>เบอร์ 4: 7/23 จุด (฿12,000/฿70,000) นครนายก</li>
                <li>เบอร์ 5: 10/30 จุด (฿20,000/฿60,000) บางละมุง</li>
              </ul>
            </div>
             {/* Card: แบ่งงานส่งพรุ่งนี้ */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-sm font-medium text-gray-600 mb-2">
                แบ่งงานส่งพรุ่งนี้
              </h2>
              <p className="text-sm text-green-600">แบ่งแล้ว: 60 จุด 
                <span className="text-red-600"> ยังไม่ได้แบ่ง: 42 จุด</span>
              </p>
              <p className="text-sm text-gray-600"></p>
              <ul className="space-y-2 text-sm text-gray-600 mt-2">
                <li>เบอร์ 1: 20 จุด (฿30,000)</li>
                <li>เบอร์ 2: 25 จุด (฿23,000)</li>
                <li>เบอร์ 3: 32 จุด (฿48,000)</li>
                <li>เบอร์ 4: 19 จุด (฿21,500)</li>
                <li>เบอร์ 5: 12 จุด (฿12,030)</li>
              </ul>
            </div> 
          </div>

         
          
          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Card: จำนวนข้อความรอตอบ */}
            <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
              <ChatBubbleOvalLeftIcon className="h-10 w-10 text-orange-500 mr-4" />
              <div>
                <h2 className="text-sm font-medium text-gray-600">ข้อความรอตอบ</h2>
                <p className="text-2xl font-bold text-gray-700">25 ข้อความ</p>
              </div>
            </div>

            {/* Card: บิลรอตรวจสอบ */}
            <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
              <DocumentIcon className="h-10 w-10 text-blue-500 mr-4" />
              <div>
                <h2 className="text-sm font-medium text-gray-600">บิลรอตรวจสอบ</h2>
                <p className="text-2xl font-bold text-gray-700">15 บิล</p>
              </div>
            </div>

            {/* Card: สินค้าต้องแพ็คส่งวันนี้ */}
            <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
              <ShoppingBagIcon className="h-10 w-10 text-green-500 mr-4" />
              <div>
                <h2 className="text-sm font-medium text-gray-600">สินค้าต้องแพ็ค</h2>
                <p className="text-2xl font-bold text-gray-700">50 รายการ</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Table: ขนส่งกำหนดส่งวันนี้ */}
          <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-sm font-medium text-gray-600 mb-4">
              ขนส่งกำหนดส่งวันนี้
            </h2>
            <table className="w-full text-sm text-left text-gray-700">
              <thead>
                <tr className="text-gray-600 bg-gray-200">
                  <th className="py-2 px-4">ขนส่ง</th>
                  <th className="py-2 px-4">โอนแล้วรอส่ง</th>
                  <th className="py-2 px-4">ส่งแล้ว</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4">นิ่ม</td>
                  <td className="py-2 px-4">5</td>
                  <td className="py-2 px-4">10</td>
                </tr>
                <tr>
                  <td className="py-2 px-4">อินเตอร์</td>
                  <td className="py-2 px-4">3</td>
                  <td className="py-2 px-4">8</td>
                </tr>
                <tr>
                  <td className="py-2 px-4">รถรั้ว</td>
                  <td className="py-2 px-4">0</td>
                  <td className="py-2 px-4">20</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-sm font-medium text-gray-600 mb-4">
              ขนส่งกำหนดส่งวันนี้
            </h2>
            <table className="w-full text-sm text-left text-gray-700">
              <thead>
                <tr className="text-gray-600 bg-gray-200">
                  <th className="py-2 px-4">ขนส่ง</th>
                  <th className="py-2 px-4">โอนแล้วรอส่ง</th>
                  <th className="py-2 px-4">ส่งแล้ว</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4">นิ่ม</td>
                  <td className="py-2 px-4">5</td>
                  <td className="py-2 px-4">10</td>
                </tr>
                <tr>
                  <td className="py-2 px-4">อินเตอร์</td>
                  <td className="py-2 px-4">3</td>
                  <td className="py-2 px-4">8</td>
                </tr>
                <tr>
                  <td className="py-2 px-4">รถรั้ว</td>
                  <td className="py-2 px-4">0</td>
                  <td className="py-2 px-4">20</td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default HomePage;
