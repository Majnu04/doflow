import React, { useState } from 'react';
import { FiCheckCircle, FiXCircle, FiSearch, FiLoader } from 'react-icons/fi';
import api from '../src/utils/api';

interface VerificationResult {
  valid: boolean;
  message: string;
  certificate?: {
    certificateId: string;
    studentName: string;
    courseName: string;
    completionDate: string;
    issuedAt: string;
  };
}

const CertificateVerificationPage: React.FC = () => {
  const [certificateId, setCertificateId] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const verifyCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateId.trim()) return;

    try {
      setLoading(true);
      setResult(null);
      const response = await api.get(`/certificates/verify/${certificateId.trim()}`);
      setResult(response.data);
    } catch (error: any) {
      setResult({
        valid: false,
        message: error.response?.data?.message || 'Certificate not found or invalid',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-light-bg dark:bg-dark-bg">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary/10 rounded-full mb-4">
            <FiCheckCircle className="w-8 h-8 text-brand-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-4">
            Verify Certificate
          </h1>
          <p className="text-lg text-light-textSecondary dark:text-dark-muted">
            Enter the certificate ID to verify its authenticity
          </p>
        </div>

        <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-8">
          <form onSubmit={verifyCertificate} className="mb-8">
            <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-2">
              Certificate ID
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                placeholder="e.g., DOFLOW-A1B2C3D4"
                className="flex-1 px-4 py-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg text-light-text dark:text-dark-text placeholder-light-textMuted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              <button
                type="submit"
                disabled={loading || !certificateId.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <FiLoader className="w-5 h-5 animate-spin" />
                ) : (
                  <FiSearch className="w-5 h-5" />
                )}
                Verify
              </button>
            </div>
          </form>

          {result && (
            <div
              className={`p-6 rounded-lg border-2 ${
                result.valid
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-500'
              }`}
            >
              <div className="flex items-start gap-4">
                {result.valid ? (
                  <FiCheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                ) : (
                  <FiXCircle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <h3
                    className={`text-xl font-bold mb-2 ${
                      result.valid
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-red-900 dark:text-red-100'
                    }`}
                  >
                    {result.valid ? 'Valid Certificate ✓' : 'Invalid Certificate ✗'}
                  </h3>
                  <p
                    className={`mb-4 ${
                      result.valid
                        ? 'text-green-800 dark:text-green-200'
                        : 'text-red-800 dark:text-red-200'
                    }`}
                  >
                    {result.message}
                  </p>

                  {result.certificate && (
                    <div className="space-y-3 mt-6">
                      <div className="border-t border-green-200 dark:border-green-700 pt-4">
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <p className="text-sm text-green-700 dark:text-green-300 font-semibold">
                              Certificate ID
                            </p>
                            <p className="text-base text-green-900 dark:text-green-100 font-mono">
                              {result.certificate.certificateId}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-green-700 dark:text-green-300 font-semibold">
                              Student Name
                            </p>
                            <p className="text-base text-green-900 dark:text-green-100">
                              {result.certificate.studentName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-green-700 dark:text-green-300 font-semibold">
                              Course Name
                            </p>
                            <p className="text-base text-green-900 dark:text-green-100">
                              {result.certificate.courseName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-green-700 dark:text-green-300 font-semibold">
                              Completion Date
                            </p>
                            <p className="text-base text-green-900 dark:text-green-100">
                              {new Date(result.certificate.completionDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-green-700 dark:text-green-300 font-semibold">
                              Issued On
                            </p>
                            <p className="text-base text-green-900 dark:text-green-100">
                              {new Date(result.certificate.issuedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-3">
            How to Verify
          </h3>
          <ul className="space-y-2 text-sm text-light-textSecondary dark:text-dark-muted">
            <li>• Scan the QR code on the certificate</li>
            <li>• Or enter the Certificate ID manually</li>
            <li>• The system will validate the certificate against our database</li>
            <li>• Valid certificates will show complete details</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CertificateVerificationPage;
