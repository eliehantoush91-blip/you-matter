import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Tests from "./pages/Tests";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorPatients from "./pages/DoctorPatients";
import DoctorAppointments from "./pages/DoctorAppointments";
import DoctorMessages from "./pages/DoctorMessages";
import DoctorAnalysis from "./pages/DoctorAnalysis";
import DoctorProfile from "./pages/DoctorProfile";
import DoctorNotifications from "./pages/DoctorNotifications"; 
import PatientDashboard from "./pages/PatientDashboard";
import BookAppointment from "./pages/BookAppointment";
import PsychologicalTests from "./pages/PsychologicalTests";
import TestResults from "./pages/TestResults";
import TestResultDetails from "./pages/TestResultDetails";
import MessageDoctor from "./pages/MessageDoctor";
import TrackProgress from "./pages/TrackProgress";
import PatientProfile from "./pages/PatientProfile";
import UpcomingAppointments from "./pages/UpcomingAppointments";
import Doctors from "./pages/Doctors";

import TestDetail from "./pages/TestDetail";
import TestTaking from "./pages/TestTaking";
import BigFiveTest from "./pages/BigFiveTest";
import GoNoGoTest from "./pages/GoNoGoTest";
import StroopTest from "./pages/StroopTest";

import NotFound from "./pages/NotFound";
import Articles from "./pages/Articles";
import  Contact  from "./pages/Contact";
import ArticleDetails from "./pages/ArticleDetails";

import { Provider } from "react-redux";
import store from "./Redux/store";
const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/tests" element={<Tests />} />
              <Route path="/test/:id" element={<TestDetail />} />
              <Route path="/test/:id/start" element={<TestTaking />} />
              <Route path="/big-five/start" element={<BigFiveTest />} />
             <Route path="/game/gonogo" element={<GoNoGoTest />} />
             <Route path="/game/stroop" element={<StroopTest />} />


              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor-dashboard/patients" element={<DoctorPatients />} />
              <Route path="/doctor-dashboard/appointments" element={<DoctorAppointments />} />
              <Route path="/doctor-dashboard/messages" element={<DoctorMessages />} />
              <Route path="/doctor-dashboard/analysis" element={<DoctorAnalysis />} />
              <Route path="/doctor-dashboard/profile" element={<DoctorProfile />} />
              <Route path="/doctor-dashboard/notifications" element={<DoctorNotifications />} />
              <Route path="/patient-dashboard" element={<PatientDashboard />} />
              <Route path="/book-appointment" element={<BookAppointment />} />
              <Route path="/psychological-tests" element={<PsychologicalTests />} />
              <Route path="/test-results" element={<TestResults />} />
              <Route path="/test-results/:id" element={<TestResultDetails />} />
              <Route path="/message-doctor" element={<MessageDoctor />} />
              <Route path="/chat/:patientId" element={<MessageDoctor />} />
              <Route path="/track-progress" element={<TrackProgress />} />
              <Route path="/profile" element={<PatientProfile />} />
              <Route path="/upcoming-appointments" element={<UpcomingAppointments />} />
              <Route path="/doctors" element={<Doctors />} />
               <Route path="/articles" element={<Articles />} />
                 <Route path="/articles/:id" element={<ArticleDetails />} />
               <Route path="/contact" element={<Contact />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </Provider>
);

export default App;
