// src/components/layouts/SidebarLayout.js
import React from "react";
import Sidebar from "../Sidebar";
import PageContent from "./PageContent"; // นำเข้า PageContent

const SidebarLayout = ({ children, headerTitle, actionBar }) => {
    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <Sidebar className="flex-shrink-0" />

            {/* Page Content */}
            <PageContent headerTitle={headerTitle} actionBar={actionBar}>
                {children}
            </PageContent>
        </div>
    );
};

export default SidebarLayout;
