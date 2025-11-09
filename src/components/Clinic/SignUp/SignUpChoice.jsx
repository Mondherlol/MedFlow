import { useNavigate } from "react-router-dom";
import { User, Stethoscope } from "lucide-react";
import {withAlpha} from "../../../utils/colors";


const Card = ({ className = "", children }) => (
  <div
    className={[
      "relative rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur",
      "shadow-[0_20px_50px_-22px_rgba(0,0,0,0.25)]",
      className,
    ].join(" ")}
  >
    <span className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-sky-200/25 blur-2xl" />
    {children}
  </div>
);

function OptionCard({ icon: Icon, tone = "sky", title, onClick, aria }) {
  const circleClasses =
    tone === "sky"
      ? "bg-gradient-to-br from-sky-400 to-sky-600 text-white"
      : "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aria || title}
      className={[
        "cursor-pointer ",
        "group relative w-full h-40 flex items-center justify-center rounded-2xl",
        "transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-opacity-30",
      ].join(" ")}
    >
      <div className={["flex h-full w-full items-center justify-center rounded-2xl", "bg-white/30"].join(" ")}>
        <div className="flex flex-col items-center gap-3">
          <div className={["rounded-full p-4 shadow-md", circleClasses].join(" ")}>
            <Icon className="h-9 w-9" />
          </div>
          <div className="font-semibold text-lg text-slate-900">{title}</div>
        </div>
      </div>
    </button>
  );
}

export default function SignUpChoice({ onSelect, clinic, theme }) {
  const navigate = useNavigate();

  return (
    <div
         style={{ background: `radial-gradient(1000px 500px at 95% -10%, ${withAlpha(theme.primary, .10)} 0%, transparent 55%), radial-gradient(900px 480px at -10% 110%, ${withAlpha(theme.accent, .10)} 0%, transparent 55%), #f8fafc` }}
         className="min-h-[60dvh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl">
        <Card className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center justify-center gap-2">
              {/* <Building2 className="h-6 w-6 text-slate-200" /> */}
              <span>Inscription — {clinic.name}</span>
            </h2>
            <p className="text-sm text-slate-600">
                Sélectionnez votre profil pour commencer l'inscription.
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <OptionCard
              icon={Stethoscope}
              tone="sky"
              title="Je suis un professionnel"
              onClick={() => navigate("/contact")}
            />
            <OptionCard
              icon={User}
              tone="emerald"
              title="Je suis un patient"
              onClick={() => onSelect && onSelect("patient")}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
