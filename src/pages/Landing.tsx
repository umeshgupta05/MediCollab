import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Microscope, Users, BookOpen, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: <Microscope className="w-8 h-8" />,
      title: 'Research Collaboration',
      description: 'Connect with peers and collaborate on groundbreaking research',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Expert Network',
      description: 'Join a community of medical professionals worldwide',
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Knowledge Sharing',
      description: 'Share findings and learn from other researchers',
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'Real-time Discussions',
      description: 'Engage in meaningful discussions about medical advances',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to MediCollab
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A collaborative platform for medical professionals to connect, share
            research, and advance healthcare together.
          </p>
          <div className="space-x-4">
            <Button
              component={Link}
              to="/signup"
              variant="contained"
              color="primary"
              size="large"
            >
              Get Started
            </Button>
            <Button
              component={Link}
              to="/login"
              variant="outlined"
              color="primary"
              size="large"
            >
              Sign In
            </Button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <div className="text-blue-600 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 grid grid-cols-3 gap-8 text-center"
        >
          <div>
            <div className="text-4xl font-bold text-blue-600">10,000+</div>
            <div className="text-gray-600 mt-2">Medical Professionals</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600">5,000+</div>
            <div className="text-gray-600 mt-2">Research Projects</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600">20,000+</div>
            <div className="text-gray-600 mt-2">Discussions</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}