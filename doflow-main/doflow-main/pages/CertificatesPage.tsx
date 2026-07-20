import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';
import CertificateTemplate from '../src/components/CertificateTemplate';
import api from '../src/utils/api';
import { FiAward, FiDownload, FiLoader } from 'react-icons/fi';

interface Certificate {
  _id: string;
  certificateId: string;
  studentName: string;
  courseName: string;
  completionDate: string;
  courseId: {
    _id: string;
    title: string;
    thumbnail: string;
  };
}

const CertificatesPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/certificates/my-certificates');
      setCertificates(response.data.certificates);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewCertificate = async (certificate: Certificate) => {
    try {
      const response = await api.get(`/certificates/${certificate._id}`);
      setSelectedCertificate(certificate);
      setQrCode(response.data.qrCode);
    } catch (error) {
      console.error('Error fetching certificate details:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <FiLoader className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (selectedCertificate) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-light-bg dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => setSelectedCertificate(null)}
            className="mb-8 text-brand-primary hover:text-brand-primaryHover font-medium"
          >
            ← Back to My Certificates
          </button>
          <CertificateTemplate
            studentName={selectedCertificate.studentName}
            courseName={selectedCertificate.courseName}
            completionDate={selectedCertificate.completionDate}
            certificateId={selectedCertificate.certificateId}
            qrCode={qrCode}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-light-bg dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-4">
            My Certificates
          </h1>
          <p className="text-lg text-light-textSecondary dark:text-dark-muted">
            View and download your earned certificates
          </p>
        </div>

        {certificates.length === 0 ? (
          <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-12 text-center">
            <FiAward className="w-16 h-16 text-light-textMuted dark:text-dark-muted mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">
              No Certificates Yet
            </h2>
            <p className="text-light-textSecondary dark:text-dark-muted mb-8">
              Complete courses to earn certificates
            </p>
            <a
              href="/#/courses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold rounded-lg transition-all duration-200"
            >
              Browse Courses
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <div
                key={certificate._id}
                className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl overflow-hidden hover:border-brand-primary hover:shadow-lg transition-all duration-300 group"
              >
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FiAward className="w-24 h-24 text-white/20" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white p-6">
                      <FiAward className="w-16 h-16 mx-auto mb-3" />
                      <p className="text-sm font-semibold">Certificate of Completion</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2 line-clamp-2">
                    {certificate.courseName}
                  </h3>
                  <p className="text-sm text-light-textSecondary dark:text-dark-muted mb-4">
                    Issued: {new Date(certificate.completionDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs font-mono text-light-textMuted dark:text-dark-muted mb-4">
                    ID: {certificate.certificateId}
                  </p>

                  <button
                    onClick={() => viewCertificate(certificate)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    <FiDownload className="w-4 h-4" />
                    View & Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatesPage;
