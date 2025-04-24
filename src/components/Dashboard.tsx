const Pages = [
  { page: "add Student", id: "1" },
  { page: "add teacher", id: "2" },
  { page: "add subject", id: "3" },
];
const Dashboard = () => {
  return (
    <div className="w-44 h-screen shadow-2xl p-5">
      <ul className="flex flex-col justify-between">
        {Pages.map((page) => {
          return (
            <li
              className="btn border-none mt-3 p-2 w-full capitalize  cursor-pointer hover:btn-ghost"
              key={page.id}
            >
              {page.page}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Dashboard;
