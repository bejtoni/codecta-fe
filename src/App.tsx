import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ImageCropperPage from "./pages/ImageCropperPage";
import LoginPage from "./pages/LoginPage";
import AuthGuard from "./components/AuthGuard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <ImageCropperPage />
            </AuthGuard>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
