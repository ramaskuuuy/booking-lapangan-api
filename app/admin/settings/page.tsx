"use client";

import { useState } from "react";

export default function AdminSettings() {
  const [siteName, setSiteName] = useState("BookAja!");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Settings</h1>
      <p className="text-gray-500 text-sm mb-8">Pengaturan aplikasi</p>

      <div className="max-w-xl bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Nama Aplikasi</label>
          <input type="text" value={siteName} onChange={e => setSiteName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59]" />
        </div>
        {saved && <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">Tersimpan!</p>}
        <button onClick={handleSave} className="w-full py-3 bg-[#4a7c59] hover:bg-[#3a6347] text-white font-bold rounded-xl transition-colors">
          Simpan Pengaturan
        </button>
      </div>
    </div>
  );
}
