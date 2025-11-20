import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FiCheck, FiStar, FiClock, FiUsers, FiAward, FiTrendingUp, FiCode, FiZap, FiTarget, FiMessageCircle } from 'react-icons/fi';
import { Button, Card, Badge } from '../src/components/ui';
import { RootState } from '../src/store';
import { paymentService } from '../src/services/paymentService';
import toast from '../src/utils/toast';

const DSACourseLandingPage: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const features = [
    {
      icon: <FiCode className="w-6 h-6" />,
      title: '180+ DSA Problems',
      description: 'Carefully curated problems from easy to hard'
    },
    {
      icon: <FiZap className="w-6 h-6" />,
      title: 'Interactive Code Editor',
      description: 'Monaco editor with real-time code execution'
    },
    {
      icon: <FiTrendingUp className="w-6 h-6" />,
      title: 'Track Your Progress',
      description: 'Visual progress tracking and streak counter'
    },
    {
      icon: <FiMessageCircle className="w-6 h-6" />,
      title: 'Discussion Forum',
      description: 'Get help from community and mentors'
    }
  ];

  const roadmapSections = [
    { title: 'Basic DSA', problems: 45, color: 'from-blue-500 to-indigo-500' },
    { title: 'Intermediate DSA', problems: 60, color: 'from-indigo-500 to-purple-500' },
    { title: 'Advanced DSA', problems: 50, color: 'from-purple-500 to-pink-500' },
    { title: 'Miscellaneous', problems: 25, color: 'from-pink-500 to-orange-500' }
  ];

  const testimonials = [
    {
      name: 'Rahul Sharma',
      role: 'SDE @ Google',
      image: 'https://randomuser.me/api/portraits/men/1.jpg',
      content: 'The DSA roadmap helped me crack my Google interview. The structured approach is amazing!',
      rating: 5
    },
    {
      name: 'Priya Singh',
      role: 'SDE @ Microsoft',
      image: 'https://randomuser.me/api/portraits/women/2.jpg',
      content: 'Best platform for learning DSA. The code editor and test cases are incredibly helpful.',
      rating: 5
    },
    {
      name: 'Amit Kumar',
      role: 'SDE @ Amazon',
      image: 'https://randomuser.me/api/portraits/men/3.jpg',
      content: 'Went from zero to hero in DSA. Got my dream job thanks to this platform!',
      rating: 5
    }
  ];

  const mentors = [
    {
      name: 'Vikram Patel',
      role: 'Ex-Google, Competitive Programmer',
      image: 'https://randomuser.me/api/portraits/men/4.jpg',
      students: '10K+',
      rating: '4.9'
    },
    {
      name: 'Ananya Desai',
      role: 'Ex-Microsoft, DSA Expert',
      image: 'https://randomuser.me/api/portraits/women/5.jpg',
      students: '8K+',
      rating: '4.8'
    },
    {
      name: 'Rohan Mehta',
      role: 'Ex-Amazon, System Design',
      image: 'https://randomuser.me/api/portraits/men/6.jpg',
      students: '12K+',
      rating: '4.9'
    }
  ];

  const pricingPlans = [
    {
      name: 'Free',
      title: 'Free',
      price: '0',
      courseId: '691ecb7a6ee4a56d59c403a9', // DSA Free Course ID from database
      features: [
        'Access to Basic DSA section',
        '45 Problems',
        'Code Editor',
        'Community Support'
      ],
      isPopular: false
    },
    {
      name: 'Pro',
      title: 'Pro',
      price: '2,999',
      originalPrice: '4,999',
      courseId: '691ecb7a6ee4a56d59c403a9', // Using same course ID (will be paid in future)
      features: [
        'All 180+ Problems',
        'All DSA Sections',
        'Priority Support',
        'Discussion Forum',
        'Ask AI Helper',
        'Lifetime Access',
        'Certificate on Completion'
      ],
      isPopular: true
    },
    {
      name: 'Enterprise',
      title: 'Enterprise',
      price: '9,999',
      courseId: '691ecb7a6ee4a56d59c403a9', // Using same course ID (will be paid in future)
      features: [
        'Everything in Pro',
        '1-on-1 Mentorship',
        'Mock Interviews',
        'Resume Review',
        'Job Referrals',
        'Private Discord Channel'
      ],
      isPopular: false
    }
  ];

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleEnrollClick = async (plan: any) => {
    // Check authentication
    if (!isAuthenticated) {
      toast.error('Please login to enroll in this course');
      window.location.hash = '/auth';
      return;
    }

    setProcessingPlan(plan.title);

    try {
      const priceNum = parseInt(plan.price.replace(/,/g, ''));

      // Handle free plan
      if (priceNum === 0) {
        try {
          // Enroll in free course
          await paymentService.enrollInFreeCourse(plan.courseId);
          toast.success('Successfully enrolled in the DSA course!');
          window.location.hash = '/dsa-roadmap';
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to enroll. Please try again.');
        } finally {
          setProcessingPlan(null);
        }
        return;
      }

      // Handle paid plans with Razorpay
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway. Please try again.');
        setProcessingPlan(null);
        return;
      }

      // Create order - use the courseId from plan
      const orderData = await paymentService.createOrder(plan.courseId);

      // Configure Razorpay options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'DoFlow Academy',
        description: `DSA Course - ${plan.title} Plan`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              enrollmentId: orderData.enrollmentId
            });

            toast.success('Payment successful! Welcome to DSA ' + plan.title + ' plan!');
            window.location.hash = '/dsa-roadmap';
          } catch (error: any) {
            toast.error(error.response?.data?.message || 'Payment verification failed');
          } finally {
            setProcessingPlan(null);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#7C3AED'
        },
        modal: {
          ondismiss: () => {
            setProcessingPlan(null);
            toast.info('Payment cancelled');
          }
        }
      };

      // Open Razorpay checkout
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Enrollment error:', error);
      toast.error(error.response?.data?.message || 'Failed to enroll. Please try again.');
      setProcessingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-light-bg">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full text-sm font-medium border border-brand-primary/20">
                🚀 Master DSA & Get Your Dream Job
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-light-text">
              Complete DSA
              <br />
              <span className="text-brand-primary">Roadmap Course</span>
            </h1>
            <p className="text-xl text-light-textSecondary mb-8 max-w-3xl mx-auto">
              180+ carefully curated problems with interactive code editor, test cases,
              and AI-powered assistance. From zero to hero in DSA.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                variant="primary"
                size="lg"
                onClick={() => window.location.hash = '/dsa-roadmap'}
                className="bg-brand-primary hover:bg-brand-primaryHover shadow-md"
              >
                Start Learning Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-light-border text-light-text hover:bg-light-cardAlt"
              >
                View Pricing
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {[
              { icon: <FiUsers />, value: '50K+', label: 'Students' },
              { icon: <FiCode />, value: '180+', label: 'Problems' },
              { icon: <FiAward />, value: '95%', label: 'Success Rate' },
              { icon: <FiClock />, value: '24/7', label: 'Support' }
            ].map((stat, index) => (
              <div key={index} className="bg-light-card border border-light-border rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-brand-primary text-3xl mb-2 flex justify-center">{stat.icon}</div>
                <div className="text-3xl font-bold text-light-text mb-1">{stat.value}</div>
                <div className="text-light-textMuted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-light-cardAlt">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-light-text mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-light-textSecondary text-lg">Everything you need to master Data Structures & Algorithms</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-light-card border border-light-border rounded-lg p-6 shadow-sm hover:shadow-md transition-all">
                <div className="text-brand-primary mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-light-text mb-2">{feature.title}</h3>
                <p className="text-light-textSecondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Overview */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-light-text mb-4">
              Structured DSA Roadmap
            </h2>
            <p className="text-light-textSecondary text-lg">Progress from basics to advanced with our carefully designed curriculum</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roadmapSections.map((section, index) => (
              <div key={index} className="bg-light-card border border-light-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${section.color} mb-4 flex items-center justify-center text-white font-bold text-xl`}>
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-light-text mb-2">{section.title}</h3>
                <p className="text-brand-primary font-semibold">{section.problems} Problems</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-light-cardAlt">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-light-text mb-4">
              Choose Your Plan
            </h2>
            <p className="text-light-textSecondary text-lg">Start free and upgrade when you're ready</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative bg-light-card border rounded-lg p-8 shadow-sm ${plan.isPopular ? 'border-brand-gold shadow-md ring-2 ring-brand-gold/20' : 'border-light-border'}`}>
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-block px-4 py-1 bg-brand-gold text-white rounded-full text-sm font-semibold">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-light-text mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-light-text">₹{plan.price}</span>
                  {plan.originalPrice && (
                    <span className="text-xl text-light-textMuted line-through ml-2">₹{plan.originalPrice}</span>
                  )}
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3 text-light-textSecondary">
                      <FiCheck className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.isPopular ? "primary" : "outline"}
                  size="lg"
                  className={`w-full ${plan.isPopular ? 'bg-brand-primary hover:bg-brand-primaryHover' : 'border-light-border hover:bg-light-cardAlt'}`}
                  disabled={processingPlan === plan.title}
                  onClick={() => handleEnrollClick(plan)}
                >
                  {processingPlan === plan.title ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    plan.price === '0' ? 'Get Started Free' : 'Enroll Now'
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-light-text mb-4">
              Success Stories
            </h2>
            <p className="text-light-textSecondary text-lg">Hear from students who landed their dream jobs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-light-card border border-light-border rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="w-5 h-5 text-brand-gold fill-current" />
                  ))}
                </div>
                <p className="text-light-textSecondary mb-6">{testimonial.content}</p>
                <div className="flex items-center gap-3">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full border-2 border-light-border" />
                  <div>
                    <div className="text-light-text font-semibold">{testimonial.name}</div>
                    <div className="text-light-textMuted text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mentors Section */}
      <section className="py-20 px-4 bg-light-cardAlt">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-light-text mb-4">
              Learn From The Best
            </h2>
            <p className="text-light-textSecondary text-lg">Industry experts and competitive programmers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {mentors.map((mentor, index) => (
              <div key={index} className="bg-light-card border border-light-border rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <img src={mentor.image} alt={mentor.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-brand-primary" />
                <h3 className="text-xl font-bold text-light-text mb-1">{mentor.name}</h3>
                <p className="text-light-textSecondary mb-3">{mentor.role}</p>
                <div className="flex justify-center gap-4 text-sm">
                  <div className="text-brand-primary">
                    <FiUsers className="inline mr-1" />
                    {mentor.students}
                  </div>
                  <div className="text-brand-gold">
                    <FiStar className="inline mr-1" />
                    {mentor.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-lg p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-light-text mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-light-textSecondary text-lg mb-8">
              Join 50,000+ students and land your dream tech job
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => window.location.hash = '/auth'}
              className="bg-brand-primary hover:bg-brand-primaryHover shadow-md"
            >
              Get Started for Free
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DSACourseLandingPage;
