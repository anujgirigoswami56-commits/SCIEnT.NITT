import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./pages/Home";
import Timeline from "./pages/Timeline";
import TimelineYear from "./pages/TimelineYear";
import Gallery from "./pages/Gallery";
import ProjectSection from "./pages/ProjectSection";
import Contact from "./pages/Contacts";

import Team from "./features/members/pages/Team";
import OpenHouse from "./pages/OpenHouse";
import Inventory from "./pages/Inventory";
import ESummit from "./pages/ESummit";
import Transfinitte from "./pages/Transfinitte";
import OpenDay from "./pages/OpenDay";
import Spider2024 from "./components/ProjectList/Spider/Spider2024";
import Spider2023 from "./components/ProjectList/Spider/Spider2023";
import Spider2022 from "./components/ProjectList/Spider/Spider2022";
import Psi2023 from "./components/ProjectList/onefiles/Psi2023";
import Fhl2023 from "./components/ProjectList/onefiles/Fhl2023";
import DB2023 from "./components/ProjectList/onefiles/DB2023";
import RMI2023 from "./components/ProjectList/RMI/RMI2023";
import RMI2022 from "./components/ProjectList/RMI/RMI2022";
import RMI2021 from "./components/ProjectList/RMI/RMI2021";
import RMI2020 from "./components/ProjectList/RMI/RMI2020";
import ThreD2023 from "./components/ProjectList/onefiles/ThreD2023";
import Delta2024 from "./components/ProjectList/DeltaClub/Delta2024";
import Delta2023 from "./components/ProjectList/DeltaClub/Delta2023"
import Delta2022 from "./components/ProjectList/DeltaClub/Delta2022";
import Delta2021 from "./components/ProjectList/DeltaClub/Delta2021";
import Ecell2023 from "./components/ProjectList/onefiles/Ecell2023";
import DC2024 from "./components/ProjectList/DC/DC2024";
import DC2023 from "./components/ProjectList/DC/DC2023";
import DC2022 from "./components/ProjectList/DC/DC2022";
import One802023 from "./components/ProjectList/onefiles/One802023";
import EVER2023 from "./components/ProjectList/onefiles/Ever2023";
import Graphique from "./components/ProjectList/onefiles/graphique";
import Sigma from "./components/ProjectList/onefiles/sigma";
import Maximus from "./components/ProjectList/onefiles/Maximus";
import Profnitt from "./components/ProjectList/onefiles/profnitt";
import Naksha from "./components/ProjectList/onefiles/Naksha";
import { NavMobile } from "./components/nav-mobile";
import Annualday from "./pages/Annualday";

 import ClubsPage from "./pages/ClubsPage";
 import ProjectsPage from "./pages/ProjectsPage";
 import ProjectDetailsPage from "./pages/ProjectDetailsPage";

import Inventive from "./features/inventive/pages/Inventive";
import InventivePage from "./features/inventive/pages/InventivePage" ;
import Contrive from "./features/contrive/pages/Contrive";
import ContrivePage from "./features/contrive/pages/ContrivePage";
import OpenhousePage from "./features/openhouse/pages/openhousepage";
import FC_coming_soon from "./features/faculty-connect/ComingSoon";

import { AuthProvider } from './features/admin/context/AuthContext';
import ProtectedRoute from './features/admin/components/ProtectedRoute';
import AdminLogin from './features/admin/pages/AdminLogin';
import ForgotPassword from './features/admin/pages/ForgotPassword';
import TeamDashboard from './features/admin/pages/TeamDashboard';
import TeamMemberForm from './features/admin/pages/TeamMemberForm';
import ProjectDashboard from './features/admin/pages/ProjectDashboard';
import ProjectForm from './features/admin/pages/ProjectForm';
import SettingsDashboard from './features/admin/pages/SettingsDashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const App = () => {
  return (
    <AuthProvider>
      <>
        <ToastContainer theme="dark" />
        <Routes>
        
        {/* Club Listing  */}
        <Route path="/clubs"  element={<ClubsPage />} />

        {/* Club Projects Listing   */}
        <Route path="/clubs/:name/projects"  element={<ProjectsPage />} />

        {/* Individual Project Page   */}
        <Route path="/clubs/:name/projects/:projectId" element={<ProjectDetailsPage />} />

        <Route path="/" element={<Home />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/timeline/:year" element={<TimelineYear />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/project" element={<ProjectSection />} />
        <Route path="/inventive" element={<Inventive />} />
        <Route path="/inventiveForm" element={<InventivePage/>} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/contrive" element={<Contrive/>}/>
        <Route path="/contriveForm" element={<ContrivePage/>}/>
        <Route path="/openhouse" element={<OpenhousePage/>}/>
        <Route path="/team" element={<Team/>} />
        <Route path="/Team" element={<Team/>} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faculty-connect" element={<FC_coming_soon />} />
        <Route path="/open-house" element={<OpenHouse />} />
        <Route path="/e-summit" element={<ESummit />} />
        <Route path="/annual-day" element={<Annualday />} />
        <Route path="/transfinitte" element={<Transfinitte />} />
        <Route path="/open-day" element={<OpenDay />} />
        <Route path="/Spider2024" element={<Spider2024 />} />
        <Route path="/Spider2023" element={<Spider2023 />} />
        <Route path="/Spider2022" element={<Spider2022 />} />
        <Route path="/Psi2023" element={<Psi2023 />} />
        <Route path="/Fhl2023" element={<Fhl2023 />} />
        <Route path="/DB2023" element={<DB2023 />} />
        <Route path="/RMI2023" element={<RMI2023 />} />
        <Route path="/RMI2022" element={<RMI2022 />} />
        <Route path="/RMI2021" element={<RMI2021 />} />
        <Route path="/RMI2020" element={<RMI2020 />} />
        <Route path="/3D2023" element={<ThreD2023 />} />
        <Route path="/Delta2024" element={<Delta2024 />} />
        <Route path="/Delta2023" element={<Delta2023 />} />
        <Route path="/Delta2022" element={<Delta2022 />} />
        <Route path="/Delta2021" element={<Delta2021 />} />
        <Route path="/Ecell2023" element={<Ecell2023 />} />
        <Route path="/DC2024" element={<DC2024 />} />
        <Route path="/DC2023" element={<DC2023 />} />
        <Route path="/DC2022" element={<DC2022 />} />
        <Route path="/One802023" element={<One802023 />} />
        <Route path="/EVER2023" element={<EVER2023 />} />
        <Route path="/GRAPHIQUE/2023" element={
         < Graphique/>
        }/>
         <Route path="/SIGMA2023" element={
         < Sigma/>
        }/>
        <Route path="/MAXIMUS/2023" element={
         < Maximus/>
        }/>
        <Route path="/NAKSHA/2023" element={
         < Naksha/>
        }/>
        <Route path="/PROFNITT/2023" element={
         < Profnitt/>
        }/>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/team" element={<ProtectedRoute><TeamDashboard /></ProtectedRoute>} />
        <Route path="/admin/team/new" element={<ProtectedRoute><TeamMemberForm /></ProtectedRoute>} />
        <Route path="/admin/team/edit/:id" element={<ProtectedRoute><TeamMemberForm /></ProtectedRoute>} />
        <Route path="/admin/projects" element={<ProtectedRoute><ProjectDashboard /></ProtectedRoute>} />
        <Route path="/admin/projects/new" element={<ProtectedRoute><ProjectForm /></ProtectedRoute>} />
        <Route path="/admin/projects/edit/:id" element={<ProtectedRoute><ProjectForm /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><SettingsDashboard /></ProtectedRoute>} />

      </Routes>
    </>
    </AuthProvider>
  );
};


export default App;