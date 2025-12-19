import { useMember } from '@/integrations';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { BarChart3, Store, TrendingUp, Users } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { isAuthenticated, actions } = useMember();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const kpiCards = [
    { title: 'Total Revenue', value: '$2.4M', change: '+12.5%', icon: TrendingUp },
    { title: 'Active Stores', value: '156', change: '+8', icon: Store },
    { title: 'Total Customers', value: '45.2K', change: '+15.3%', icon: Users },
    { title: 'Orders Today', value: '1,247', change: '+23.1%', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-[120rem] w-full">
        <div className="text-center mb-12">
          <motion.h1 
            className="font-heading text-7xl text-foreground mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Data-Driven Franchise Management
          </motion.h1>
          <motion.p 
            className="font-paragraph text-xl text-secondary max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Comprehensive analytics and management tools for multi-location businesses
          </motion.p>
        </div>

        <motion.div 
          className="flex space-x-6 overflow-x-auto snap-x snap-mandatory pb-8 mb-12"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
        >
          {kpiCards.map((kpi, index) => (
            <motion.div
              key={kpi.title}
              className="min-w-[24rem] p-6 bg-white rounded-2xl shadow-md snap-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-background rounded-xl">
                  <kpi.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-paragraph text-green-600">{kpi.change}</span>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">{kpi.title}</h3>
              <p className="font-heading text-4xl text-foreground">{kpi.value}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Button
            onClick={actions.login}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-8 py-6 text-lg font-paragraph h-auto"
          >
            Sign In to Dashboard
          </Button>
          <p className="font-paragraph text-sm text-secondary mt-4">
            Access your personalized analytics and management tools
          </p>
        </motion.div>
      </div>
    </div>
  );
}
