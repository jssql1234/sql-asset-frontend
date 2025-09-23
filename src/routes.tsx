import { Routes, Route, Navigate } from "react-router-dom";
import { Button } from "./components/ui/components";
import { lazy } from "react";

const Testing = lazy(() => import("@/example/example"));

export function Home() {
  return <Button>Hello</Button>;
}

function About() {
  return <h1>About Page</h1>;
}

function Login() {
  return <h1>Login Page</h1>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Root path */}
      <Route path="/" element={<Testing />} />

      {/* Other pages */}
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />

      {/* Catch-all (404 redirect) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}
