import ContactSection from "../../components/Clinic/ClinicLanding/ContactSection";
import { useClinic } from "../../context/clinicContext";
import  {withAlpha} from "../../utils/colors";



export default function Contact() {

    const {clinic, theme} = useClinic();
    if(!clinic) return null;

  return (
    <div className="min-h-[70dvh] flex items-center justify-center px-4"
         style={{   background: `radial-gradient(1000px 500px at 95% -10%, ${withAlpha(theme.primary, .10)} 0%, transparent 55%), radial-gradient(900px 480px at -10% 110%, ${withAlpha(theme.accent, .10)} 0%, transparent 55%), #f8fafc`}}>

        <ContactSection clinic={clinic} theme={theme}  withAlpha={withAlpha}/>
    </div>
        
)
}