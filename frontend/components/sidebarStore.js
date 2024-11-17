import { create } from 'zustand';

const useSidebarStore = create((set) => ({
  isCollapsed: false,
  theme: { name: "Blue", color: "bg-blue-600", hover: "hover:bg-blue-800" },
  toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setTheme: (theme) => set({ theme }),
}));

export default useSidebarStore;
