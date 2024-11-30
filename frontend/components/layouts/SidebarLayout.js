// src/components/layouts/SidebarLayout.js
import React from "react";
import Sidebar from "../Sidebar";

import DynamicHeightWrapper from "./DynamicHeightWrapper";

const SidebarLayout = ({ children, headerTitle, actionBar, onScroll }) => {
    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <Sidebar className="flex-shrink-0" />
            <div className="flex-1 flex flex-col  bg-gradient-to-r from-blue-600  from-10% via-white  to-teal-500 to-70% px-0 py-0.5">
                <div className="h-lvh bg-white rounded-tl">
                    {/* Header */}
                    <header className="p-3	max-w-full bg-gradient-to-bl from-white via-purple-50 to-blue-50 backdrop-blur-l z-40 rounded-tl-2xl">
                        <h1 className="text-2xl font-bold">{headerTitle}</h1>
                        {actionBar}
                    </header>
                    {/* Page Content */}
                    <DynamicHeightWrapper headerTitle={headerTitle} actionBar={actionBar} onScroll={onScroll}>

                        {children}
                    </DynamicHeightWrapper>
                </div>
            </div>
        </div>
    );
};

export default SidebarLayout;
