"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AddCarModal from "@/components/admin/AddCarModal";
import AddTourModal from "@/components/admin/AddTourModal";
import AddAttractionModal from "@/components/admin/AddAttractionModal";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminReports from "@/components/admin/AdminReports";
import Navbar from "@/components/layout/Navbar";

export default function Dashboard() {
  const navigate = useNavigate();
  const [showCarModal, setShowCarModal] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);
  const [showAttractionModal, setShowAttractionModal] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        
        {/* Add Items Section */}
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() => navigate("/admin/cars")}
            variant="outline"
          >
            Manage Cars
          </Button>
          <Button
            onClick={() => setShowCarModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Add Car
          </Button>
          <Button
            onClick={() => setShowTourModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Add Tour
          </Button>
          <Button
            onClick={() => setShowAttractionModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Add Attraction
          </Button>
        </div>

        {/* Analytics Section */}
        <AdminAnalytics />

        {/* Reports Section */}
        <AdminReports />

        {/* Modals */}
        {showCarModal && <AddCarModal onClose={() => setShowCarModal(false)} />}
        {showTourModal && <AddTourModal onClose={() => setShowTourModal(false)} />}
        {showAttractionModal && (
          <AddAttractionModal onClose={() => setShowAttractionModal(false)} />
        )}
      </div>
    </div>
  );
}