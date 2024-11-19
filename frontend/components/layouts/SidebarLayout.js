// src/components/layouts/SidebarLayout.js
import React from "react";
import Sidebar from "../Sidebar";
import DynamicHeightWrapper from "./DynamicHeightWrapper";

const SidebarLayout = ({ children, headerTitle, actionBar }) => {
    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <Sidebar className="flex-shrink-0" />

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-gradient-to-r from-blue-600 via-white to-teal-500 px-0 py-0.5">
                <div className="h-lvh bg-white box-shadow rounded flex-1 flex-col overflow-y-hidden">
                    {/* Header */}
                    <header className="shadow-sm p-3 bg-gradient-to-bl from-white via-purple-50 to-blue-50 opacity-80 backdrop-blur-lg">
                        <h1 className="text-2xl font-bold">{headerTitle}</h1>
                        {actionBar}
                    </header>

                    {/* Main Content */}
                    <DynamicHeightWrapper>
                        {children}
                    </DynamicHeightWrapper>
                </div>
            </div>
        </div>
    );
};

export default SidebarLayout;
