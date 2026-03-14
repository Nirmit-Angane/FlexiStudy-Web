"use client";

import { useState, useEffect } from "react";
import { useProgress } from "@/hooks/useProgress";
import {
  Search, ChevronRight, ArrowLeft, Clock, BookOpen,
  CheckCircle, Circle, Lock, Star, Zap, Play, BarChart2,
  Loader2, RotateCcw
} from "lucide-react";
import { MicroVideoPlayer } from "@/components/video/MicroVideoPlayer";
import { useAuth } from "@/hooks/useAuth";
import { saveQuizResult, updateUserStats, saveLesson } from "@/lib/firebase-actions";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const SUBJECTS = [
  {
    id: "math", emoji: "📐", name: "Mathematics",
    desc: "Numbers, patterns & logical problem solving",
    color: "#F5A623", bg: "#FEF5E3", txt: "#A66B0A",
    modules: 60, subtopics: 6, students: "12.4k",
    subtopicList: [
      {
        id: "fractions", name: "Fractions", icon: "½",
        desc: "Master numerators, denominators and fraction operations",
        duration: "3h 20m", modules: 10, progress: 70,
        moduleList: [
          { id: 1, name: "Understanding Numerator and Denominator", duration: "18m", status: "done" },
          { id: 2, name: "Equivalent Fractions & Simplification", duration: "22m", status: "done" },
          { id: 3, name: "Adding & Subtracting Like Fractions", duration: "20m", status: "done" },
          { id: 4, name: "Adding & Subtracting Unlike Fractions", duration: "25m", status: "done" },
          { id: 5, name: "Multiplying Fractions", duration: "18m", status: "done" },
          { id: 6, name: "Dividing Fractions (Reciprocal Method)", duration: "24m", status: "done" },
          { id: 7, name: "Mixed Numbers & Improper Fractions", duration: "20m", status: "active" },
          { id: 8, name: "Comparing & Ordering Fractions", duration: "16m", status: "locked" },
          { id: 9, name: "Fractions on a Number Line", duration: "14m", status: "locked" },
          { id: 10, name: "Real-World Word Problems with Fractions", duration: "28m", status: "locked" },
        ]
      },
      {
        id: "algebra", name: "Algebra", icon: "∑",
        desc: "Variables, equations and algebraic reasoning",
        duration: "5h 10m", modules: 10, progress: 40,
        moduleList: [
          { id: 1, name: "Variables, Constants & Expressions", duration: "20m", status: "done" },
          { id: 2, name: "Simplifying Algebraic Expressions", duration: "22m", status: "done" },
          { id: 3, name: "Solving One-Step Linear Equations", duration: "24m", status: "done" },
          { id: 4, name: "Solving Two-Step & Multi-Step Equations", duration: "28m", status: "done" },
          { id: 5, name: "Inequalities & Their Graphs", duration: "26m", status: "active" },
          { id: 6, name: "Systems of Linear Equations", duration: "32m", status: "locked" },
          { id: 7, name: "Factoring Polynomials", duration: "30m", status: "locked" },
          { id: 8, name: "Quadratic Equations & the Quadratic Formula", duration: "35m", status: "locked" },
          { id: 9, name: "Functions: Domain, Range & Notation", duration: "28m", status: "locked" },
          { id: 10, name: "Introduction to Sequences & Series", duration: "25m", status: "locked" },
        ]
      },
      {
        id: "trig", name: "Trigonometry", icon: "△",
        desc: "Angles, triangles and circular functions",
        duration: "4h 45m", modules: 10, progress: 10,
        moduleList: [
          { id: 1, name: "Angles: Degrees, Radians & Conversion", duration: "22m", status: "done" },
          { id: 2, name: "Right Triangle Trigonometry (SOH-CAH-TOA)", duration: "30m", status: "active" },
          { id: 3, name: "The Unit Circle", duration: "28m", status: "locked" },
          { id: 4, name: "Sine, Cosine & Tangent Functions & Graphs", duration: "35m", status: "locked" },
          { id: 5, name: "Inverse Trigonometric Functions", duration: "26m", status: "locked" },
          { id: 6, name: "Trigonometric Identities (Pythagorean, etc.)", duration: "32m", status: "locked" },
          { id: 7, name: "The Law of Sines", duration: "24m", status: "locked" },
          { id: 8, name: "The Law of Cosines", duration: "24m", status: "locked" },
          { id: 9, name: "Solving Trigonometric Equations", duration: "30m", status: "locked" },
          { id: 10, name: "Applications: Heights, Distances & Bearings", duration: "28m", status: "locked" },
        ]
      },
      {
        id: "calculus", name: "Calculus", icon: "∫",
        desc: "Limits, derivatives and integration",
        duration: "6h 30m", modules: 10, progress: 0,
        moduleList: [
          { id: 1, name: "Limits: Concepts & Limit Laws", duration: "28m", status: "active" },
          { id: 2, name: "Continuity of Functions", duration: "22m", status: "locked" },
          { id: 3, name: "The Derivative: Definition & Notation", duration: "30m", status: "locked" },
          { id: 4, name: "Basic Differentiation Rules (Power, Product, Quotient)", duration: "35m", status: "locked" },
          { id: 5, name: "Chain Rule & Implicit Differentiation", duration: "32m", status: "locked" },
          { id: 6, name: "Applications of Derivatives (Maxima, Minima)", duration: "38m", status: "locked" },
          { id: 7, name: "Related Rates & Optimization Problems", duration: "36m", status: "locked" },
          { id: 8, name: "Antiderivatives & Indefinite Integrals", duration: "30m", status: "locked" },
          { id: 9, name: "The Definite Integral & Fundamental Theorem", duration: "34m", status: "locked" },
          { id: 10, name: "Applications of Integration (Area, Volume)", duration: "38m", status: "locked" },
        ]
      },
      {
        id: "probability", name: "Probability", icon: "%",
        desc: "Chance, events and statistical reasoning",
        duration: "3h 50m", modules: 10, progress: 0,
        moduleList: [
          { id: 1, name: "Basic Probability: Events & Sample Spaces", duration: "20m", status: "active" },
          { id: 2, name: "Theoretical vs. Experimental Probability", duration: "22m", status: "locked" },
          { id: 3, name: "Complement, Union & Intersection of Events", duration: "24m", status: "locked" },
          { id: 4, name: "Addition Rule & Mutually Exclusive Events", duration: "22m", status: "locked" },
          { id: 5, name: "Conditional Probability", duration: "28m", status: "locked" },
          { id: 6, name: "Multiplication Rule & Independent Events", duration: "26m", status: "locked" },
          { id: 7, name: "Permutations & Combinations", duration: "30m", status: "locked" },
          { id: 8, name: "Binomial Probability Distribution", duration: "28m", status: "locked" },
          { id: 9, name: "Normal Distribution & Z-Scores", duration: "30m", status: "locked" },
          { id: 10, name: "Expected Value & Decision Making", duration: "24m", status: "locked" },
        ]
      },
      {
        id: "geometry", name: "Geometry", icon: "□",
        desc: "Shapes, space and spatial relationships",
        duration: "4h 20m", modules: 10, progress: 100,
        moduleList: [
          { id: 1, name: "Points, Lines, Planes & Angles", duration: "18m", status: "done" },
          { id: 2, name: "Triangles: Types, Properties & Congruence", duration: "24m", status: "done" },
          { id: 3, name: "Similarity & Proportional Reasoning", duration: "22m", status: "done" },
          { id: 4, name: "Pythagorean Theorem & Applications", duration: "20m", status: "done" },
          { id: 5, name: "Properties of Quadrilaterals", duration: "22m", status: "done" },
          { id: 6, name: "Circles: Circumference, Area, Arcs & Chords", duration: "26m", status: "done" },
          { id: 7, name: "Area & Perimeter of Polygons", duration: "20m", status: "done" },
          { id: 8, name: "Surface Area of 3D Solids", duration: "24m", status: "done" },
          { id: 9, name: "Volume of Prisms, Cylinders, Cones & Spheres", duration: "26m", status: "done" },
          { id: 10, name: "Coordinate Geometry & Transformations", duration: "28m", status: "done" },
        ]
      },
    ]
  },
  {
    id: "science", emoji: "🔬", name: "Science",
    desc: "Explore the natural world through observation",
    color: "#3D8B71", bg: "#EAF5F1", txt: "#2E6B57",
    modules: 60, subtopics: 6, students: "9.8k",
    subtopicList: [
      {
        id: "photosynthesis", name: "Photosynthesis", icon: "🌿",
        desc: "How plants convert sunlight into energy",
        duration: "2h 50m", modules: 10, progress: 60,
        moduleList: [
          { id: 1, name: "What is Photosynthesis? (Overview & Importance)", duration: "18m", status: "done" },
          { id: 2, name: "Chloroplast Structure & Function", duration: "20m", status: "done" },
          { id: 3, name: "Light-Dependent Reactions (Light Reactions)", duration: "25m", status: "done" },
          { id: 4, name: "Light-Independent Reactions (Calvin Cycle)", duration: "25m", status: "done" },
          { id: 5, name: "Factors Affecting the Rate of Photosynthesis", duration: "22m", status: "done" },
          { id: 6, name: "Role of Chlorophyll & Pigments", duration: "20m", status: "done" },
          { id: 7, name: "Comparing Photosynthesis & Cellular Respiration", duration: "24m", status: "active" },
          { id: 8, name: "Photosynthesis in C3, C4 & CAM Plants", duration: "26m", status: "locked" },
          { id: 9, name: "Experiments: Measuring Rate of Photosynthesis", duration: "30m", status: "locked" },
          { id: 10, name: "Photosynthesis & Its Role in the Carbon Cycle", duration: "22m", status: "locked" },
        ]
      },
      {
        id: "newtons", name: "Newton's Laws", icon: "⚡",
        desc: "Forces, motion and the laws of mechanics",
        duration: "3h 10m", modules: 10, progress: 30,
        moduleList: [
          { id: 1, name: "Newton's First Law: Law of Inertia", duration: "20m", status: "done" },
          { id: 2, name: "Net Force & Free Body Diagrams", duration: "24m", status: "done" },
          { id: 3, name: "Newton's Second Law: F = ma", duration: "22m", status: "done" },
          { id: 4, name: "Newton's Third Law: Action & Reaction Pairs", duration: "20m", status: "active" },
          { id: 5, name: "Mass vs. Weight & Gravitational Force", duration: "18m", status: "locked" },
          { id: 6, name: "Friction: Static, Kinetic & Rolling", duration: "24m", status: "locked" },
          { id: 7, name: "Normal Force & Inclined Planes", duration: "26m", status: "locked" },
          { id: 8, name: "Circular Motion & Centripetal Force", duration: "28m", status: "locked" },
          { id: 9, name: "Momentum & Newton's Laws", duration: "24m", status: "locked" },
          { id: 10, name: "Real-World Applications & Problem Solving", duration: "30m", status: "locked" },
        ]
      },
      {
        id: "periodic", name: "Periodic Table", icon: "⚗️",
        desc: "Elements, their properties and patterns",
        duration: "3h 40m", modules: 10, progress: 0,
        moduleList: [
          { id: 1, name: "History & Development of the Periodic Table", duration: "20m", status: "active" },
          { id: 2, name: "Periods, Groups & Blocks", duration: "22m", status: "locked" },
          { id: 3, name: "Atomic Number, Mass Number & Isotopes", duration: "24m", status: "locked" },
          { id: 4, name: "Electron Configuration & Valence Electrons", duration: "28m", status: "locked" },
          { id: 5, name: "Periodic Trends: Atomic Radius", duration: "22m", status: "locked" },
          { id: 6, name: "Periodic Trends: Ionization Energy & Electronegativity", duration: "24m", status: "locked" },
          { id: 7, name: "Metals, Non-Metals & Metalloids", duration: "20m", status: "locked" },
          { id: 8, name: "Key Groups: Alkali Metals, Halogens & Noble Gases", duration: "26m", status: "locked" },
          { id: 9, name: "Transition Metals & Their Properties", duration: "22m", status: "locked" },
          { id: 10, name: "Using the Periodic Table to Predict Chemical Behavior", duration: "28m", status: "locked" },
        ]
      },
      {
        id: "digestive", name: "Human Digestive System", icon: "🫀",
        desc: "How your body processes food and nutrients",
        duration: "2h 30m", modules: 10, progress: 100,
        moduleList: [
          { id: 1, name: "Overview of Digestion & Nutrient Types", duration: "16m", status: "done" },
          { id: 2, name: "The Mouth: Mechanical & Chemical Digestion", duration: "18m", status: "done" },
          { id: 3, name: "Oesophagus & the Process of Peristalsis", duration: "16m", status: "done" },
          { id: 4, name: "The Stomach: Structure, Acid & Enzymes", duration: "20m", status: "done" },
          { id: 5, name: "The Small Intestine & Nutrient Absorption", duration: "22m", status: "done" },
          { id: 6, name: "Role of the Liver, Pancreas & Gallbladder", duration: "20m", status: "done" },
          { id: 7, name: "The Large Intestine, Colon & Water Absorption", duration: "18m", status: "done" },
          { id: 8, name: "Digestive Enzymes: Types, Sources & Functions", duration: "22m", status: "done" },
          { id: 9, name: "Common Digestive Disorders (Ulcers, IBS, etc.)", duration: "20m", status: "done" },
          { id: 10, name: "Diet, Nutrition & the Digestive System", duration: "18m", status: "done" },
        ]
      },
      {
        id: "electricity", name: "Electricity", icon: "⚡",
        desc: "Electric charge, circuits and electromagnetism",
        duration: "4h 10m", modules: 10, progress: 50,
        moduleList: [
          { id: 1, name: "Electric Charge, Conductors & Insulators", duration: "20m", status: "done" },
          { id: 2, name: "Electric Current, Voltage & Resistance", duration: "22m", status: "done" },
          { id: 3, name: "Ohm's Law & V-I Characteristics", duration: "24m", status: "done" },
          { id: 4, name: "Series Circuits: Analysis & Problem Solving", duration: "28m", status: "done" },
          { id: 5, name: "Parallel Circuits: Analysis & Problem Solving", duration: "28m", status: "done" },
          { id: 6, name: "Electric Power & Energy Consumption", duration: "24m", status: "active" },
          { id: 7, name: "Magnetism & Electromagnetism", duration: "26m", status: "locked" },
          { id: 8, name: "Electromagnetic Induction & Faraday's Law", duration: "28m", status: "locked" },
          { id: 9, name: "AC vs. DC Current & Practical Applications", duration: "24m", status: "locked" },
          { id: 10, name: "Safety: Fuses, Circuit Breakers & Earthing", duration: "20m", status: "locked" },
        ]
      },
      {
        id: "ecosystems", name: "Ecosystems", icon: "🌍",
        desc: "Living communities and their environments",
        duration: "3h 00m", modules: 10, progress: 20,
        moduleList: [
          { id: 1, name: "Biotic vs. Abiotic Factors", duration: "18m", status: "done" },
          { id: 2, name: "Food Chains & Food Webs", duration: "20m", status: "done" },
          { id: 3, name: "Trophic Levels & Energy Flow (10% Rule)", duration: "22m", status: "active" },
          { id: 4, name: "Producers, Consumers & Decomposers", duration: "18m", status: "locked" },
          { id: 5, name: "Nutrient Cycles: Carbon, Nitrogen & Water", duration: "24m", status: "locked" },
          { id: 6, name: "Population Dynamics & Carrying Capacity", duration: "22m", status: "locked" },
          { id: 7, name: "Symbiotic Relationships (Mutualism, Parasitism, etc.)", duration: "20m", status: "locked" },
          { id: 8, name: "Biodiversity & Ecosystem Stability", duration: "22m", status: "locked" },
          { id: 9, name: "Human Impact: Deforestation, Pollution & Climate", duration: "24m", status: "locked" },
          { id: 10, name: "Conservation Strategies & Sustainability", duration: "22m", status: "locked" },
        ]
      },
    ]
  },
  {
    id: "tech", emoji: "💻", name: "Technology & Coding",
    desc: "Build the digital world with code and logic",
    color: "#4A7FC1", bg: "#EAF0FA", txt: "#2E5F9E",
    modules: 60, subtopics: 6, students: "15.2k",
    subtopicList: [
      {
        id: "python", name: "Python Functions", icon: "🐍",
        desc: "Define, call and master Python's function system",
        duration: "3h 00m", modules: 10, progress: 88,
        moduleList: [
          { id: 1, name: "Defining & Calling Functions (def keyword)", duration: "18m", status: "done" },
          { id: 2, name: "Parameters & Arguments (Positional & Keyword)", duration: "20m", status: "done" },
          { id: 3, name: "Return Values & the return Statement", duration: "18m", status: "done" },
          { id: 4, name: "Default Parameter Values", duration: "16m", status: "done" },
          { id: 5, name: "Variable Scope: Local vs. Global", duration: "20m", status: "done" },
          { id: 6, name: "*args and **kwargs", duration: "22m", status: "done" },
          { id: 7, name: "Lambda Functions & Anonymous Functions", duration: "18m", status: "done" },
          { id: 8, name: "Recursion: Concept & Base Cases", duration: "26m", status: "done" },
          { id: 9, name: "Higher-Order Functions (map, filter, reduce)", duration: "24m", status: "active" },
          { id: 10, name: "Docstrings & Code Documentation Best Practices", duration: "16m", status: "locked" },
        ]
      },
      {
        id: "html", name: "HTML Basics", icon: "🌐",
        desc: "Structure web pages with semantic HTML",
        duration: "2h 40m", modules: 10, progress: 100,
        moduleList: [
          { id: 1, name: "What is HTML? Structure of a Web Page", duration: "16m", status: "done" },
          { id: 2, name: "Essential Tags: <html>, <head>, <body>", duration: "18m", status: "done" },
          { id: 3, name: "Headings, Paragraphs & Text Formatting Tags", duration: "16m", status: "done" },
          { id: 4, name: "Links & Anchor Tags (<a href>)", duration: "14m", status: "done" },
          { id: 5, name: "Images & the <img> Tag (src, alt)", duration: "14m", status: "done" },
          { id: 6, name: "Lists: Ordered (<ol>) & Unordered (<ul>)", duration: "14m", status: "done" },
          { id: 7, name: "Tables: <table>, <tr>, <td>, <th>", duration: "18m", status: "done" },
          { id: 8, name: "HTML Forms & Input Types", duration: "20m", status: "done" },
          { id: 9, name: "Semantic HTML5 Elements (header, nav, main, footer)", duration: "18m", status: "done" },
          { id: 10, name: "Linking CSS & JavaScript to HTML", duration: "12m", status: "done" },
        ]
      },
      {
        id: "ai", name: "What is AI", icon: "🤖",
        desc: "Understand artificial intelligence and machine learning",
        duration: "3h 20m", modules: 10, progress: 40,
        moduleList: [
          { id: 1, name: "Definition of AI & Brief History", duration: "20m", status: "done" },
          { id: 2, name: "Types of AI: Narrow, General & Super AI", duration: "22m", status: "done" },
          { id: 3, name: "Machine Learning vs. Deep Learning vs. AI", duration: "24m", status: "done" },
          { id: 4, name: "Supervised, Unsupervised & Reinforcement Learning", duration: "26m", status: "done" },
          { id: 5, name: "How Neural Networks Work", duration: "28m", status: "active" },
          { id: 6, name: "Natural Language Processing (NLP) Basics", duration: "24m", status: "locked" },
          { id: 7, name: "Computer Vision & Image Recognition", duration: "22m", status: "locked" },
          { id: 8, name: "AI in Everyday Life (Recommendations, Voice Assistants)", duration: "20m", status: "locked" },
          { id: 9, name: "Ethical Issues: Bias, Privacy & Job Displacement", duration: "26m", status: "locked" },
          { id: 10, name: "The Future of AI & Emerging Trends", duration: "22m", status: "locked" },
        ]
      },
      {
        id: "arrays", name: "Arrays", icon: "[]",
        desc: "Store, access and manipulate ordered data",
        duration: "2h 50m", modules: 10, progress: 0,
        moduleList: [
          { id: 1, name: "What is an Array? Memory & Index Model", duration: "18m", status: "active" },
          { id: 2, name: "Declaring & Initializing Arrays", duration: "16m", status: "locked" },
          { id: 3, name: "Accessing & Modifying Array Elements", duration: "16m", status: "locked" },
          { id: 4, name: "Traversing Arrays with Loops", duration: "18m", status: "locked" },
          { id: 5, name: "Searching an Array (Linear & Binary Search)", duration: "22m", status: "locked" },
          { id: 6, name: "Sorting Arrays (Bubble Sort, Selection Sort)", duration: "24m", status: "locked" },
          { id: 7, name: "2D Arrays & Matrix Representation", duration: "22m", status: "locked" },
          { id: 8, name: "Dynamic Arrays & Lists in Python", duration: "20m", status: "locked" },
          { id: 9, name: "Common Array Algorithms (Reverse, Rotate, Find Max)", duration: "24m", status: "locked" },
          { id: 10, name: "Time & Space Complexity of Array Operations", duration: "20m", status: "locked" },
        ]
      },
      {
        id: "oop", name: "OOP Concepts", icon: "{}",
        desc: "Classes, objects and object-oriented design",
        duration: "4h 10m", modules: 10, progress: 20,
        moduleList: [
          { id: 1, name: "Introduction to Object-Oriented Programming", duration: "20m", status: "done" },
          { id: 2, name: "Classes & Objects: Blueprint and Instance", duration: "22m", status: "done" },
          { id: 3, name: "Attributes (Instance & Class Variables)", duration: "20m", status: "active" },
          { id: 4, name: "Methods & the __init__ Constructor", duration: "24m", status: "locked" },
          { id: 5, name: "Encapsulation & Access Modifiers", duration: "22m", status: "locked" },
          { id: 6, name: "Inheritance: Single & Multiple", duration: "26m", status: "locked" },
          { id: 7, name: "Method Overriding & super()", duration: "24m", status: "locked" },
          { id: 8, name: "Polymorphism & Duck Typing", duration: "22m", status: "locked" },
          { id: 9, name: "Abstraction & Abstract Classes", duration: "24m", status: "locked" },
          { id: 10, name: "Practical OOP: Designing a Real-World Class System", duration: "32m", status: "locked" },
        ]
      },
      {
        id: "internet", name: "How the Internet Works", icon: "📡",
        desc: "Networks, protocols and web infrastructure",
        duration: "3h 30m", modules: 10, progress: 0,
        moduleList: [
          { id: 1, name: "What is the Internet? Networks & Nodes", duration: "20m", status: "active" },
          { id: 2, name: "IP Addresses: IPv4, IPv6 & Subnetting Basics", duration: "24m", status: "locked" },
          { id: 3, name: "DNS: Domain Name System Explained", duration: "20m", status: "locked" },
          { id: 4, name: "How HTTP & HTTPS Work", duration: "22m", status: "locked" },
          { id: 5, name: "The Client-Server Model", duration: "20m", status: "locked" },
          { id: 6, name: "TCP/IP Protocol Suite", duration: "24m", status: "locked" },
          { id: 7, name: "Web Browsers & How They Render Pages", duration: "22m", status: "locked" },
          { id: 8, name: "Packets, Routing & Data Transmission", duration: "24m", status: "locked" },
          { id: 9, name: "Cloud Computing & Hosting", duration: "20m", status: "locked" },
          { id: 10, name: "Cybersecurity Basics: Firewalls, Encryption & HTTPS", duration: "24m", status: "locked" },
        ]
      },
    ]
  },
  {
    id: "history", emoji: "📖", name: "History & Social Studies",
    desc: "Learn from the past to understand the present",
    color: "#C4714A", bg: "#F9EDE6", txt: "#9A4E2E",
    modules: 50, subtopics: 5, students: "7.1k",
    subtopicList: [
      {
        id: "ww2", name: "World War 2", icon: "🌏",
        desc: "Causes, events and consequences of WWII",
        duration: "4h 20m", modules: 10, progress: 55,
        moduleList: [
          { id: 1, name: "Causes of WW2: Rise of Fascism & Nationalism", duration: "24m", status: "done" },
          { id: 2, name: "Key Figures: Hitler, Churchill, Roosevelt, Stalin", duration: "26m", status: "done" },
          { id: 3, name: "Timeline of Major Events (1939–1945)", duration: "28m", status: "done" },
          { id: 4, name: "Battle of Britain & the Air War", duration: "24m", status: "done" },
          { id: 5, name: "Operation Barbarossa & the Eastern Front", duration: "26m", status: "done" },
          { id: 6, name: "The Holocaust: Causes, Events & Legacy", duration: "28m", status: "active" },
          { id: 7, name: "War in the Pacific & Pearl Harbor", duration: "24m", status: "locked" },
          { id: 8, name: "D-Day & the Liberation of Western Europe", duration: "26m", status: "locked" },
          { id: 9, name: "Hiroshima & Nagasaki: Atomic Bombs & End of War", duration: "24m", status: "locked" },
          { id: 10, name: "Post-War Consequences & the Birth of the UN", duration: "26m", status: "locked" },
        ]
      },
      {
        id: "india", name: "Indian Independence", icon: "🇮🇳",
        desc: "India's journey from colonial rule to freedom",
        duration: "3h 40m", modules: 10, progress: 80,
        moduleList: [
          { id: 1, name: "British Colonial Rule & the East India Company", duration: "22m", status: "done" },
          { id: 2, name: "First War of Independence (1857 Revolt)", duration: "24m", status: "done" },
          { id: 3, name: "Formation of the Indian National Congress", duration: "20m", status: "done" },
          { id: 4, name: "Mahatma Gandhi & the Non-Cooperation Movement", duration: "26m", status: "done" },
          { id: 5, name: "Civil Disobedience Movement & Salt March", duration: "24m", status: "done" },
          { id: 6, name: "Quit India Movement (1942)", duration: "22m", status: "done" },
          { id: 7, name: "Role of Subhas Chandra Bose & the INA", duration: "24m", status: "done" },
          { id: 8, name: "Partition of India & Pakistan (1947)", duration: "26m", status: "done" },
          { id: 9, name: "Jawaharlal Nehru & the Formation of the Republic", duration: "22m", status: "active" },
          { id: 10, name: "Legacy of the Independence Movement", duration: "20m", status: "locked" },
        ]
      },
      {
        id: "french", name: "French Revolution", icon: "🗼",
        desc: "Liberty, equality and the birth of modern politics",
        duration: "3h 20m", modules: 10, progress: 0,
        moduleList: [
          { id: 1, name: "France Before the Revolution: Estates & Inequality", duration: "20m", status: "active" },
          { id: 2, name: "Financial Crisis & the Role of Enlightenment Ideas", duration: "22m", status: "locked" },
          { id: 3, name: "The Estates-General & the Third Estate", duration: "20m", status: "locked" },
          { id: 4, name: "Storming of the Bastille (July 14, 1789)", duration: "22m", status: "locked" },
          { id: 5, name: "Declaration of the Rights of Man", duration: "18m", status: "locked" },
          { id: 6, name: "The Constitutional Monarchy & Its Failure", duration: "20m", status: "locked" },
          { id: 7, name: "The Reign of Terror & Robespierre", duration: "22m", status: "locked" },
          { id: 8, name: "The Rise of Napoleon Bonaparte", duration: "22m", status: "locked" },
          { id: 9, name: "Impact on Europe & Spread of Revolutionary Ideas", duration: "24m", status: "locked" },
          { id: 10, name: "Long-Term Legacy: Democracy, Nationalism, Human Rights", duration: "22m", status: "locked" },
        ]
      },
      {
        id: "democracy", name: "Democracy", icon: "🏛️",
        desc: "Systems of governance and civic participation",
        duration: "3h 10m", modules: 10, progress: 30,
        moduleList: [
          { id: 1, name: "Origins of Democracy: Ancient Athens", duration: "20m", status: "done" },
          { id: 2, name: "Types of Democracy: Direct vs. Representative", duration: "18m", status: "done" },
          { id: 3, name: "Key Principles: Equality, Majority Rule, Minority Rights", duration: "20m", status: "done" },
          { id: 4, name: "The Role of Elections & Political Parties", duration: "20m", status: "active" },
          { id: 5, name: "Separation of Powers: Executive, Legislative, Judicial", duration: "22m", status: "locked" },
          { id: 6, name: "The Constitution & Rule of Law", duration: "20m", status: "locked" },
          { id: 7, name: "Civil Rights & Fundamental Freedoms", duration: "18m", status: "locked" },
          { id: 8, name: "Democratic Institutions: Parliament, Courts, Free Press", duration: "22m", status: "locked" },
          { id: 9, name: "Challenges to Democracy: Corruption & Authoritarianism", duration: "20m", status: "locked" },
          { id: 10, name: "Comparing Democratic Systems Around the World", duration: "20m", status: "locked" },
        ]
      },
      {
        id: "industrial", name: "Industrial Revolution", icon: "🏭",
        desc: "How industry transformed society and economy",
        duration: "3h 30m", modules: 10, progress: 10,
        moduleList: [
          { id: 1, name: "Pre-Industrial Society: Agriculture & Cottage Industry", duration: "18m", status: "done" },
          { id: 2, name: "Why Britain First? (Coal, Iron, Geography)", duration: "20m", status: "active" },
          { id: 3, name: "Key Inventions: Steam Engine, Spinning Jenny, Power Loom", duration: "22m", status: "locked" },
          { id: 4, name: "The Factory System & Urbanization", duration: "20m", status: "locked" },
          { id: 5, name: "Working Conditions & Child Labor", duration: "20m", status: "locked" },
          { id: 6, name: "Transportation Revolution: Railways & Canals", duration: "22m", status: "locked" },
          { id: 7, name: "Social Impact: Rise of the Middle & Working Class", duration: "20m", status: "locked" },
          { id: 8, name: "Political Responses: Trade Unions & Reform Acts", duration: "22m", status: "locked" },
          { id: 9, name: "Spread of Industrialization to Europe & America", duration: "22m", status: "locked" },
          { id: 10, name: "Long-Term Consequences: Capitalism, Environment, Globalization", duration: "24m", status: "locked" },
        ]
      },
    ]
  },
  {
    id: "geo", emoji: "🌍", name: "Geography",
    desc: "Earth's landscapes, climates and human systems",
    color: "#5BA3A0", bg: "#EBF5F5", txt: "#3A7A78",
    modules: 50, subtopics: 5, students: "6.3k",
    subtopicList: [
      {
        id: "climate", name: "Climate Change", icon: "🌡️",
        desc: "Global warming, causes and climate solutions",
        duration: "3h 50m", modules: 10, progress: 45,
        moduleList: [
          { id: 1, name: "What is Climate Change? Weather vs. Climate", duration: "18m", status: "done" },
          { id: 2, name: "The Greenhouse Effect & Greenhouse Gases", duration: "20m", status: "done" },
          { id: 3, name: "Natural vs. Human Causes of Climate Change", duration: "22m", status: "done" },
          { id: 4, name: "Evidence: Rising Temperatures, Melting Ice & Sea Levels", duration: "24m", status: "done" },
          { id: 5, name: "El Niño, La Niña & Climate Variability", duration: "22m", status: "active" },
          { id: 6, name: "Impact on Ecosystems & Biodiversity", duration: "22m", status: "locked" },
          { id: 7, name: "Impact on Human Societies (Food, Water, Migration)", duration: "24m", status: "locked" },
          { id: 8, name: "The Paris Agreement & International Climate Policy", duration: "22m", status: "locked" },
          { id: 9, name: "Mitigation Strategies: Renewable Energy & Carbon Capture", duration: "26m", status: "locked" },
          { id: 10, name: "Adaptation Strategies & Building Climate Resilience", duration: "24m", status: "locked" },
        ]
      },
      {
        id: "tectonics", name: "Plate Tectonics", icon: "🌋",
        desc: "Earth's moving plates, volcanoes and earthquakes",
        duration: "3h 20m", modules: 10, progress: 0,
        moduleList: [
          { id: 1, name: "Structure of the Earth: Core, Mantle, Crust", duration: "18m", status: "active" },
          { id: 2, name: "Tectonic Plates: Major & Minor Plates", duration: "20m", status: "locked" },
          { id: 3, name: "Theory of Continental Drift (Wegener)", duration: "20m", status: "locked" },
          { id: 4, name: "Sea-Floor Spreading & Mid-Ocean Ridges", duration: "22m", status: "locked" },
          { id: 5, name: "Convergent Boundaries & Subduction Zones", duration: "22m", status: "locked" },
          { id: 6, name: "Divergent Boundaries & Rift Valleys", duration: "20m", status: "locked" },
          { id: 7, name: "Transform (Fault) Boundaries & Earthquakes", duration: "22m", status: "locked" },
          { id: 8, name: "Volcanoes: Formation, Types & Distribution", duration: "24m", status: "locked" },
          { id: 9, name: "Earthquakes: Measurement, Richter Scale & Tsunamis", duration: "24m", status: "locked" },
          { id: 10, name: "Plate Tectonics & Mountain Building (Orogeny)", duration: "22m", status: "locked" },
        ]
      },
      {
        id: "water", name: "Water Cycle", icon: "💧",
        desc: "Precipitation, evaporation and groundwater",
        duration: "2h 40m", modules: 10, progress: 60,
        moduleList: [
          { id: 1, name: "Overview of the Hydrological (Water) Cycle", duration: "16m", status: "done" },
          { id: 2, name: "Evaporation & Transpiration (Evapotranspiration)", duration: "18m", status: "done" },
          { id: 3, name: "Condensation & Cloud Formation", duration: "16m", status: "done" },
          { id: 4, name: "Precipitation: Types & Global Distribution", duration: "18m", status: "done" },
          { id: 5, name: "Surface Runoff & Infiltration", duration: "16m", status: "done" },
          { id: 6, name: "Groundwater: Aquifers & the Water Table", duration: "18m", status: "done" },
          { id: 7, name: "River Systems & Drainage Basins", duration: "18m", status: "active" },
          { id: 8, name: "Glaciers & Ice Sheets as Water Stores", duration: "20m", status: "locked" },
          { id: 9, name: "Human Interference: Dams, Irrigation & Urbanization", duration: "20m", status: "locked" },
          { id: 10, name: "Water Scarcity & the Future of Freshwater Resources", duration: "22m", status: "locked" },
        ]
      },
      {
        id: "soil", name: "Types of Soil", icon: "🌱",
        desc: "Soil composition, properties and agriculture",
        duration: "2h 20m", modules: 10, progress: 100,
        moduleList: [
          { id: 1, name: "What is Soil? Composition & Profile (Horizons)", duration: "16m", status: "done" },
          { id: 2, name: "Sandy Soil: Properties, Drainage & Crop Suitability", duration: "14m", status: "done" },
          { id: 3, name: "Clay Soil: Properties, Water Retention & Uses", duration: "14m", status: "done" },
          { id: 4, name: "Silt Soil: Formation, Fertility & Erosion Risk", duration: "14m", status: "done" },
          { id: 5, name: "Loam Soil: The Ideal Agricultural Soil", duration: "14m", status: "done" },
          { id: 6, name: "Peaty Soil: Organic Content & Waterlogging", duration: "14m", status: "done" },
          { id: 7, name: "Chalk & Limestone Soils: Alkalinity & Drainage", duration: "14m", status: "done" },
          { id: 8, name: "Saline & Laterite Soils in Tropical Regions", duration: "16m", status: "done" },
          { id: 9, name: "Soil Erosion: Causes, Types & Consequences", duration: "16m", status: "done" },
          { id: 10, name: "Soil Conservation Methods & Sustainable Farming", duration: "16m", status: "done" },
        ]
      },
      {
        id: "rivers", name: "River Formation", icon: "🏞️",
        desc: "How rivers shape and transform landscapes",
        duration: "2h 50m", modules: 10, progress: 20,
        moduleList: [
          { id: 1, name: "The River System: Source, Course & Mouth", duration: "16m", status: "done" },
          { id: 2, name: "Drainage Basins, Watersheds & Tributaries", duration: "18m", status: "done" },
          { id: 3, name: "Upper Course: V-Shaped Valleys & Waterfalls", duration: "18m", status: "active" },
          { id: 4, name: "Middle Course: Meanders & Floodplains", duration: "18m", status: "locked" },
          { id: 5, name: "Lower Course: Ox-Bow Lakes & Deltas", duration: "18m", status: "locked" },
          { id: 6, name: "River Erosion: Hydraulic Action, Abrasion, Attrition", duration: "20m", status: "locked" },
          { id: 7, name: "River Transportation: Traction, Saltation, Suspension", duration: "18m", status: "locked" },
          { id: 8, name: "River Deposition & Landform Creation", duration: "18m", status: "locked" },
          { id: 9, name: "Flooding: Causes, Effects & Management", duration: "20m", status: "locked" },
          { id: 10, name: "Human Use of Rivers: Irrigation, Industry & Navigation", duration: "18m", status: "locked" },
        ]
      },
    ]
  },
  {
    id: "english", emoji: "📝", name: "English & Language",
    desc: "Master grammar, writing and communication",
    color: "#A06CB0", bg: "#F4EEF7", txt: "#7A4A8C",
    modules: 40, subtopics: 4, students: "11.5k",
    subtopicList: [
      {
        id: "parts", name: "Parts of Speech", icon: "Aa",
        desc: "Nouns, verbs, adjectives and the building blocks of language",
        duration: "2h 50m", modules: 10, progress: 100,
        moduleList: [
          { id: 1, name: "Nouns: Common, Proper, Abstract & Collective", duration: "16m", status: "done" },
          { id: 2, name: "Pronouns: Personal, Relative & Reflexive", duration: "16m", status: "done" },
          { id: 3, name: "Verbs: Action, Linking & Auxiliary Verbs", duration: "18m", status: "done" },
          { id: 4, name: "Adjectives: Types, Comparatives & Superlatives", duration: "16m", status: "done" },
          { id: 5, name: "Adverbs: Manner, Time, Place & Degree", duration: "16m", status: "done" },
          { id: 6, name: "Prepositions & Prepositional Phrases", duration: "14m", status: "done" },
          { id: 7, name: "Conjunctions: Coordinating, Subordinating & Correlative", duration: "18m", status: "done" },
          { id: 8, name: "Interjections & Their Punctuation", duration: "12m", status: "done" },
          { id: 9, name: "Determiners & Articles (a, an, the)", duration: "14m", status: "done" },
          { id: 10, name: "Identifying Parts of Speech in Context (Sentence Analysis)", duration: "20m", status: "done" },
        ]
      },
      {
        id: "essay", name: "Essay Writing", icon: "✍️",
        desc: "Structure, argue and express ideas in writing",
        duration: "3h 40m", modules: 10, progress: 50,
        moduleList: [
          { id: 1, name: "Understanding Essay Types: Narrative, Descriptive, Expository, Argumentative", duration: "22m", status: "done" },
          { id: 2, name: "Brainstorming & Outlining Your Essay", duration: "20m", status: "done" },
          { id: 3, name: "Writing a Strong Introduction & Thesis Statement", duration: "22m", status: "done" },
          { id: 4, name: "Developing Body Paragraphs (PEEL Structure)", duration: "24m", status: "done" },
          { id: 5, name: "Using Evidence, Examples & Quotations", duration: "22m", status: "done" },
          { id: 6, name: "Transitions & Cohesion Between Paragraphs", duration: "20m", status: "active" },
          { id: 7, name: "Writing a Compelling Conclusion", duration: "18m", status: "locked" },
          { id: 8, name: "Formal vs. Informal Register & Audience Awareness", duration: "20m", status: "locked" },
          { id: 9, name: "Editing, Proofreading & Improving Your Draft", duration: "22m", status: "locked" },
          { id: 10, name: "Common Mistakes to Avoid in Essay Writing", duration: "18m", status: "locked" },
        ]
      },
      {
        id: "tenses", name: "Tenses", icon: "⏱️",
        desc: "Past, present and future verb forms",
        duration: "3h 10m", modules: 10, progress: 70,
        moduleList: [
          { id: 1, name: "Simple Present: Form & Uses", duration: "16m", status: "done" },
          { id: 2, name: "Present Continuous: Form & Uses", duration: "16m", status: "done" },
          { id: 3, name: "Present Perfect & Present Perfect Continuous", duration: "20m", status: "done" },
          { id: 4, name: "Simple Past: Regular & Irregular Verbs", duration: "18m", status: "done" },
          { id: 5, name: "Past Continuous & Past Perfect", duration: "20m", status: "done" },
          { id: 6, name: "Simple Future: will & going to", duration: "16m", status: "done" },
          { id: 7, name: "Future Continuous & Future Perfect", duration: "18m", status: "done" },
          { id: 8, name: "The Twelve Tenses: Overview & Comparison", duration: "22m", status: "active" },
          { id: 9, name: "Common Tense Errors & How to Correct Them", duration: "20m", status: "locked" },
          { id: 10, name: "Tense Consistency in Writing", duration: "18m", status: "locked" },
        ]
      },
      {
        id: "voice", name: "Active vs. Passive Voice", icon: "↔️",
        desc: "Transform and understand sentence voice",
        duration: "2h 30m", modules: 10, progress: 0,
        moduleList: [
          { id: 1, name: "What is Voice? Active vs. Passive Defined", duration: "14m", status: "active" },
          { id: 2, name: "Structure of Active Voice Sentences", duration: "14m", status: "locked" },
          { id: 3, name: "Converting Active to Passive: Simple Present", duration: "16m", status: "locked" },
          { id: 4, name: "Converting Active to Passive: Simple Past", duration: "16m", status: "locked" },
          { id: 5, name: "Passive Voice in Other Tenses", duration: "18m", status: "locked" },
          { id: 6, name: "Passive Voice with Modal Verbs", duration: "16m", status: "locked" },
          { id: 7, name: "When and Why to Use Passive Voice", duration: "14m", status: "locked" },
          { id: 8, name: "Passive Voice in Academic & Scientific Writing", duration: "16m", status: "locked" },
          { id: 9, name: "Avoiding Overuse of Passive Voice", duration: "14m", status: "locked" },
          { id: 10, name: "Practice: Identifying & Transforming Voice in Paragraphs", duration: "22m", status: "locked" },
        ]
      },
    ]
  },
  {
    id: "econ", emoji: "💰", name: "Economics",
    desc: "Understand markets, money and economic systems",
    color: "#D4860A", bg: "#FEF4E3", txt: "#A6650A",
    modules: 40, subtopics: 4, students: "8.7k",
    subtopicList: [
      {
        id: "demand", name: "Demand and Supply", icon: "📊",
        desc: "How markets determine prices and quantities",
        duration: "3h 20m", modules: 10, progress: 65,
        moduleList: [
          { id: 1, name: "What is Demand? The Law of Demand", duration: "18m", status: "done" },
          { id: 2, name: "Demand Curves: Plotting & Shifting", duration: "20m", status: "done" },
          { id: 3, name: "Determinants of Demand (Income, Prices, Preferences)", duration: "22m", status: "done" },
          { id: 4, name: "What is Supply? The Law of Supply", duration: "18m", status: "done" },
          { id: 5, name: "Supply Curves: Plotting & Shifting", duration: "20m", status: "done" },
          { id: 6, name: "Determinants of Supply (Input Costs, Technology)", duration: "20m", status: "done" },
          { id: 7, name: "Market Equilibrium: Where Demand Meets Supply", duration: "22m", status: "active" },
          { id: 8, name: "Surplus, Shortage & Price Adjustment", duration: "20m", status: "locked" },
          { id: 9, name: "Price Elasticity of Demand & Supply", duration: "24m", status: "locked" },
          { id: 10, name: "Real-World Applications: Prices, Shortages & Government Policy", duration: "26m", status: "locked" },
        ]
      },
      {
        id: "inflation", name: "Inflation", icon: "📈",
        desc: "Prices, purchasing power and monetary policy",
        duration: "3h 10m", modules: 10, progress: 30,
        moduleList: [
          { id: 1, name: "What is Inflation? Definition & Measurement (CPI)", duration: "20m", status: "done" },
          { id: 2, name: "Types of Inflation: Demand-Pull & Cost-Push", duration: "20m", status: "done" },
          { id: 3, name: "Hyperinflation & Historical Examples", duration: "20m", status: "done" },
          { id: 4, name: "Causes of Inflation: Money Supply & Aggregate Demand", duration: "22m", status: "active" },
          { id: 5, name: "Effects of Inflation on Consumers & Businesses", duration: "20m", status: "locked" },
          { id: 6, name: "Inflation vs. Deflation & Their Risks", duration: "18m", status: "locked" },
          { id: 7, name: "The Role of Central Banks (Interest Rate Policy)", duration: "22m", status: "locked" },
          { id: 8, name: "Inflation & Real vs. Nominal Values", duration: "20m", status: "locked" },
          { id: 9, name: "Wage-Price Spiral", duration: "18m", status: "locked" },
          { id: 10, name: "Strategies to Control Inflation (Monetary & Fiscal Policy)", duration: "22m", status: "locked" },
        ]
      },
      {
        id: "gdp", name: "GDP Basics", icon: "🏦",
        desc: "Measuring and interpreting economic output",
        duration: "2h 50m", modules: 10, progress: 0,
        moduleList: [
          { id: 1, name: "What is GDP? Definition & Importance", duration: "16m", status: "active" },
          { id: 2, name: "Components of GDP: C + I + G + (X-M)", duration: "18m", status: "locked" },
          { id: 3, name: "Nominal GDP vs. Real GDP", duration: "18m", status: "locked" },
          { id: 4, name: "GDP per Capita & Standard of Living", duration: "16m", status: "locked" },
          { id: 5, name: "GDP Growth Rate & the Business Cycle", duration: "18m", status: "locked" },
          { id: 6, name: "Measuring GDP: Expenditure, Income & Output Methods", duration: "20m", status: "locked" },
          { id: 7, name: "Limitations of GDP as a Welfare Measure", duration: "16m", status: "locked" },
          { id: 8, name: "GDP vs. GNP vs. GNI", duration: "16m", status: "locked" },
          { id: 9, name: "Comparing GDP Across Countries (PPP)", duration: "18m", status: "locked" },
          { id: 10, name: "GDP & Economic Policy Decisions", duration: "18m", status: "locked" },
        ]
      },
      {
        id: "budget", name: "Budget Concepts", icon: "🪙",
        desc: "Government spending, deficits and fiscal policy",
        duration: "3h 00m", modules: 10, progress: 100,
        moduleList: [
          { id: 1, name: "What is a Government Budget?", duration: "16m", status: "done" },
          { id: 2, name: "Revenue Sources: Taxes (Direct & Indirect)", duration: "18m", status: "done" },
          { id: 3, name: "Government Expenditure: Types & Functions", duration: "18m", status: "done" },
          { id: 4, name: "Budget Surplus, Deficit & Balanced Budget", duration: "20m", status: "done" },
          { id: 5, name: "Fiscal Policy: Expansionary & Contractionary", duration: "20m", status: "done" },
          { id: 6, name: "The National Debt & Public Borrowing", duration: "18m", status: "done" },
          { id: 7, name: "Capital Budget vs. Revenue Budget", duration: "16m", status: "done" },
          { id: 8, name: "Deficit Financing & Its Consequences", duration: "18m", status: "done" },
          { id: 9, name: "Union Budget in India / Federal Budget Structure", duration: "20m", status: "done" },
          { id: 10, name: "Budgeting for Individuals & Personal Finance Basics", duration: "16m", status: "done" },
        ]
      },
    ]
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function ProgressRing({ pct, color, size = 44 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
    </svg>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "done") return <CheckCircle size={20} color="var(--success)" fill="var(--success-subtle)" />;
  if (status === "active") return <Play size={18} color="var(--brand-primary)" />;
  return <Lock size={16} color="var(--text-muted)" />;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function CoursesExplorer() {
  const [page, setPage] = useState<"subjects" | "subtopics" | "modules" | "lesson">("subjects");
  const [selectedSubject, setSelectedSubject] = useState<typeof SUBJECTS[0] | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<typeof SUBJECTS[0]["subtopicList"][0] | null>(null);
  const [selectedModule, setSelectedModule] = useState<typeof SUBJECTS[0]["subtopicList"][0]["moduleList"][0] | null>(null);
  const [search, setSearch] = useState("");

  const { getProgress, getModuleStatus, markComplete } = useProgress();
  const { user } = useAuth();
  const [learningStyle, setLearningStyle] = useState("Interactive");

  // AI Micro-Video States
  const [generatedLesson, setGeneratedLesson] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoError, setVideoError] = useState("");

  // Rules of Hooks: Move state to top level
  const [videoWatched, setVideoWatched] = useState(false);

  useEffect(() => {
    // If it's already done, it should stay watched
    if (page === "lesson" && selectedModule) {
      const topicKey = `${selectedSubject?.id}_${selectedSubtopic?.id}`;
      const status = getModuleStatus(topicKey, selectedModule.id);
      if (status === "done") {
        setVideoWatched(true);
      } else {
        setVideoWatched(false);
      }
    }
  }, [page, selectedModule, selectedSubject, selectedSubtopic, getModuleStatus]);

  const goToSubtopics = (subj: typeof SUBJECTS[0]) => {
    setSelectedSubject(subj);
    setSelectedSubtopic(null);
    setSearch("");
    setPage("subtopics");
  };
  const goToModules = (st: typeof SUBJECTS[0]["subtopicList"][0]) => {
    setSelectedSubtopic(st);
    setSearch("");
    setPage("modules");
  };
  const goToLesson = async (subj: typeof SUBJECTS[0], st: typeof SUBJECTS[0]["subtopicList"][0], mod: typeof SUBJECTS[0]["subtopicList"][0]["moduleList"][0]) => {
    // Check if module is locked
    const topicKey = `${subj.id}_${st.id}`;
    if (getModuleStatus(topicKey, mod.id) === "locked") return;

    setSelectedSubject(subj);
    setSelectedSubtopic(st);
    setSelectedModule(mod);
    setPage("lesson");
    
    // Trigger AI lesson generation
    setIsGenerating(true);
    setVideoError("");
    setGeneratedLesson(null);
    
    try {
      const res = await fetch("/api/generate-microlesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic: mod.name, 
          subject: subj.name,
          learningStyle: learningStyle
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate AI lesson");
      }
      const data = await res.json();
      setGeneratedLesson(data);
    } catch (err: any) {
      setVideoError(err.message || "Something went wrong generating the lesson.");
    } finally {
      setIsGenerating(false);
    }
  };
  const goBack = () => {
    setSearch("");
    if (page === "lesson") setPage("modules");
    else if (page === "modules") setPage("subtopics");
    else { setPage("subjects"); setSelectedSubject(null); }
  };

  // ── PAGE 1: ALL SUBJECTS ────────────────────────────────────────────────────
  const renderSubjects = () => {
    const filtered = SUBJECTS.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
    return (
      <>
        <style>{`
          @keyframes fadeSlideUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
          @keyframes cardIn { from { opacity:0; transform:translateY(14px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
          .page-wrap { display:flex; flex-direction:column; gap:var(--space-8); width:100%; max-width:960px; animation:fadeSlideUp .4s ease; }
          .page-hdr { display:flex; flex-direction:column; gap:var(--space-1); }
          .page-title { font-family:var(--font-display); font-size:var(--text-3xl); font-weight:800; color:var(--text-primary); line-height:var(--leading-tight); }
          .page-sub { font-size:var(--text-base); color:var(--text-secondary); }
          .search-row { display:flex; align-items:center; gap:var(--space-3); }
          .search-box { position:relative; flex:1; max-width:320px; }
          .search-box svg { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-muted); pointer-events:none; }
          .search-inp { width:100%; padding:10px 14px 10px 38px; background:var(--bg-surface); border:1.5px solid var(--border-default); border-radius:var(--radius-full); font-size:var(--text-sm); color:var(--text-primary); outline:none; transition:all var(--transition-fast); }
          .search-inp::placeholder { color:var(--text-muted); }
          .search-inp:focus { border-color:var(--brand-primary); box-shadow:0 0 0 3px rgba(61,139,113,.12); }
          .subjects-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:var(--space-5); }
          .subj-card { background:var(--bg-surface); border:1.5px solid var(--border-default); border-radius:var(--radius-xl); overflow:hidden; cursor:pointer; transition:all var(--transition-normal); box-shadow:var(--shadow-sm); animation:cardIn .4s ease both; }
          .subj-card:hover { box-shadow:var(--shadow-lg); transform:translateY(-4px); }
          .subj-banner { height:90px; display:flex; align-items:flex-end; padding:var(--space-4); position:relative; overflow:hidden; }
          .subj-banner-circle { position:absolute; right:-20px; top:-20px; width:100px; height:100px; border-radius:50%; background:rgba(255,255,255,.12); }
          .subj-banner-circle2 { position:absolute; right:20px; bottom:-30px; width:70px; height:70px; border-radius:50%; background:rgba(255,255,255,.08); }
          .subj-emoji { font-size:32px; line-height:1; position:relative; z-index:1; }
          .subj-body { padding:var(--space-5); display:flex; flex-direction:column; gap:var(--space-3); }
          .subj-name { font-family:var(--font-display); font-size:var(--text-lg); font-weight:800; color:var(--text-primary); }
          .subj-desc { font-size:var(--text-sm); color:var(--text-secondary); line-height:var(--leading-relaxed); }
          .subj-meta { display:flex; gap:var(--space-3); flex-wrap:wrap; }
          .subj-meta-pill { display:flex; align-items:center; gap:4px; font-size:11px; font-weight:600; padding:3px 8px; border-radius:var(--radius-full); }
          .subj-footer { display:flex; align-items:center; justify-content:space-between; padding-top:var(--space-3); border-top:1px solid var(--border-subtle); }
          .subj-students { font-size:var(--text-xs); color:var(--text-muted); font-weight:500; }
          .subj-cta { display:flex; align-items:center; gap:4px; font-size:var(--text-xs); font-weight:700; }
        `}</style>
        <div className="page-wrap">
          <div className="page-hdr">
            <div className="ds-section-label">Curriculum</div>
            <h1 className="page-title">All Subjects</h1>
            <p className="page-sub">Choose a subject to explore its topics and modules.</p>
          </div>
          <div className="search-row">
            <div className="search-box">
              <Search size={16} />
              <input className="search-inp" placeholder="Search subjects…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <span className="badge badge-neutral">{filtered.length} subjects</span>
          </div>
          <div className="subjects-grid">
            {filtered.map((s, i) => (
              <div key={s.id} className="subj-card" style={{ animationDelay: `${i * 55}ms` }} onClick={() => goToSubtopics(s)}>
                <div className="subj-banner" style={{ background: `linear-gradient(135deg, ${s.color}dd, ${s.color})` }}>
                  <div className="subj-banner-circle" />
                  <div className="subj-banner-circle2" />
                  <div className="subj-emoji">{s.emoji}</div>
                </div>
                <div className="subj-body">
                  <div className="subj-name">{s.name}</div>
                  <div className="subj-desc">{s.desc}</div>
                  <div className="subj-meta">
                    <span className="subj-meta-pill" style={{ background: s.bg, color: s.txt }}>
                      <BookOpen size={11} /> {s.subtopics} sub-topics
                    </span>
                    <span className="subj-meta-pill" style={{ background: s.bg, color: s.txt }}>
                      <BarChart2 size={11} /> {s.modules} modules
                    </span>
                  </div>
                  <div className="subj-footer">
                    <span className="subj-students">👥 {s.students} students</span>
                    <span className="subj-cta" style={{ color: s.color }}>Explore <ChevronRight size={14} /></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  // ── PAGE 2: SUB-TOPICS ──────────────────────────────────────────────────────
  const renderSubtopics = () => {
    if (!selectedSubject) return null;
    const s = selectedSubject;
    const filtered = s.subtopicList.filter(st =>
      st.name.toLowerCase().includes(search.toLowerCase())
    );
    const overallPct = Math.round(s.subtopicList.reduce((a, st) => a + getProgress(`${s.id}_${st.id}`, st.modules), 0) / s.subtopicList.length);
    return (
      <>
        <style>{`
          @keyframes fadeSlideUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
          @keyframes cardIn { from { opacity:0; transform:translateY(14px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
          .page-wrap { display:flex; flex-direction:column; gap:var(--space-8); width:100%; max-width:960px; animation:fadeSlideUp .4s ease; }
          .back-btn { display:inline-flex; align-items:center; gap:var(--space-2); font-size:var(--text-sm); font-weight:600; color:var(--text-secondary); cursor:pointer; background:none; border:none; padding:0; transition:color var(--transition-fast); }
          .back-btn:hover { color:var(--text-primary); }
          .subj-hero { border-radius:var(--radius-xl); padding:var(--space-8); display:flex; align-items:center; justify-content:space-between; gap:var(--space-6); overflow:hidden; position:relative; }
          .subj-hero-deco { position:absolute; right:-40px; top:-40px; width:180px; height:180px; border-radius:50%; background:rgba(255,255,255,.1); }
          .subj-hero-deco2 { position:absolute; right:60px; bottom:-60px; width:130px; height:130px; border-radius:50%; background:rgba(255,255,255,.07); }
          .subj-hero-left { z-index:1; }
          .subj-hero-emoji { font-size:48px; margin-bottom:var(--space-3); line-height:1; }
          .subj-hero-name { font-family:var(--font-display); font-size:var(--text-2xl); font-weight:800; color:#fff; margin-bottom:4px; }
          .subj-hero-desc { font-size:var(--text-sm); color:rgba(255,255,255,.8); max-width:340px; }
          .subj-hero-right { z-index:1; display:flex; flex-direction:column; align-items:center; gap:var(--space-2); }
          .hero-stat { font-family:var(--font-display); font-size:var(--text-3xl); font-weight:800; color:#fff; text-align:center; }
          .hero-stat-lbl { font-size:var(--text-xs); font-weight:600; color:rgba(255,255,255,.7); text-transform:uppercase; letter-spacing:.08em; }
          .search-row { display:flex; align-items:center; gap:var(--space-3); }
          .search-box { position:relative; flex:1; max-width:320px; }
          .search-box svg { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-muted); pointer-events:none; }
          .search-inp { width:100%; padding:10px 14px 10px 38px; background:var(--bg-surface); border:1.5px solid var(--border-default); border-radius:var(--radius-full); font-size:var(--text-sm); color:var(--text-primary); outline:none; transition:all var(--transition-fast); }
          .search-inp::placeholder { color:var(--text-muted); }
          .search-inp:focus { border-color:var(--brand-primary); box-shadow:0 0 0 3px rgba(61,139,113,.12); }
          .st-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:var(--space-4); }
          .st-card { background:var(--bg-surface); border:1.5px solid var(--border-default); border-radius:var(--radius-lg); padding:var(--space-5); cursor:pointer; transition:all var(--transition-normal); box-shadow:var(--shadow-sm); display:flex; flex-direction:column; gap:var(--space-4); animation:cardIn .35s ease both; }
          .st-card:hover { box-shadow:var(--shadow-lg); transform:translateY(-3px); }
          .st-card-top { display:flex; align-items:flex-start; justify-content:space-between; gap:var(--space-3); }
          .st-icon { width:44px; height:44px; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:700; flex-shrink:0; }
          .st-name { font-family:var(--font-display); font-size:var(--text-base); font-weight:700; color:var(--text-primary); margin-bottom:3px; }
          .st-desc { font-size:var(--text-xs); color:var(--text-secondary); line-height:var(--leading-relaxed); }
          .st-progress-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
          .st-progress-lbl { font-size:11px; font-weight:600; color:var(--text-muted); }
          .st-progress-pct { font-size:12px; font-weight:800; }
          .st-bar { height:5px; background:var(--bg-elevated); border-radius:var(--radius-full); overflow:hidden; }
          .st-bar-fill { height:100%; border-radius:var(--radius-full); transition:width .8s ease; }
          .st-meta { display:flex; gap:var(--space-3); }
          .st-meta-item { display:flex; align-items:center; gap:4px; font-size:11px; font-weight:600; color:var(--text-muted); }
          .st-cta { display:flex; align-items:center; justify-content:space-between; padding-top:var(--space-3); border-top:1px solid var(--border-subtle); }
          .st-status { font-size:11px; font-weight:700; padding:3px 8px; border-radius:var(--radius-full); }
        `}</style>
        <div className="page-wrap">
          <button className="back-btn" onClick={goBack}><ArrowLeft size={16} /> Back to Subjects</button>
          {/* Hero */}
          <div className="subj-hero" style={{ background: `linear-gradient(135deg, ${s.color}ee, ${s.color}bb)` }}>
            <div className="subj-hero-deco" /><div className="subj-hero-deco2" />
            <div className="subj-hero-left">
              <div className="subj-hero-emoji">{s.emoji}</div>
              <div className="subj-hero-name">{s.name}</div>
              <div className="subj-hero-desc">{s.desc}</div>
            </div>
            <div className="subj-hero-right">
              <ProgressRing pct={overallPct} color="#fff" size={72} />
              <div style={{ textAlign: "center", marginTop: -54 + "px" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-lg)", color: "#fff", lineHeight: 1 }}>{overallPct}%</div>
              </div>
              <div style={{ marginTop: 8 }}>
                <div className="hero-stat-lbl">Overall Progress</div>
              </div>
            </div>
          </div>

          <div className="search-row">
            <div className="search-box">
              <Search size={16} />
              <input className="search-inp" placeholder="Search sub-topics…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <span className="badge badge-neutral">{filtered.length} sub-topics</span>
          </div>

          <div className="st-grid">
            {filtered.map((st, i) => {
              const hookProgress = getProgress(`${s.id}_${st.id}`, st.modules);
              const isDone = hookProgress === 100;
              const isNew = hookProgress === 0;
              return (
                <div key={st.id} className="st-card" style={{ animationDelay: `${i * 50}ms` }}
                  onClick={() => goToModules(st)}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = s.color; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-default)"; }}
                >
                  <div className="st-card-top">
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-2)" }}>
                        <div className="st-icon" style={{ background: s.bg, color: s.color }}>{st.icon}</div>
                        <div className="st-name">{st.name}</div>
                      </div>
                      <div className="st-desc">{st.desc}</div>
                    </div>
                    <ProgressRing pct={hookProgress} color={s.color} size={40} />
                  </div>

                  <div>
                    <div className="st-progress-row">
                      <span className="st-progress-lbl">Progress</span>
                      <span className="st-progress-pct" style={{ color: s.color }}>{hookProgress}%</span>
                    </div>
                    <div className="st-bar">
                      <div className="st-bar-fill" style={{ width: `${hookProgress}%`, background: s.color }} />
                    </div>
                  </div>

                  <div className="st-meta">
                    <span className="st-meta-item"><Clock size={11} /> {st.duration}</span>
                    <span className="st-meta-item"><BookOpen size={11} /> {st.modules} modules</span>
                  </div>

                  <div className="st-cta">
                    {isDone
                      ? <span className="st-status" style={{ background: "var(--success-subtle)", color: "var(--success-text)" }}>✓ Completed</span>
                      : isNew
                        ? <span className="st-status" style={{ background: s.bg, color: s.txt }}>Start Learning</span>
                        : <span className="st-status" style={{ background: s.bg, color: s.txt }}>▶ Continue</span>
                    }
                    <ChevronRight size={16} color="var(--text-muted)" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  // ── PAGE 3: MODULES ──────────────────────────────────────────────────────────
  const renderModules = () => {
    if (!selectedSubject || !selectedSubtopic) return null;
    const s = selectedSubject;
    const st = selectedSubtopic;
    
    const topicKey = `${s.id}_${st.id}`;
    let doneCount = 0;
    const mappedModules = st.moduleList.map(m => {
      const status = getModuleStatus(topicKey, m.id);
      if (status === "done") doneCount++;
      return { ...m, dynamicStatus: status };
    });
    const subProgress = getProgress(topicKey, st.modules);

    const filtered = mappedModules.filter(m =>
      m.name.toLowerCase().includes(search.toLowerCase())
    );
    return (
      <>
        <style>{`
          @keyframes fadeSlideUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
          @keyframes moduleIn { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
          .page-wrap { display:flex; flex-direction:column; gap:var(--space-6); width:100%; max-width:860px; animation:fadeSlideUp .4s ease; }
          .breadcrumb { display:flex; align-items:center; gap:var(--space-2); font-size:var(--text-sm); flex-wrap:wrap; }
          .bc-item { color:var(--text-muted); font-weight:500; cursor:pointer; transition:color var(--transition-fast); }
          .bc-item:hover { color:var(--text-primary); }
          .bc-sep { color:var(--text-muted); }
          .bc-active { color:var(--text-primary); font-weight:700; }
          .mod-hero { border-radius:var(--radius-xl); overflow:hidden; border:1.5px solid var(--border-default); box-shadow:var(--shadow-md); }
          .mod-hero-banner { padding:var(--space-6) var(--space-8); display:flex; align-items:center; justify-content:space-between; gap:var(--space-6); position:relative; overflow:hidden; }
          .mod-hero-deco { position:absolute; right:-30px; top:-30px; width:140px; height:140px; border-radius:50%; background:rgba(255,255,255,.1); }
          .mod-hero-deco2 { position:absolute; left:50%; bottom:-50px; width:100px; height:100px; border-radius:50%; background:rgba(255,255,255,.06); }
          .mod-hero-left { z-index:1; }
          .mod-hero-eyebrow { font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.75); margin-bottom:var(--space-2); }
          .mod-hero-title { font-family:var(--font-display); font-size:var(--text-2xl); font-weight:800; color:#fff; margin-bottom:var(--space-2); }
          .mod-hero-desc { font-size:var(--text-sm); color:rgba(255,255,255,.8); }
          .mod-hero-stats { z-index:1; display:flex; gap:var(--space-5); }
          .mod-stat { text-align:center; }
          .mod-stat-val { font-family:var(--font-display); font-size:var(--text-xl); font-weight:800; color:#fff; }
          .mod-stat-lbl { font-size:10px; font-weight:600; color:rgba(255,255,255,.7); text-transform:uppercase; letter-spacing:.08em; }
          .mod-hero-bar-wrap { padding:var(--space-4) var(--space-8); background:var(--bg-elevated); border-top:1px solid var(--border-subtle); display:flex; align-items:center; gap:var(--space-4); }
          .mod-hero-bar-track { flex:1; height:8px; background:var(--border-default); border-radius:var(--radius-full); overflow:hidden; }
          .mod-hero-bar-fill { height:100%; border-radius:var(--radius-full); transition:width .8s ease; }
          .mod-hero-bar-pct { font-family:var(--font-display); font-size:var(--text-sm); font-weight:800; }
          .search-row { display:flex; align-items:center; gap:var(--space-3); }
          .search-box { position:relative; flex:1; max-width:320px; }
          .search-box svg { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-muted); pointer-events:none; }
          .search-inp { width:100%; padding:10px 14px 10px 38px; background:var(--bg-surface); border:1.5px solid var(--border-default); border-radius:var(--radius-full); font-size:var(--text-sm); color:var(--text-primary); outline:none; transition:all var(--transition-fast); }
          .search-inp::placeholder { color:var(--text-muted); }
          .search-inp:focus { border-color:var(--brand-primary); box-shadow:0 0 0 3px rgba(61,139,113,.12); }
          .mod-list { display:flex; flex-direction:column; gap:var(--space-2); }
          .mod-item { display:flex; align-items:center; gap:var(--space-4); padding:var(--space-4) var(--space-5); background:var(--bg-surface); border:1.5px solid var(--border-default); border-radius:var(--radius-lg); cursor:pointer; transition:all var(--transition-fast); animation:moduleIn .3s ease both; box-shadow:var(--shadow-sm); }
          .mod-item:hover:not(.mod-locked) { border-color:var(--border-strong); box-shadow:var(--shadow-md); transform:translateX(4px); }
          .mod-item.mod-active { border-color:var(--brand-primary); background:var(--brand-primary-light); }
          .mod-item.mod-locked { opacity:.55; cursor:not-allowed; }
          .mod-num { width:32px; height:32px; border-radius:var(--radius-sm); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; flex-shrink:0; }
          .mod-info { flex:1; }
          .mod-name { font-size:var(--text-sm); font-weight:600; color:var(--text-primary); line-height:var(--leading-snug); }
          .mod-item.mod-locked .mod-name { color:var(--text-muted); }
          .mod-item.mod-active .mod-name { color:var(--brand-primary); font-weight:700; }
          .mod-dur { font-size:11px; color:var(--text-muted); margin-top:2px; display:flex; align-items:center; gap:3px; }
          .mod-right { display:flex; align-items:center; gap:var(--space-3); flex-shrink:0; }
          .mod-play-btn { width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:none; cursor:pointer; transition:all var(--transition-fast); }
          .mod-play-btn:hover { transform:scale(1.1); }
        `}</style>
        <div className="page-wrap">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <span className="bc-item" onClick={() => setPage("subjects")}>All Subjects</span>
            <ChevronRight size={14} className="bc-sep" />
            <span className="bc-item" onClick={goBack}>{s.name}</span>
            <ChevronRight size={14} className="bc-sep" />
            <span className="bc-active">{st.name}</span>
          </div>

          {/* Hero card */}
          <div className="mod-hero">
            <div className="mod-hero-banner" style={{ background: `linear-gradient(135deg, ${s.color}ee, ${s.color}bb)` }}>
              <div className="mod-hero-deco" /><div className="mod-hero-deco2" />
              <div className="mod-hero-left">
                <div className="mod-hero-eyebrow">{s.emoji} {s.name}</div>
                <div className="mod-hero-title">{st.name}</div>
                <div className="mod-hero-desc">{st.desc}</div>
              </div>
              <div className="mod-hero-stats">
                <div className="mod-stat">
                  <div className="mod-stat-val">{doneCount}</div>
                  <div className="mod-stat-lbl">Done</div>
                </div>
                <div className="mod-stat">
                  <div className="mod-stat-val">{st.modules - doneCount}</div>
                  <div className="mod-stat-lbl">Remaining</div>
                </div>
                <div className="mod-stat">
                  <div className="mod-stat-val">{st.duration}</div>
                  <div className="mod-stat-lbl">Total</div>
                </div>
              </div>
            </div>
            <div className="mod-hero-bar-wrap">
              <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>Overall Progress</span>
              <div className="mod-hero-bar-track">
                <div className="mod-hero-bar-fill" style={{ width: `${subProgress}%`, background: s.color }} />
              </div>
              <span className="mod-hero-bar-pct" style={{ color: s.color }}>{subProgress}%</span>
            </div>
          </div>

          {/* Search */}
          <div className="search-row">
            <div className="search-box">
              <Search size={16} />
              <input className="search-inp" placeholder="Search modules…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <span className="badge badge-neutral">{st.modules} modules</span>
            {doneCount > 0 && <span className="badge badge-success">✓ {doneCount} completed</span>}
          </div>

          {/* Module list */}
          <div className="mod-list">
            {filtered.map((m, i) => {
              const isDone = m.dynamicStatus === "done";
              const isActive = m.dynamicStatus === "active";
              const isLocked = m.dynamicStatus === "locked";
              return (
                <div key={m.id}
                  className={`mod-item${isActive ? " mod-active" : ""}${isLocked ? " mod-locked" : ""}`}
                  style={{ animationDelay: `${i * 40}ms` }}
                  onClick={() => !isLocked && goToLesson(s, st, m)}
                >
                  <div className="mod-num" style={{
                    background: isDone ? "var(--success-subtle)" : isActive ? "var(--brand-primary)" : "var(--bg-elevated)",
                    color: isDone ? "var(--success-text)" : isActive ? "#fff" : "var(--text-muted)",
                  }}>
                    {isDone ? "✓" : m.id}
                  </div>
                  <div className="mod-info">
                    <div className="mod-name">{m.name}</div>
                    <div className="mod-dur">
                      <Clock size={10} /> {m.duration}
                      {isActive && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: "var(--brand-primary)", background: "rgba(61,139,113,.12)", padding: "1px 6px", borderRadius: "var(--radius-full)" }}>In Progress</span>}
                    </div>
                  </div>
                  <div className="mod-right">
                    <StatusIcon status={m.dynamicStatus} />
                    {!isLocked && (
                      <div className="mod-play-btn"
                        style={{ background: isActive ? "var(--brand-primary)" : isDone ? "var(--success-subtle)" : s.bg }}
                      >
                        {isDone
                          ? <CheckCircle size={16} color="var(--success)" />
                          : <Play size={14} color={isActive ? "#fff" : s.color} fill={isActive ? "#fff" : s.color} />
                        }
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  // ── PAGE 4: LESSON ────────────────────────────────────────────────────────
  const renderLesson = () => {
    if (!selectedSubject || !selectedSubtopic || !selectedModule) return null;
    const s = selectedSubject;
    const st = selectedSubtopic;
    const m = selectedModule;
    const topicKey = `${s.id}_${st.id}`;
    const status = getModuleStatus(topicKey, m.id);
    const isDone = status === "done";
    
    const handleComplete = () => {
      markComplete(topicKey, m.id);
      goBack(); // Return to modules page
    };

    const handleQuizComplete = async (score: number, total: number) => {
      setVideoWatched(true);
      if (user) {
        // 1. Save lesson to Firestore
        await saveLesson(user.uid, `${s.id}_${st.id}_${m.id}`, {
          topic: m.name,
          subject: s.name,
          difficulty: st.name,
          finalScore: score,
          status: "done"
        });

        // 2. Save results to Firebase
        await saveQuizResult(user.uid, {
          topic: m.name,
          subject: s.name,
          style: learningStyle,
          score,
          total
        });

        // 3. Update user stats (XP, streaks)
        await updateUserStats(user.uid, score * 10);
      }
    };

    return (
      <div className="page-wrap" style={{ maxWidth: 1200, margin: "0 auto", animation: "fadeSlideUp .4s ease" }}>
        <style>{`
          .lesson-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--space-6); }
          .back-btn { display:inline-flex; align-items:center; gap:var(--space-2); font-size:var(--text-sm); font-weight:600; color:var(--text-secondary); cursor:pointer; background:none; border:none; padding:0; transition:color var(--transition-fast); }
          .back-btn:hover { color:var(--text-primary); }
          .video-container { position:relative; width:100%; aspect-ratio:16/9; background:#000; border-radius:var(--radius-xl); overflow:hidden; box-shadow:var(--shadow-lg); margin-bottom:var(--space-6); display:flex; align-items:center; justify-content:center; }
          .lesson-footer { display:flex; align-items:center; justify-content:space-between; padding:var(--space-6); background:var(--bg-surface); border:1.5px solid var(--border-default); border-radius:var(--radius-xl); }
          .complete-btn { padding:12px 24px; border-radius:var(--radius-full); font-weight:700; font-size:var(--text-sm); border:none; cursor:pointer; transition:all var(--transition-fast); display:flex; align-items:center; gap:8px; }
          .btn-active { background:var(--brand-primary); color:#fff; box-shadow:var(--shadow-sm); }
          .btn-active:hover { background:var(--brand-primary-dark); transform:translateY(-2px); box-shadow:var(--shadow-md); }
          .btn-disabled { background:var(--bg-elevated); color:var(--text-muted); cursor:not-allowed; }
          .btn-done { background:var(--success-subtle); color:var(--success-text); cursor:default; }
        `}</style>
        
        <div className="lesson-header">
          <button className="back-btn" onClick={goBack}><ArrowLeft size={16} /> Back to Modules</button>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-secondary)" }}>
            Module {m.id} of {st.modules}
          </div>
        </div>

        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>{m.name}</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>{s.name} • {st.name} • {m.duration}</p>
        </div>

        <div className="video-container" style={{ background: isGenerating ? "var(--bg-elevated)" : "#000" }}>
          {isGenerating ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Loader2 size={48} className="animate-spin" style={{ color: "var(--brand-primary)", marginBottom: 16, margin: "0 auto" }} />
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>AI is crafting your 30-second lesson…</div>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Building animated segments and interactive moments.</p>
            </div>
          ) : videoError ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: "var(--error)" }}>Generation Error</div>
              <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 20, maxWidth: "80%", margin: "0 auto 20px" }}>
                {videoError}
              </p>
              <button 
                className="btn btn-secondary" 
                onClick={() => goToLesson(s, st, m)}
                style={{ background: "var(--bg-surface)" }}
              >
                <RotateCcw size={14} style={{ marginRight: 8 }} /> Try Again
              </button>
            </div>
          ) : generatedLesson ? (
            <MicroVideoPlayer 
              lesson={generatedLesson} 
              learningStyle={learningStyle}
              onComplete={() => setVideoWatched(true)} 
              onQuizComplete={handleQuizComplete}
            />
          ) : (
            <div style={{ color: "var(--text-muted)" }}>Initializing player...</div>
          )}
        </div>

        {/* ── Quick Notes Section ── */}
        {generatedLesson?.quickSummary && (
          <div className="notes-section" style={{
            background: "var(--bg-surface)",
            border: "1.5px solid var(--border-default)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-6)",
            marginBottom: "var(--space-6)",
            animation: "fadeSlideUp .5s ease",
          }}>
            <style>{`
              .notes-header { display:flex; align-items:center; gap:10px; margin-bottom:var(--space-4); }
              .notes-icon { width:36px; height:36px; border-radius:var(--radius-lg); display:flex; align-items:center; justify-content:center; font-size:18px; }
              .notes-title { font-family:var(--font-display); font-size:var(--text-lg); font-weight:800; color:var(--text-primary); }
              .notes-summary { font-size:var(--text-sm); color:var(--text-secondary); line-height:1.6; margin-bottom:var(--space-4); padding:var(--space-3) var(--space-4); background:var(--bg-elevated); border-radius:var(--radius-lg); border-left:3px solid var(--brand-primary); }
              .notes-list { display:flex; flex-direction:column; gap:10px; }
              .note-item { display:flex; align-items:flex-start; gap:12px; padding:var(--space-3) var(--space-4); border-radius:var(--radius-lg); background:var(--bg-elevated); transition:all var(--transition-fast); }
              .note-item:hover { background:var(--bg-page); transform:translateX(4px); }
              .note-bullet { width:24px; height:24px; border-radius:var(--radius-full); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; flex-shrink:0; margin-top:1px; }
              .note-text { font-size:var(--text-sm); color:var(--text-primary); line-height:1.55; }
            `}</style>

            <div className="notes-header">
              <div className="notes-icon" style={{ background: s.bg, color: s.color }}>📝</div>
              <div className="notes-title">Quick Notes</div>
            </div>

            {generatedLesson.quickSummary.summary && (
              <div className="notes-summary">
                {generatedLesson.quickSummary.summary}
              </div>
            )}

            {generatedLesson.quickSummary.notes?.length > 0 && (
              <div className="notes-list">
                {generatedLesson.quickSummary.notes.map((note: string, idx: number) => (
                  <div className="note-item" key={idx} style={{ animationDelay: `${idx * 80}ms`, animation: "fadeSlideUp .4s ease both" }}>
                    <div className="note-bullet" style={{
                      background: s.bg,
                      color: s.color,
                    }}>
                      {idx + 1}
                    </div>
                    <div className="note-text">{note}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="lesson-footer">
          <div>
            <div style={{ fontWeight: 700, fontSize: "var(--text-base)", marginBottom: 4 }}>Did you understand the topic?</div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
              {isDone ? "You have already completed this lesson." : videoWatched ? "Great! Mark this topic as completed to continue." : "Watch the lesson to unlock completion."}
            </div>
          </div>
          
          {isDone ? (
            <button className="complete-btn btn-done">
              <CheckCircle size={18} /> Completed
            </button>
          ) : (
            <button 
              className={`complete-btn ${videoWatched ? "btn-active" : "btn-disabled"}`}
              onClick={videoWatched ? handleComplete : undefined}
              disabled={!videoWatched}
            >
              <CheckCircle size={18} /> Complete Topic
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "var(--space-8)", background: "var(--bg-page)", minHeight: "100vh" }}>
      {page === "subjects" && renderSubjects()}
      {page === "subtopics" && renderSubtopics()}
      {page === "modules" && renderModules()}
      {page === "lesson" && renderLesson()}
    </div>
  );
}
