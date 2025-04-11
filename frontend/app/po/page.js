// app/po/page.js
export const metadata = {
    title: 'ระบบสั่งซื้อสินค้า (PO Management)',
    description: 'จัดการการสั่งซื้อสินค้าและวางแผนสต็อก',
  };
  
  import ClientPOPage from './ClientPOPage';
  
  export default function POPage() {
    // Server components can prepare initial data here if needed
    return (
      <ClientPOPage />
    );
  }