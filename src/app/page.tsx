"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Sparkles, 
  Layout, 
  Activity, 
  Bell, 
  BarChart3, 
  ArrowRight,
  ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";

export default function Home() {
  const features = [
    {
      title: "Interactive Study Plans",
      description: "Personalized roadmaps tailored to your learning pace and goals.",
      icon: <Layout className="w-6 h-6 text-blue-500" />,
    },
    {
      title: "Real-time Analytics",
      description: "Track your progress with detailed charts and performance insights.",
      icon: <BarChart3 className="w-6 h-6 text-purple-500" />,
    },
    {
      title: "Smart Notifications",
      description: "Never miss a deadline with automated, intelligent reminders.",
      icon: <Bell className="w-6 h-6 text-orange-500" />,
    },
    {
      title: "Focus Tracking",
      description: "Monitor your study sessions and optimize your concentration habits.",
      icon: <Activity className="w-6 h-6 text-emerald-500" />,
    },
  ];

  const handleGetStarted = () => {
    toast.success("Welcome to FlexiStudy-Web! Let's get started.");
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <span>FlexiStudy</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Features</a>
            <a href="#" className="hover:text-primary transition-colors">Pricing</a>
            <a href="#" className="hover:text-primary transition-colors">Resources</a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">Log in</Button>
            <Button size="sm" onClick={handleGetStarted}>Sign up</Button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
              <Sparkles className="w-3 h-3" />
              <span>Announcing Version 2.0</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
              Master Your Learning <br /> With Precision.
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              FlexiStudy-Web transforms your educational journey into a structured, 
              interactive, and efficient experience. Study smarter, not harder.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-base font-semibold" onClick={handleGetStarted}>
                Get Started for Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold">
                Watch Demo
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-20 relative px-4"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
            <div className="rounded-2xl border bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden aspect-[16/9] max-w-5xl mx-auto flex items-center justify-center">
               <div className="text-muted-foreground flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center">
                    <Layout className="w-10 h-10 text-primary opacity-20" />
                  </div>
                  <p className="text-sm font-medium opacity-50 italic">Project Dashboard Preview</p>
               </div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 mt-40">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to excel</h2>
            <p className="text-muted-foreground">Comprehensive tools designed for modern learners.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-all"
              >
                <div className="mb-4 p-2 rounded-lg bg-muted w-fit italic">
                  {/* Mocked icon container */}
                  <div className="w-10 h-10 flex items-center justify-center">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                <Button variant="link" className="px-0 mt-4 text-primary h-auto flex items-center gap-2">
                  Learn more
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 font-bold text-lg">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>FlexiStudy</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 FlexiStudy-Web. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Twitter</a>
            <a href="#" className="hover:text-primary transition-colors">GitHub</a>
            <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
