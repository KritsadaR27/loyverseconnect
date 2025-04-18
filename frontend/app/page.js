"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';

import { DocumentIcon, ShoppingCartIcon, ArrowRightIcon } from '@heroicons/react/outline';
import Navigation from '../components/Navigation';

const HomePage = () => {
    const router = useRouter();

    const handleButtonClick = (action) => {
        if (action === 'Receipt') {
            router.push('/CreateReceipt');
        } else if (action === 'CreatePO') {
            router.push('/po/edit');
        } else if (action === 'Transfer') {
            router.push('/feature/InventoryManagement');
        }else if (action === 'syncdata') {
          router.push('/settings/syncdata');
        }
        
    };

    return (
      <div>
        <Navigation /> {/* เพิ่ม Navigation ที่นี่ */}
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-500 to-pink-500">
          <div className='bg-white opacity-85 p-20 rounded-xl text-center'>
            <h1 className="text-4xl font-bold text-blue-500">เลือกสิ่งที่คุณต้องการทำ</h1>
            <div className="mt-8 flex-col space-y-4">
              <button onClick={() => handleButtonClick('Receipt')} className="px-4 py-2 m-3 text-white bg-blue-600 rounded hover:bg-blue-700">
                <DocumentIcon className="h-5 w-5 inline" /> สร้าง Receipt
              </button>
              <button onClick={() => handleButtonClick('CreatePO')} className="px-4 py-2 m-3 text-white bg-green-600 rounded hover:bg-green-700">
                <ShoppingCartIcon className="h-5 w-5 inline" /> สร้าง PO
              </button>
              <button onClick={() => handleButtonClick('Transfer')} className="px-4 py-2 m-3 text-white bg-red-600 rounded hover:bg-red-700">
                <ArrowRightIcon className="h-5 w-5 inline" /> โอนของ
              </button>
              <button onClick={() => handleButtonClick('syncdata')} className="px-4 py-2 m-3 text-white bg-red-600 rounded hover:bg-red-700">
                <ArrowRightIcon className="h-5 w-5 inline" /> SyncData ...
              </button>
            </div> 
          </div>
        </div>
      </div>
    );
};

export default HomePage;
