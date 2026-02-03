const Dashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold">Users</h2>
          <p className="text-2xl mt-2">—</p>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold">Products</h2>
          <p className="text-2xl mt-2">—</p>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold">Sales</h2>
          <p className="text-2xl mt-2">—</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
