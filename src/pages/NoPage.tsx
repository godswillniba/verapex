import React from "react";
import { Link } from "react-router-dom";

const NoPage: React.FC = () => {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "50px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "black",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#333",
      }}
    >
      <h1
        style={{
          fontSize: "48px",
          marginBottom: "20px",
          color: "#dc3545",
        }}
      >
        404 - Page Not Found
      </h1>
      <p style={{ fontSize: "18px", marginBottom: "30px" }}>
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        style={{
          color: "#007bff",
          textDecoration: "none",
          fontSize: "16px",
          border: "1px solid #007bff",
          padding: "10px 20px",
          borderRadius: "5px",
          transition: "background-color 0.3s, color 0.3s",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLAnchorElement).style.backgroundColor = "#007bff";
          (e.target as HTMLAnchorElement).style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLAnchorElement).style.backgroundColor = "transparent";
          (e.target as HTMLAnchorElement).style.color = "#007bff";
        }}
      >
        Go back to Home
      </Link>
    </div>
  );
};

export default NoPage;