import React, { useState } from 'react';
import { Train } from 'lucide-react';

const RailwaysPage: React.FC = () => {
  const [trainNumber, setTrainNumber] = useState('');
  const [status, setStatus] = useState<any>(null);

  const checkStatus = async () => {
    // Placeholder for Indian Railways API call
    // In a real app, you would fetch from a backend route that uses an API key
    console.log(`Checking status for train: ${trainNumber}`);
    setStatus({
      trainName: "Example Express",
      status: "On Time",
      nextStation: "New Delhi",
      delay: "0 mins"
    });
  };

  return (
    <div className="py-20 bg-brand-deep min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-brand-dark p-12 rounded-[3rem] border border-brand-primary/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-brand-primary/10 p-4 rounded-2xl text-brand-primary">
              <Train className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black text-brand-heading">Indian Railways Status</h1>
          </div>
          
          <div className="flex gap-4 mb-8">
            <input 
              type="text" 
              value={trainNumber}
              onChange={(e) => setTrainNumber(e.target.value)}
              placeholder="Enter Train Number"
              className="flex-grow px-6 py-4 bg-brand-deep border border-brand-primary/20 rounded-full text-brand-heading outline-none focus:border-brand-primary"
            />
            <button 
              onClick={checkStatus}
              className="px-8 py-4 bg-brand-primary text-white font-black rounded-full hover:bg-[#FF9A3C] transition-all"
            >
              Check Status
            </button>
          </div>

          {status && (
            <div className="bg-brand-deep p-8 rounded-2xl border border-brand-primary/10">
              <h2 className="text-2xl font-bold text-brand-heading mb-4">{status.trainName}</h2>
              <p className="text-brand-slate">Status: <span className="text-brand-primary font-bold">{status.status}</span></p>
              <p className="text-brand-slate">Next Station: {status.nextStation}</p>
              <p className="text-brand-slate">Delay: {status.delay}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RailwaysPage;
