import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CaseList } from './components/CaseList';
import { Diary } from './components/Diary';
import { CauseListView } from './components/CauseListView';
import { Settings } from './components/Settings';
import { CaseForm } from './components/CaseForm';
import { LegalCase } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Database } from 'lucide-react';
import { format } from 'date-fns';

export default function App() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedCase, setSelectedCase] = React.useState<LegalCase | undefined>();

  const handleEditCase = (c: LegalCase) => {
    setSelectedCase(c);
    setIsFormOpen(true);
  };

  const handleAddCase = () => {
    setSelectedCase(undefined);
    setIsFormOpen(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard setActiveTab={setActiveTab} />;
      case 'c
