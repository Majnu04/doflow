import React from 'react';
import { FiUsers, FiTrendingUp, FiAward, FiDollarSign, FiVideo, FiBookOpen } from 'react-icons/fi';

const BecomeInstructorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-light-bg pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold text-light-text mb-6">Become an Instructor</h1>
          <p className="text-xl text-light-textSecondary leading-relaxed mb-8">
            Share your expertise with thousands of students worldwide. Join our community of expert instructors 
            and make a difference while earning from your knowledge.
          </p>
          <button className="px-8 py-3 bg-brand-primary hover:bg-brand-primaryHover text-white font-medium rounded-lg transition-colors">
            Apply to Teach
          </button>
        </div>

        {/* Benefits Grid */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-light-text mb-8 text-center">Why Teach on DoFlow?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-light-card rounded-xl p-6 border border-border-subtle text-center">
              <div className="w-16 h-16 bg-brand-accentSoft rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-8 h-8 text-brand-primary" />
              </div>
              <h3 className="text-xl font-bold text-light-text mb-3">Reach Students</h3>
              <p className="text-light-textSecondary">
                Connect with thousands of eager learners from around the world looking to develop new skills.
              </p>
            </div>

            <div className="bg-light-card rounded-xl p-6 border border-border-subtle text-center">
              <div className="w-16 h-16 bg-brand-accentSoft rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrendingUp className="w-8 h-8 text-brand-primary" />
              </div>
              <h3 className="text-xl font-bold text-light-text mb-3">Grow Your Brand</h3>
              <p className="text-light-textSecondary">
                Build your reputation as an expert in your field and expand your professional network.
              </p>
            </div>

            <div className="bg-light-card rounded-xl p-6 border border-border-subtle text-center">
              <div className="w-16 h-16 bg-brand-accentSoft rounded-full flex items-center justify-center mx-auto mb-4">
                <FiDollarSign className="w-8 h-8 text-brand-primary" />
              </div>
              <h3 className="text-xl font-bold text-light-text mb-3">Earn Money</h3>
              <p className="text-light-textSecondary">
                Get paid for your valuable content with competitive revenue sharing on all course sales.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-light-text mb-8 text-center">How It Works</h2>
          <div className="space-y-6">
            <div className="bg-light-card rounded-xl p-6 border border-border-subtle flex items-start gap-6">
              <div className="w-12 h-12 bg-brand-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-light-text mb-2">Apply to Become an Instructor</h3>
                <p className="text-light-textSecondary">
                  Fill out our application form and tell us about your expertise and teaching experience.
                </p>
              </div>
            </div>

            <div className="bg-light-card rounded-xl p-6 border border-border-subtle flex items-start gap-6">
              <div className="w-12 h-12 bg-brand-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-light-text mb-2">Create Your Course</h3>
                <p className="text-light-textSecondary">
                  Use our course builder tools to create engaging video content, assessments, and learning materials.
                </p>
              </div>
            </div>

            <div className="bg-light-card rounded-xl p-6 border border-border-subtle flex items-start gap-6">
              <div className="w-12 h-12 bg-brand-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-light-text mb-2">Launch & Earn</h3>
                <p className="text-light-textSecondary">
                  Publish your course, promote it to your audience, and start earning from student enrollments.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-light-text mb-8 text-center">What You Need</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-neutral-sand rounded-xl p-6 border border-border-subtle">
              <FiAward className="w-10 h-10 text-brand-primary mb-4" />
              <h3 className="text-lg font-bold text-light-text mb-2">Expertise</h3>
              <p className="text-light-textSecondary">
                Deep knowledge in your field and passion for teaching others.
              </p>
            </div>
            <div className="bg-neutral-sand rounded-xl p-6 border border-border-subtle">
              <FiVideo className="w-10 h-10 text-brand-primary mb-4" />
              <h3 className="text-lg font-bold text-light-text mb-2">Equipment</h3>
              <p className="text-light-textSecondary">
                Basic recording equipment (camera, microphone) for quality video content.
              </p>
            </div>
            <div className="bg-neutral-sand rounded-xl p-6 border border-border-subtle">
              <FiBookOpen className="w-10 h-10 text-brand-primary mb-4" />
              <h3 className="text-lg font-bold text-light-text mb-2">Content Plan</h3>
              <p className="text-light-textSecondary">
                A structured curriculum that delivers value to students.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-4xl mx-auto text-center bg-brand-accentSoft rounded-xl p-12">
          <h2 className="text-3xl font-bold text-light-text mb-4">Ready to Start Teaching?</h2>
          <p className="text-lg text-light-textSecondary mb-8">
            Join our community of instructors and start making an impact today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-brand-primary hover:bg-brand-primaryHover text-white font-medium rounded-lg transition-colors">
              Apply Now
            </button>
            <a
              href="mailto:doflow004@gmail.com"
              className="px-8 py-3 bg-light-card hover:bg-light-cardAlt text-light-text font-medium rounded-lg transition-colors border border-border-subtle"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeInstructorPage;
