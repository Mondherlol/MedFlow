import { useNavigate } from "react-router-dom";

function MiniAction({ title, Icon, to, onClick }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => (onClick ? onClick() : navigate(to))}
      className="inline-flex items-center gap-3 px-3 py-2 rounded-lg bg-white border border-slate-100 shadow-sm text-sm hover:shadow-md transform hover:-translate-y-0.5 transition cursor-pointer hover:bg-slate-50"
      title={title}
    >
      <span className="w-8 h-8 rounded-md flex items-center justify-center bg-slate-100">
        <Icon className="w-4 h-4 text-slate-600" />
      </span>
      <span className="text-slate-700 font-medium">{title}</span>
    </button>
  );
}

export default MiniAction;