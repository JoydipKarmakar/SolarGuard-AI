import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

// --- MOCK DATA (Replace with API calls) ---

// Mock real-time sensor data
const initialSensorData = [
  { time: '10:00', voltage: 12.5, current: 1.5, power: 18.75, temp: 45 },
  { time: '10:01', voltage: 12.6, current: 1.6, power: 20.16, temp: 46 },
  { time: '10:02', voltage: 12.5, current: 1.5, power: 18.75, temp: 46 },
  { time: '10:03', voltage: 12.7, current: 1.7, power: 21.59, temp: 47 },
  { time: '10:04', voltage: 11.2, current: 1.2, power: 13.44, temp: 55 }, // Simulated fault start
  { time: '10:05', voltage: 11.1, current: 1.1, power: 12.21, temp: 58 },
  { time: '10:06', voltage: 11.3, current: 1.2, power: 13.56, temp: 60 },
];

// Mock panel status data
const mockPanelStatus = [
  { id: 'P001', status: 'Healthy' },
  { id: 'P002', status: 'Healthy' },
  { id: 'P003', status: 'Fault' },
  { id: 'P004', status: 'Warning' },
  { id: 'P005', status: 'Healthy' },
  { id: 'P006', status: 'Healthy' },
];

// Mock fault data (this would come from your AI backend)
const mockFaults = [
  {
    fault_id: 'FLT-001',
    panel_id: 'P003',
    fault_type: 'Hot Spot (Potential Bypass Diode Failure)',
    severity: 'High',
    timestamp: '2025-10-12T10:04:15Z',
    confidence_score: 0.92,
    generated_report: "A significant hot spot has been detected on Panel P003, localized to the upper-left cell string. This correlates with a 15% drop in string output observed in the last 5 minutes. The likely cause is a failed bypass diode or severe localized soiling. Immediate inspection is recommended to prevent permanent cell damage.",
    suggested_action: "1. Dispatch technician to Panel P003.\n2. Conduct I-V curve trace to confirm diode failure.\n3. Visually inspect for heavy soiling or physical damage.\n4. If diode has failed, replace the junction box or the entire panel as per protocol."
  },
  {
    fault_id: 'FLT-002',
    panel_id: 'P004',
    fault_type: 'Generalized Soiling',
    severity: 'Medium',
    timestamp: '2025-10-11T18:30:00Z',
    confidence_score: 0.85,
    generated_report: "Panel P004 is showing a consistent 8% underperformance compared to its neighbors, with no specific thermal anomalies detected. This pattern is indicative of widespread soiling from dust or pollen.",
    suggested_action: "1. Schedule panel P004 for the next cleaning cycle.\n2. Monitor performance post-cleaning to confirm resolution."
  },
];


// --- COMPONENTS ---

const Header = () => (
  <header className="header">
    <h1>SolarGuard AI Dashboard</h1>
  </header>
);

const RealTimeChart = ({ data }) => (
  <div className="card chart-container">
    <h2>Panel P003 Real-Time Monitoring</h2>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis dataKey="time" stroke="#ccc" />
        <YAxis yAxisId="left" stroke="#8884d8" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
        <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #555' }} />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="voltage" stroke="#8884d8" name="Voltage (V)" />
        <Line yAxisId="left" type="monotone" dataKey="current" stroke="#ffc658" name="Current (A)" />
        <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#ff7300" name="Temp (°C)" />
        <Line yAxisId="right" type="monotone" dataKey="power" stroke="#82ca9d" name="Power (W)" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const PanelStatus = ({ panels }) => (
  <div className="card">
    <h2>Solar Farm Status Overview</h2>
    <div className="panel-grid">
      {/* In a real app, you would fetch panels from an API */}
      {panels.map(panel => (
        <div key={panel.id} className={`panel-box panel-status-${panel.status.toLowerCase()}`}>
          {panel.id}
          <span>{panel.status}</span>
        </div>
      ))}
    </div>
  </div>
);

const FaultList = ({ faults, onFaultClick }) => (
  <div className="card">
    <h2>Active Fault Alerts</h2>
    <ul className="fault-list">
      {/* In a real app, you would fetch faults from an API */}
      {faults.map(fault => (
        <li key={fault.fault_id} onClick={() => onFaultClick(fault)}>
          <div className="fault-summary">
            <strong>{fault.panel_id}:</strong> {fault.fault_type}
          </div>
          <div className="fault-meta">
            <span>{new Date(fault.timestamp).toLocaleString()}</span>
            <span className={`severity-badge severity-${fault.severity.toLowerCase()}`}>{fault.severity}</span>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

const ImageUploader = () => {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAnalyze = () => {
    if (!file) {
      alert("Please select an image file first.");
      return;
    }
    setIsAnalyzing(true);
    // In a real app, you would send the 'file' object to your backend API
    // for the CNN model to process.
    console.log("Simulating analysis of:", file.name);
    setTimeout(() => {
      setIsAnalyzing(false);
      alert(`Analysis complete for ${file.name}. A new fault report would be generated if an anomaly was found.`);
      setFile(null);
    }, 3000); // Simulate network and processing delay
  };

  return (
    <div className="card">
      <h2>Manual Fault Analysis</h2>
      <p>Upload a drone or thermal image to trigger the GenAI analysis workflow.</p>
      <div className="uploader-controls">
        <input type="file" onChange={handleFileChange} accept="image/png, image/jpeg" />
        <button onClick={handleAnalyze} disabled={!file || isAnalyzing}>
          {isAnalyzing ? "Analyzing..." : "Analyze Image"}
        </button>
      </div>
    </div>
  );
};

const FaultDetailModal = ({ fault, onClose }) => {
  if (!fault) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <h2>Fault Report: {fault.fault_id}</h2>
        <div className="modal-grid">
          <div><strong>Panel ID:</strong> {fault.panel_id}</div>
          <div><strong>Detected Fault:</strong> {fault.fault_type}</div>
          <div><strong>Severity:</strong> <span className={`severity-badge severity-${fault.severity.toLowerCase()}`}>{fault.severity}</span></div>
          <div><strong>Confidence Score:</strong> {fault.confidence_score}</div>
        </div>
        
        <div className="modal-section">
          <h3>AI-Generated Diagnostic Report</h3>
          <p>{fault.generated_report}</p>
        </div>

        <div className="modal-section">
          <h3>Suggested Resolution Actions</h3>
          <pre>{fault.suggested_action}</pre>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

function App() {
  const [sensorData, setSensorData] = useState(initialSensorData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFault, setSelectedFault] = useState(null);

  // This useEffect simulates a real-time data feed.
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, you'd fetch the latest data point from your API
      // instead of generating it here.
      setSensorData(prevData => {
        const lastData = prevData[prevData.length - 1];
        const newTime = new Date(new Date(`2025-10-12T${lastData.time}:00Z`).getTime() + 60000).toTimeString().substring(0, 5);
        
        const newVoltage = parseFloat((lastData.voltage - 0.1 + Math.random() * 0.2).toFixed(2));
        const newCurrent = parseFloat((lastData.current - 0.05 + Math.random() * 0.1).toFixed(2));
        const newTemp = parseFloat((lastData.temp + Math.random() * 2).toFixed(2));
        
        const newDataPoint = {
          time: newTime,
          voltage: newVoltage,
          current: newCurrent,
          power: parseFloat((newVoltage * newCurrent).toFixed(2)),
          temp: newTemp,
        };
        return [...prevData.slice(1), newDataPoint];
      });
    }, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleOpenFaultModal = (fault) => {
    setSelectedFault(fault);
    setIsModalOpen(true);
  };

  const handleCloseFaultModal = () => {
    setIsModalOpen(false);
    setSelectedFault(null);
  };

  return (
    <div className="dashboard-container">
      <Header />
      <main className="dashboard-grid">
        <div className="grid-item-large">
          <RealTimeChart data={sensorData} />
        </div>
        <div className="grid-item-medium">
          <FaultList faults={mockFaults} onFaultClick={handleOpenFaultModal} />
        </div>
        <div className="grid-item-medium">
          <PanelStatus panels={mockPanelStatus} />
        </div>
        <div className="grid-item-large">
          <ImageUploader />
        </div>
      </main>
      <FaultDetailModal fault={selectedFault} onClose={handleCloseFaultModal} />
    </div>
  );
}

export default App;
