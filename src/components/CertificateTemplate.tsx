import React, { useRef } from 'react';
import { FiDownload, FiShare2, FiCheckCircle } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CertificateTemplateProps {
  studentName: string;
  courseName: string;
  completionDate: string;
  certificateId: string;
  qrCode?: string;
}

const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
  studentName,
  courseName,
  completionDate,
  certificateId,
  qrCode,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`DoFlow-Certificate-${certificateId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleShare = () => {
    const text = `I just completed "${courseName}" on DoFlow! 🎓\\nCertificate ID: ${certificateId}`;
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: 'DoFlow Certificate',
        text,
        url,
      });
    } else {
      // Fallback to LinkedIn share
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        '_blank'
      );
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <FiDownload className="w-5 h-5" />
          Download Certificate
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-6 py-3 bg-light-card dark:bg-dark-card hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt text-light-text dark:text-dark-text font-semibold rounded-lg border-2 border-light-border dark:border-dark-border transition-all duration-200"
        >
          <FiShare2 className="w-5 h-5" />
          Share
        </button>
      </div>

      {/* Certificate */}
      <div
        ref={certificateRef}
        className="relative bg-white p-12 md:p-16 shadow-2xl"
        style={{
          aspectRatio: '1.414/1',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        }}
      >
        {/* Decorative Border */}
        <div
          className="absolute inset-4 border-8 border-double"
          style={{
            borderColor: '#8B5CF6',
            borderRadius: '12px',
          }}
        >
          {/* Inner border */}
          <div
            className="absolute inset-2 border-2"
            style={{
              borderColor: '#A78BFA',
              borderRadius: '8px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-between h-full text-center">
          {/* Header */}
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#8B5CF6' }}
              >
                <FiCheckCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1
              className="text-5xl md:text-6xl font-bold mb-2"
              style={{ color: '#8B5CF6', fontFamily: 'serif' }}
            >
              Certificate
            </h1>
            <h2
              className="text-3xl md:text-4xl font-semibold"
              style={{ color: '#6D28D9', fontFamily: 'serif' }}
            >
              of Completion
            </h2>
          </div>

          {/* Main Content */}
          <div className="flex-grow flex flex-col justify-center py-8">
            <p
              className="text-xl md:text-2xl mb-6"
              style={{ color: '#475569', fontFamily: 'serif' }}
            >
              This is to certify that
            </p>

            <h3
              className="text-4xl md:text-5xl font-bold mb-8"
              style={{ color: '#1E293B', fontFamily: 'serif' }}
            >
              {studentName}
            </h3>

            <p
              className="text-xl md:text-2xl mb-4"
              style={{ color: '#475569', fontFamily: 'serif' }}
            >
              has successfully completed the course
            </p>

            <h4
              className="text-3xl md:text-4xl font-bold mb-8"
              style={{ color: '#8B5CF6', fontFamily: 'serif' }}
            >
              {courseName}
            </h4>

            <p
              className="text-lg md:text-xl"
              style={{ color: '#64748B', fontFamily: 'serif' }}
            >
              Awarded on {formatDate(completionDate)}
            </p>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 w-full">
            <div className="flex items-end justify-between gap-8">
              {/* Signature */}
              <div className="flex-1">
                <div
                  className="border-t-2 pt-2 mb-1"
                  style={{ borderColor: '#8B5CF6' }}
                >
                  <p
                    className="text-lg font-semibold"
                    style={{ color: '#1E293B', fontFamily: 'serif' }}
                  >
                    DoFlow Academy
                  </p>
                  <p className="text-sm" style={{ color: '#64748B' }}>
                    Founder & Lead Instructor
                  </p>
                </div>
              </div>

              {/* QR Code */}
              {qrCode && (
                <div className="flex flex-col items-center">
                  <img src={qrCode} alt="QR Code" className="w-24 h-24 mb-1" />
                  <p className="text-xs" style={{ color: '#64748B' }}>
                    Verify Certificate
                  </p>
                </div>
              )}

              {/* Certificate ID */}
              <div className="flex-1 text-right">
                <p className="text-sm font-mono" style={{ color: '#64748B' }}>
                  Certificate ID
                </p>
                <p
                  className="text-base font-mono font-semibold"
                  style={{ color: '#8B5CF6' }}
                >
                  {certificateId}
                </p>
              </div>
            </div>

            {/* Developed by */}
            <div className="mt-6 pt-4 border-t" style={{ borderColor: '#E2E8F0' }}>
              <p className="text-xs" style={{ color: '#94A3B8' }}>
                Developed by{' '}
                <span className="font-semibold" style={{ color: '#8B5CF6' }}>
                  Elite Digital Solutions
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateTemplate;
