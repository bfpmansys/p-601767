import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/EODashboard/Header";

const EstablishmentRegistration: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally handle form submission to database
    alert("Registration submitted successfully!");
    navigate("/");
  };

  return (
    <div className="bg-[#FFECDB] min-h-screen">
      <Header />
      
      <div className="max-w-4xl mx-auto p-4">
        {/* Registration header */}
        <div className="bg-[rgba(254,98,63,1)] flex items-center gap-4 text-white font-bold rounded-[16px_16px_0px_0px] p-4 mb-6">
          <button 
            onClick={() => navigate("/establishment/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="text-xl text-center flex-grow">ESTABLISHMENT REGISTRATION</div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Application form header */}
          <h2 className="text-lg font-semibold">APPLICATION FORM / ESTABLISHMENT REGISTRATION</h2>
          
          {/* Establishment Information Section */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="font-bold mb-4">ESTABLISHMENT INFORMATION</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Type * (Required information)</label>
                <input type="text" className="w-full border p-2 rounded" required />
              </div>
              
              <div>
                <label className="block text-sm mb-1">DTI Certificate No.</label>
                <input type="text" className="w-full border p-2 rounded" defaultValue="22-9592" />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Business Name/Building Name/Establishment Name *</label>
                <input type="text" className="w-full border p-2 rounded" required />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Type of Establishment *</label>
                <input type="text" className="w-full border p-2 rounded" required />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Type of Occupancy / Business Nature *</label>
                <input type="text" className="w-full border p-2 rounded" required />
              </div>
              
              <div>
                <label className="block text-sm mb-1">No. of Storys</label>
                <input type="number" className="w-full border p-2 rounded" />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Total Floor Area (m²) *</label>
                <input type="text" className="w-full border p-2 rounded" required />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Number of Occupants *</label>
                <input type="number" className="w-full border p-2 rounded" required />
              </div>
            </div>
          </div>
          
          {/* Owner Information Section */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="font-bold mb-4">OWNER INFORMATION</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Type * (Required information)</label>
                <input type="text" className="w-full border p-2 rounded" required />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Name of Owner/Representative *</label>
                <input type="text" className="w-full border p-2 rounded" required />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Last Name *</label>
                <input type="text" className="w-full border p-2 rounded" required />
              </div>
              
              <div>
                <label className="block text-sm mb-1">First Name *</label>
                <input type="text" className="w-full border p-2 rounded" required />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Middle Initial</label>
                <input type="text" className="w-full border p-2 rounded" />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Suffix</label>
                <input type="text" className="w-full border p-2 rounded" />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Email Address *</label>
                <input type="email" className="w-full border p-2 rounded" required />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Contact Number *</label>
                <input type="tel" className="w-full border p-2 rounded" required />
              </div>
            </div>
          </div>
          
          {/* Establishment Address Section */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="font-bold mb-4">ESTABLISHMENT ADDRESS</h3>
            <p className="text-sm mb-4">Type in the required information</p>
            
            <div className="text-sm text-gray-700 mb-6 space-y-2">
              <p>• Please input your address or where your establishment is located.</p>
              <p>• If you're unable to determine the specific address, simply enter the barangay of your establishment.</p>
              <p>• If you click "Choose on Map", you need to click on the exact location of your establishment, and we will automatically fill out the details for you.</p>
              <p>• Upon update, you will see that the coordinates will be generated automatically identifying the exact location you tagged and the spot size will be adjusted accordingly.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Barangay * (Building Name / Street Name) *</label>
                <input type="text" className="w-full border p-2 rounded" required />
              </div>
              
              <div>
                <label className="block text-sm mb-1">City *</label>
                <input type="text" className="w-full border p-2 rounded" defaultValue="" required />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Region *</label>
                <select className="w-full border p-2 rounded" required>
                  <option value="" disabled>Select Region</option>
                  <option value="NCR">NCR (National Capital Region)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm mb-1">Province *</label>
                <input type="text" className="w-full border p-2 rounded" required />
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Map Location:</h4>
              <div className="h-64 bg-gray-200 rounded-lg relative">
                <img 
                  src="/lovable-uploads/b08eed0f-6e9a-42c2-ac27-f09f021f3b34.png" 
                  alt="Map" 
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <button 
                    type="button"
                    className="bg-white text-black px-2 py-1 rounded text-sm"
                  >
                    Choose on Map
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm mb-1">Current Longitude: 120.976553248698</label>
                  <input type="text" className="w-full border p-2 rounded bg-gray-100" readOnly />
                </div>
                <div>
                  <label className="block text-sm mb-1">Current Latitude: 14.5779552065508</label>
                  <input type="text" className="w-full border p-2 rounded bg-gray-100" readOnly />
                </div>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button 
              type="submit"
              className="bg-[rgba(254,98,63,1)] text-white px-8 py-2 rounded-lg font-semibold uppercase"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EstablishmentRegistration;