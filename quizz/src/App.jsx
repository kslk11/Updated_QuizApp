import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./Hooks/useTheame";
import Header from "./Common/Header";
import Sidebar from "./Common/Sidebar";
import Footer from "./Common/Footer";
import Home from "./Components/Home";
import Login from "./Auth/Login";
import Signup from "./Auth/Signup";
import Categories from "./Components/Categories";
import Set from "./Components/Set";
import Quiz from "./Components/Quiz";
import StartTest from "./Components/StartTest";
import Result from "./Components/Result";
import StudentDashboard from "./Components/StudentDashboard"

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Admin from "./Components/AdminPage"

import Protected from "./Auth/Protected"
import AuthProtected from "./Auth/AuthProtected"
import AttemptHistory from "./Components/Attempthistory";
import Leaderboard from "./Components/Leaderboard";
import AdminDashboard from "./Components/Admindashboard";

function App() {
  
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="flex h-screen overflow-hidden">

          <div className="flex-shrink-0 h-screen overflow-y-auto">
            <Sidebar />
          </div>

          <div className="flex flex-col flex-1 h-screen overflow-y-auto">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/"                              element={<Home />} />

                <Route path="/login"                         element={<AuthProtected><Login /></AuthProtected>} />
                <Route path="/signup"                        element={<AuthProtected><Signup /></AuthProtected> } />

                <Route path="/categories"                    element={<Protected><Categories /></Protected>} />
                <Route path="/categories/:categoryId/sets"   element={<Protected> <Set /></Protected>} />
                <Route path="/sets/:setId/quiz"              element={<Protected><Quiz /></Protected>} />
                <Route path="/sets/:setId/start-test"        element={<Protected><StartTest /></Protected>} />
                <Route path="/result/:resultId"              element={<Protected><Result /></Protected>} />
                <Route path="/admin"                         element={<Protected><Admin /></Protected>} />
                <Route path="/StudentDashboard"              element={<StudentDashboard />} />
                <Route path="/history"                       element={<AttemptHistory />} />
                <Route path="/leaderboard/:quizId" element={<Leaderboard />} />                
                <Route path="/adminDashboard" element={<AdminDashboard />} />                
              </Routes>
            </main>
            <Footer />
          </div>

        </div>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="colored"
          />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;