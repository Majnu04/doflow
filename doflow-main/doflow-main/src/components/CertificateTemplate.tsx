import React, { useRef } from 'react';
import { FiDownload, FiShare2 } from 'react-icons/fi';
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
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
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
    const text = `🎓 I just earned a certificate for completing "${courseName}" on DoFlow Academy!\n\nCertificate ID: ${certificateId}`;
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: 'DoFlow Certificate of Completion',
        text,
        url,
      });
    } else {
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
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-0">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <button
          onClick={handleDownload}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <FiDownload className="w-5 h-5" />
          Download PDF
        </button>
        <button
          onClick={handleShare}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border-2 border-gray-200 transition-all duration-300"
        >
          <FiShare2 className="w-5 h-5" />
          Share
        </button>
      </div>

      {/* Certificate - Scrollable container on mobile */}
      <div className="overflow-x-auto pb-4">
        <div
          ref={certificateRef}
          className="relative bg-white shadow-2xl min-w-[600px] sm:min-w-0"
          style={{ aspectRatio: '1.414/1' }}
        >
          {/* Simple elegant border */}
          <div className="absolute inset-2 sm:inset-4 border-2 border-orange-400 rounded" />
          <div className="absolute inset-3 sm:inset-6 border border-orange-200 rounded" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-between h-full px-6 sm:px-12 py-6 sm:py-10 text-center">
            
            {/* Header */}
            <div className="flex flex-col items-center">
              {/* Logo */}
              <div className="mb-3 sm:mb-6">
                <img src="/logo.png" alt="DoFlow" className="h-10 sm:h-14 w-auto object-contain" />
              </div>
              
              <p className="text-[10px] sm:text-sm text-gray-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1 sm:mb-2">Certificate of Completion</p>
              
              <h1 className="text-3xl sm:text-5xl font-serif text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>
                Certificate
              </h1>
            </div>

            {/* Main Content */}
            <div className="flex-grow flex flex-col justify-center py-2 sm:py-4 max-w-2xl w-full">
              <p className="text-sm sm:text-base text-gray-500 mb-2 sm:mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                This is to certify that
              </p>

              <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 pb-2 sm:pb-4" style={{ fontFamily: 'Georgia, serif' }}>
                {studentName}
              </h2>
              
              <div className="w-40 sm:w-64 h-px bg-orange-400 mx-auto mt-1 sm:mt-2 mb-3 sm:mb-6" />

              <p className="text-sm sm:text-base text-gray-500 mb-2 sm:mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                has successfully completed the course
              </p>

              <h3 className="text-lg sm:text-2xl font-semibold text-orange-600 mb-3 sm:mb-6 px-2" style={{ fontFamily: 'Georgia, serif' }}>
                {courseName}
              </h3>

              <p className="text-xs sm:text-sm text-gray-500">
                Awarded on <span className="font-medium text-gray-700">{formatDate(completionDate)}</span>
              </p>
            </div>

            {/* Footer */}
            <div className="w-full">
              <div className="flex items-end justify-between px-2 sm:px-4 gap-2">
                {/* Signature */}
                <div className="text-left flex-shrink-0">
                  <div className="w-20 sm:w-32 border-t border-gray-800 pt-1 sm:pt-2">
                    <p className="text-[10px] sm:text-sm font-semibold text-gray-800">DoFlow Academy</p>
                    <p className="text-[8px] sm:text-xs text-gray-500">Director</p>
                  </div>
                </div>

                {/* QR Code */}
                {qrCode && (
                  <div className="flex flex-col items-center flex-shrink-0">
                    <img src={qrCode} alt="Verify" className="w-10 h-10 sm:w-16 sm:h-16" />
                    <p className="text-[8px] sm:text-[10px] text-gray-400 mt-0.5 sm:mt-1">Scan to verify</p>
                  </div>
                )}

                {/* Certificate ID */}
                <div className="text-right flex-shrink-0">
                  <p className="text-[8px] sm:text-[10px] text-gray-400 uppercase tracking-wider">Certificate ID</p>
                  <p className="text-[10px] sm:text-xs font-mono text-orange-600">{certificateId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile tip */}
      <p className="text-center text-xs text-gray-400 mt-2 sm:hidden">
        Swipe left to see full certificate
      </p>
    </div>
  );
};

export default CertificateTemplate;
