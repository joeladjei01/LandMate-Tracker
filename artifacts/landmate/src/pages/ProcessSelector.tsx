import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { FaSearch, FaArrowRight, FaClock, FaMoneyBillWave, FaExclamationTriangle } from 'react-icons/fa';
import { cn } from '@/lib/utils';

const PROCESS_CATEGORIES = [
  {
    name: "Ownership & Registration",
    processes: [
      { id: "p1", name: "Land Title Registration", desc: "Register your land title with the Lands Commission", duration: "3-6 months", cost: "GHS 500-2000", risk: "MEDIUM" },
      { id: "p2", name: "Indenture Registration", desc: "Register a land sale agreement", duration: "1-3 months", cost: "GHS 200-800", risk: "LOW" },
      { id: "p3", name: "Title Search", desc: "Verify ownership and encumbrances on a parcel", duration: "1-2 weeks", cost: "GHS 50-150", risk: "LOW" },
      { id: "p4", name: "First Registration", desc: "Register unregistered land for the first time", duration: "6-12 months", cost: "GHS 1000-5000", risk: "HIGH" },
    ]
  },
  {
    name: "Document & Stamping",
    processes: [
      { id: "p5", name: "Stamp Duty Payment", desc: "Pay stamp duty within 2 months of signing", duration: "1-2 weeks", cost: "Varies", risk: "MEDIUM" },
      { id: "p6", name: "Deed of Assignment", desc: "Transfer ownership of a registered title", duration: "2-4 months", cost: "GHS 300-1000", risk: "MEDIUM" },
      { id: "p7", name: "Mortgage Registration", desc: "Register a mortgage or charge on land", duration: "4-8 weeks", cost: "GHS 400-1200", risk: "MEDIUM" },
    ]
  },
  {
    name: "Special Land Types",
    processes: [
      { id: "p8", name: "Stool Land Consent", desc: "Obtain consent for transactions on stool land", duration: "2-6 months", cost: "GHS 200-500", risk: "HIGH" },
      { id: "p9", name: "Vested Land Allocation", desc: "Apply for allocation of government-vested land", duration: "6-18 months", cost: "Varies", risk: "HIGH" },
      { id: "p10", name: "Leasehold Renewal", desc: "Renew an expiring leasehold from the state", duration: "3-8 months", cost: "GHS 300-800", risk: "MEDIUM" },
    ]
  },
  {
    name: "Disputes & Corrections",
    processes: [
      { id: "p11", name: "Boundary Dispute Resolution", desc: "Resolve boundary conflicts with a neighboring land owner", duration: "3-12 months", cost: "GHS 500-3000", risk: "HIGH" },
      { id: "p12", name: "Title Correction", desc: "Correct errors in a registered land title", duration: "2-4 months", cost: "GHS 200-600", risk: "LOW" },
    ]
  }
];

export default function ProcessSelector() {
  const { selectedProcess, setSelectedProcess } = useAppContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredCategories = PROCESS_CATEGORIES.map(cat => ({
    ...cat,
    processes: cat.processes.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.desc.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.processes.length > 0);

  const handleContinue = () => {
    if (!selectedProcess) return;
    navigate('/processing');
  };

  const getRiskColor = (risk: string) => {
    if (risk === 'HIGH') return 'text-destructive bg-destructive/10 border-destructive/20';
    if (risk === 'MEDIUM') return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col py-10 px-4 container mx-auto max-w-5xl"
    >
      <div className="mb-8">
        <h2 className="font-display text-4xl font-bold text-primary mb-3">Select a Process</h2>
        <p className="text-muted-foreground text-lg mb-6">
          Choose a Ghana Lands Commission procedure to get step-by-step guidance.
        </p>
        <div className="relative max-w-xl">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search processes..." 
            className="pl-11 h-14 text-base rounded-xl bg-card border-2"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-24 space-y-10">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No processes found matching "{search}"
          </div>
        ) : (
          filteredCategories.map((cat, i) => (
            <div key={i} className="space-y-4">
              <h3 className="font-bold text-xl text-foreground border-b pb-2">{cat.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cat.processes.map(p => {
                  const isSelected = selectedProcess === p.name;
                  return (
                    <div 
                      key={p.id}
                      onClick={() => setSelectedProcess(p.name)}
                      className={cn(
                        "cursor-pointer rounded-xl border-2 p-5 transition-all duration-200",
                        isSelected 
                          ? "border-primary bg-primary/5 shadow-md" 
                          : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={cn("font-bold text-lg", isSelected ? "text-primary" : "text-foreground")}>
                          {p.name}
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{p.desc}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-auto">
                        <span className="inline-flex items-center text-xs font-medium bg-muted text-muted-foreground px-2 py-1 rounded border">
                          <FaClock className="mr-1.5" /> {p.duration}
                        </span>
                        <span className="inline-flex items-center text-xs font-medium bg-muted text-muted-foreground px-2 py-1 rounded border">
                          <FaMoneyBillWave className="mr-1.5" /> {p.cost}
                        </span>
                        <span className={cn("inline-flex items-center text-xs font-bold px-2 py-1 rounded border", getRiskColor(p.risk))}>
                          {p.risk === 'HIGH' && <FaExclamationTriangle className="mr-1.5" />}
                          {p.risk} RISK
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t flex justify-center z-10">
        <Button 
          size="lg" 
          onClick={handleContinue} 
          disabled={!selectedProcess}
          className="w-full max-w-md h-14 text-lg rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg disabled:opacity-50 group"
        >
          Get Process Guidance
          <FaArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </motion.div>
  );
}
