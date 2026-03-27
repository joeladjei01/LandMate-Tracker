import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaRoute, FaWpforms, FaFileAlt } from 'react-icons/fa';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col"
    >
      <section className="relative w-full py-20 lg:py-32 overflow-hidden flex-1 flex items-center justify-center">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0 bg-primary/5">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Topographic map background" 
            className="w-full h-full object-cover opacity-15 mix-blend-multiply" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background"></div>
        </div>

        <div className="container relative z-10 px-4 md:px-6 mx-auto">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants} className="mb-6 inline-flex items-center rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary-foreground">
              <span className="flex h-2 w-2 rounded-full bg-secondary mr-2"></span>
              Powered by Claude AI
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="font-display text-5xl md:text-7xl font-bold tracking-tight text-primary mb-6 drop-shadow-sm">
              Ghana Lands Commission <br />
              <span className="text-secondary block mt-2">Citizen Guide</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
              Understand complex land documents, navigate official processes, and detect fraud risks with plain-language AI assistance.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Link to="/mode">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-xl bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300">
                  Start Your Guide
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-10 border-t border-border/50 w-full">
              {[
                { icon: FaFileAlt, label: "Document Analysis" },
                { icon: FaShieldAlt, label: "Fraud Detection" },
                { icon: FaRoute, label: "Process Navigation" },
                { icon: FaWpforms, label: "Form Assistance" }
              ].map((feat, i) => (
                <div key={i} className="flex flex-col items-center gap-3 text-muted-foreground">
                  <div className="w-12 h-12 rounded-full bg-background border border-border shadow-sm flex items-center justify-center text-primary/80">
                    <feat.icon className="text-xl" />
                  </div>
                  <span className="text-sm font-medium">{feat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
