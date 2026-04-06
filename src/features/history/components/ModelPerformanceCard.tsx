"use client";

export default function ModelPerformanceCard() {
  return (
    <div className="bg-white rounded-xl shadow-md border p-6">
      <h2 className="font-semibold mb-4">Model Performance</h2>

      <div className="grid grid-cols-2 gap-4">

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">MAE</p>
          <p className="text-xl font-bold text-blue-600">1.234</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">MSE</p>
          <p className="text-xl font-bold text-green-600">2.456</p>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">RMSE</p>
          <p className="text-xl font-bold text-orange-600">1.567</p>
        </div>

        <div className="bg-emerald-100 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Accuracy</p>
          <p className="text-xl font-bold text-emerald-700">92.45%</p>
        </div>

      </div>
    </div>
  );
}
