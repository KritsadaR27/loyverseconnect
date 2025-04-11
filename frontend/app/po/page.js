// app/po/page.js
export const metadata = {
    title: 'ระบบสั่งซื้อสินค้า (PO Management)',
    description: 'จัดการการสั่งซื้อสินค้าและวางแผนสต็อก',
  };
  
  import ClientPOPage from './ClientPOPage';
  
  export default function POPage() {
    // ในส่วนนี้สามารถเพิ่มการเตรียมข้อมูลเริ่มต้นจาก server ได้ แต่ในที่นี้จะใช้ Client fetching
  
    return (
      <ClientPOPage />
    );
  }