import React from 'react';
import { FaLock, FaCrown, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui';

interface PremiumContentLockProps {
  courseName: string;
  originalPrice: number;
  discountPrice: number;
  premiumFeatures: string[];
  courseId: string;
  lessonTitle?: string;
  variant?: 'full' | 'inline';
  onUpgrade?: () => void;
}

const PremiumContentLock: React.FC<PremiumContentLockProps> = ({
  courseName,
  originalPrice,
  discountPrice,
  premiumFeatures,
  courseId,
  lessonTitle,
  variant = 'full',
  onUpgrade
}) => {
  const navigate = useNavigate();
  const discountPercent = Math.round((1 - discountPrice / originalPrice) * 100);

  const handleUpgrade = () => {
    if (onUpgrade) onUpgrade();
    navigate(`/#/checkout/${courseId}`);
  };

  if (variant === 'inline') {
    return (
      <div className="relative bg-gradient-to-br from-orange-50/80 to-amber-50/60 rounded-2xl border border-orange-200/60 p-6 sm:p-8 backdrop-blur-sm">
        <div className="absolute top-4 right-4">
          <span className="badge-premium">
            <FaCrown className="w-3 h-3" />
            PREMIUM
          </span>
        </div>

        <div className="text-center max-w-md mx-auto">
          <div className="w-14 h-14 bg-gradient-to-br from-brand-primary to-brand-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-brand">
            <FaLock className="w-6 h-6 text-white" />
          </div>

          <h3 className="text-lg font-bold text-light-text mb-1.5">
            Premium Content
          </h3>
          
          {lessonTitle && (
            <p className="text-sm text-light-textSecondary mb-4">
              <strong className="text-light-text">{lessonTitle}</strong> is available in the premium version
            </p>
          )}

          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="text-2xl font-bold text-brand-primary">
              ₹{discountPrice}
            </span>
            <span className="text-sm text-light-textMuted line-through">
              ₹{originalPrice}
            </span>
            <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-xs font-semibold">
              {discountPercent}% OFF
            </span>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon={<FaCrown className="w-4 h-4" />}
            iconPosition="left"
            onClick={handleUpgrade}
          >
            Unlock Full Course
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-3xl w-full">
        {/* Main Lock Card */}
        <div className="bg-light-card rounded-3xl shadow-elevated border border-border-subtle overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-brand-primary to-brand-accent p-8 sm:p-10 text-white text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <FaLock className="w-8 h-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Unlock Premium Access
              </h1>
              {lessonTitle && (
                <p className="text-white/80 text-sm">
                  "{lessonTitle}" requires premium membership
                </p>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="p-6 sm:p-8 border-b border-border-subtle/50">
            <div className="text-center mb-6">
              <p className="text-light-textSecondary text-sm mb-3">
                Get full access to <strong className="text-light-text">{courseName}</strong>
              </p>
              <div className="flex items-center justify-center gap-4 mb-3">
                <span className="text-4xl sm:text-5xl font-bold text-brand-primary">
                  ₹{discountPrice}
                </span>
                <div className="text-left">
                  <div className="text-lg text-light-textMuted line-through">
                    ₹{originalPrice}
                  </div>
                  <div className="text-sm font-semibold text-emerald-600">
                    Save {discountPercent}%
                  </div>
                </div>
              </div>
              <p className="text-xs text-light-textMuted">
                One-time payment · Lifetime access · No hidden fees
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={<FaCrown className="w-5 h-5" />}
              iconPosition="left"
              onClick={handleUpgrade}
            >
              Upgrade to Premium Now
            </Button>

            <p className="text-center text-xs text-light-textMuted mt-3">
              Secure payment · Money-back guarantee
            </p>
          </div>

          {/* Features */}
          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-bold text-light-text mb-5 text-center">
              What You'll Get with Premium
            </h2>

            <div className="grid sm:grid-cols-2 gap-2.5">
              {premiumFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2.5 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100/60"
                >
                  <FaCheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-light-text">{feature}</span>
                </div>
              ))}
            </div>

            {/* Social Proof */}
            <div className="mt-6 p-4 bg-light-cardAlt/60 rounded-xl border border-border-subtle/40 text-center">
              <p className="text-sm text-light-textSecondary">
                <strong className="text-light-text">1,000+</strong> students have already upgraded and are crushing their goals!
              </p>
            </div>
          </div>
        </div>

        {/* Money Back */}
        <p className="text-center text-xs text-light-textMuted mt-4">
          Not satisfied? Get a full refund within 7 days, no questions asked.
        </p>
      </div>
    </div>
  );
};

export default PremiumContentLock;
