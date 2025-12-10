import React, { useEffect, useState } from 'react';
import { FiUsers, FiAward, FiTrendingUp, FiTarget } from 'react-icons/fi';
import api from '../src/utils/api';

interface PlatformStats {
  totalStudents: number;
  totalCourses: number;
  totalInstructors: number;
  successRate: number;
}

const AboutPage: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats>({
    totalStudents: 0,
    totalCourses: 0,
    totalInstructors: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/public/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching platform stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-light-bg pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold text-light-text mb-6">About DoFlow</h1>
          <p className="text-xl text-light-textSecondary leading-relaxed">
            Empowering learners worldwide with high-quality, accessible education
          </p>
        </div>

        {/* Mission Section */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="bg-light-card rounded-xl p-8 border border-border-subtle">
            <h2 className="text-3xl font-bold text-light-text mb-6">Our Mission</h2>
            <p className="text-lg text-light-textSecondary mb-4 leading-relaxed">
              DoFlow is a premier online learning platform dedicated to making professional skills and knowledge 
              available to everyone, regardless of their location or background. We believe that education is the 
              key to unlocking human potential and creating opportunities for personal and professional growth.
            </p>
            <p className="text-lg text-light-textSecondary leading-relaxed">
              With expert instructors, comprehensive courses, and a supportive community, we're helping thousands 
              of students achieve their career goals and transform their lives through learning.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-light-card rounded-xl p-6 border border-border-subtle text-center">
            <div className="w-16 h-16 bg-brand-accentSoft rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUsers className="w-8 h-8 text-brand-primary" />
            </div>
            <h3 className="text-3xl font-bold text-brand-primary mb-2">
              {loading ? '...' : `${stats.totalStudents.toLocaleString()}+`}
            </h3>
            <p className="text-light-textSecondary">Active Students</p>
          </div>

          <div className="bg-light-card rounded-xl p-6 border border-border-subtle text-center">
            <div className="w-16 h-16 bg-brand-accentSoft rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAward className="w-8 h-8 text-brand-primary" />
            </div>
            <h3 className="text-3xl font-bold text-brand-primary mb-2">
              {loading ? '...' : `${stats.totalCourses.toLocaleString()}+`}
            </h3>
            <p className="text-light-textSecondary">Quality Courses</p>
          </div>

          <div className="bg-light-card rounded-xl p-6 border border-border-subtle text-center">
            <div className="w-16 h-16 bg-brand-accentSoft rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrendingUp className="w-8 h-8 text-brand-primary" />
            </div>
            <h3 className="text-3xl font-bold text-brand-primary mb-2">
              {loading ? '...' : `${stats.totalInstructors.toLocaleString()}+`}
            </h3>
            <p className="text-light-textSecondary">Expert Instructors</p>
          </div>

          <div className="bg-light-card rounded-xl p-6 border border-border-subtle text-center">
            <div className="w-16 h-16 bg-brand-accentSoft rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTarget className="w-8 h-8 text-brand-primary" />
            </div>
            <h3 className="text-3xl font-bold text-brand-primary mb-2">
              {loading ? '...' : `${stats.successRate}%`}
            </h3>
            <p className="text-light-textSecondary">Success Rate</p>
          </div>
        </div>

        {/* Values Section */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-light-text mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-light-card rounded-xl p-6 border border-border-subtle">
              <h3 className="text-xl font-bold text-light-text mb-3">Quality First</h3>
              <p className="text-light-textSecondary">
                Every course is crafted by industry experts and thoroughly reviewed to ensure the highest 
                quality learning experience.
              </p>
            </div>
            <div className="bg-light-card rounded-xl p-6 border border-border-subtle">
              <h3 className="text-xl font-bold text-light-text mb-3">Accessibility</h3>
              <p className="text-light-textSecondary">
                We believe education should be accessible to everyone. Our platform works seamlessly across 
                all devices and locations.
              </p>
            </div>
            <div className="bg-light-card rounded-xl p-6 border border-border-subtle">
              <h3 className="text-xl font-bold text-light-text mb-3">Community</h3>
              <p className="text-light-textSecondary">
                Learning is better together. Join our vibrant community of learners and instructors supporting 
                each other's growth.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto text-center bg-brand-accentSoft rounded-xl p-12">
          <h2 className="text-3xl font-bold text-light-text mb-4">Ready to Start Learning?</h2>
          <p className="text-lg text-light-textSecondary mb-8">
            Join thousands of students already learning on DoFlow
          </p>
          <button
            onClick={() => window.location.hash = '/courses'}
            className="px-8 py-3 bg-brand-primary hover:bg-brand-primaryHover text-white font-medium rounded-lg transition-colors"
          >
            Explore Courses
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
